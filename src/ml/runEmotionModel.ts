// src/ml/runEmotionModel.ts
import * as tf from "@tensorflow/tfjs";
import { cropFace224 } from "./cropFace224";
import { sampleFrames } from "./utils";

// 7 classes to match saved_model (3.15) output shape (-1, 7). Order must match training.
const labels = [
  "Happy",
  "Sad",
  "Neutral",
  "Angry",
  "Surprise",
  "Disgust",
  "Fear",
] as const;

export type EmotionLabel = (typeof labels)[number];

export type FaceBox = {
  originX: number;
  originY: number;
  width: number;
  height: number;
  frameW?: number;
  frameH?: number;
};

export type EmotionResult = {
  label: EmotionLabel;
  box: FaceBox | null;
  probs: number[];
  debugCrop: ImageData | null; // <-- ADD THIS
};

let model: tf.GraphModel | null = null;
const MODEL_URL = "/web_model/model.json";

type PreprocessMode =
  | "raw_rgb255"
  | "zero_one_rgb"
  | "minus1_to_1_rgb"
  | "imagenet_bgr";
// predict.py uses tf.keras.applications.resnet50.preprocess_input,
// which matches ImageNet BGR mean subtraction.
const PREPROCESS_MODE: PreprocessMode = "imagenet_bgr";
const COMPARE_PREPROCESS_MODES = false;
const EVAL_STORAGE_KEY = "emotion_eval_confusion_v1";

export async function loadEmotionModel() {
  if (!model) {
    await tf.ready();
    console.log(`Loading model from ${MODEL_URL}...`);
    model = await tf.loadGraphModel(MODEL_URL);

    console.log("✅ Model loaded successfully");
    console.log("MODEL INPUT SHAPE:", model.inputs[0]?.shape);
    console.log("MODEL OUTPUT SHAPE:", model.outputs[0]?.shape);

    // Test with zero input to see what model outputs
    console.log("Running model diagnostics...");
    const zeroTest = tf.zeros([1, 16, 224, 224, 3], "float32");
    const zeroOut = model.execute(zeroTest);
    const zeroTensor = Array.isArray(zeroOut) ? zeroOut[0]! : zeroOut;
    const zeroData = Array.from(await zeroTensor.data());
    console.log("Zero input output:", zeroData.map((x: number) => x.toFixed(4)).join(", "));

    if (Array.isArray(zeroOut)) zeroOut.forEach((t: tf.Tensor) => t.dispose());
    else zeroOut.dispose();
    zeroTest.dispose();

    // Test with random input
    const randTest = tf.randomUniform([1, 16, 224, 224, 3]);
    const randOut = model.execute(randTest);
    const randTensor = Array.isArray(randOut) ? randOut[0]! : randOut;
    const randData = Array.from(await randTensor.data());
    console.log("Random input output:", randData.map((x: number) => x.toFixed(4)).join(", "));

    const mean = randData.reduce((a, b) => a + b, 0) / randData.length;
    const variance =
      randData.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / randData.length;
    const stdDev = Math.sqrt(variance);
    if (stdDev < 0.01) {
      console.warn(
        "⚠️ Output distribution is near-uniform. Verify preprocessing and source model."
      );
    }

    if (Array.isArray(randOut)) randOut.forEach((t: tf.Tensor) => t.dispose());
    else randOut.dispose();
    randTest.dispose();

    console.log("✅ Model loaded and diagnostic check completed");
  }
  return model;
}

function argmax(xs: number[]) {
  let bestIdx = 0;
  let bestVal = xs[0] ?? -Infinity;
  for (let i = 1; i < xs.length; i++) {
    if (xs[i] > bestVal) {
      bestVal = xs[i];
      bestIdx = i;
    }
  }
  return bestIdx;
}

function parseExpectedLabelFromUrl(): EmotionLabel | null {
  if (typeof window === "undefined") return null;
  const v = new URLSearchParams(window.location.search).get("expected");
  if (!v) return null;
  const norm = v.trim().toLowerCase();
  const found = labels.find((l) => l.toLowerCase() === norm);
  return found ?? null;
}

function updateAndLogConfusion(expected: EmotionLabel, predicted: EmotionLabel) {
  if (typeof window === "undefined") return;
  const empty = {
    labels: Array.from(labels),
    counts: labels.map(() => labels.map(() => 0)),
    total: 0,
  };
  let data = empty;
  try {
    const raw = window.localStorage.getItem(EVAL_STORAGE_KEY);
    if (raw) data = JSON.parse(raw);
  } catch {
    data = empty;
  }

  const e = labels.indexOf(expected);
  const p = labels.indexOf(predicted);
  if (e >= 0 && p >= 0) {
    data.counts[e][p] += 1;
    data.total += 1;
  }

  window.localStorage.setItem(EVAL_STORAGE_KEY, JSON.stringify(data));

  const rowObjects = labels.map((rowLabel, rowIdx) => {
    const row: Record<string, number | string> = { expected: rowLabel };
    for (let colIdx = 0; colIdx < labels.length; colIdx++) {
      row[labels[colIdx]] = data.counts[rowIdx][colIdx];
    }
    return row;
  });

  console.log(
    `📊 Eval updated | expected=${expected}, predicted=${predicted}, total=${data.total}`
  );
  console.table(rowObjects);
}

function preprocessFrames(
  picked: ImageData[],
  mode: PreprocessMode
): tf.Tensor5D {
  return tf.tidy(() => {
    const tensors = picked.map((im) => tf.browser.fromPixels(im).toFloat());
    const stacked = tf.stack(tensors); // [16,224,224,3], RGB in [0..255]

    let processed: tf.Tensor4D;
    if (mode === "imagenet_bgr") {
      const bgr = tf.reverse(stacked, -1); // RGB -> BGR
      const mean = tf.tensor1d([103.939, 116.779, 123.68], "float32");
      processed = bgr.sub(mean) as tf.Tensor4D;
      bgr.dispose();
      mean.dispose();
    } else if (mode === "minus1_to_1_rgb") {
      processed = stacked.div(127.5).sub(1) as tf.Tensor4D;
    } else if (mode === "zero_one_rgb") {
      processed = stacked.div(255) as tf.Tensor4D;
    } else {
      // raw_rgb255: pass RGB values in [0..255] unchanged
      processed = stacked as tf.Tensor4D;
    }

    const batched = processed.expandDims(0) as tf.Tensor5D; // [1,16,224,224,3]
    tensors.forEach((t) => t.dispose());
    stacked.dispose();
    processed.dispose();
    return batched;
  });
}

function resizeFrameTo224(frame: ImageData): ImageData {
  const src = document.createElement("canvas");
  src.width = frame.width;
  src.height = frame.height;
  const sctx = src.getContext("2d", { willReadFrequently: true });
  if (!sctx) return frame;
  sctx.putImageData(frame, 0, 0);

  const out = document.createElement("canvas");
  out.width = 224;
  out.height = 224;
  const octx = out.getContext("2d", { willReadFrequently: true });
  if (!octx) return frame;
  // Preserve aspect ratio by center-cropping to square before resize.
  const side = Math.min(frame.width, frame.height);
  const sx = Math.floor((frame.width - side) / 2);
  const sy = Math.floor((frame.height - side) / 2);
  octx.drawImage(src, sx, sy, side, side, 0, 0, 224, 224);
  return octx.getImageData(0, 0, 224, 224);
}

export async function runEmotionModel(frames: ImageData[]): Promise<EmotionResult> {
  const m = await loadEmotionModel();

  console.log(`\n🎬 Processing ${frames.length} frames...`);

  // 1) Build inference frames with moderate face cropping (fallback to resized full frame).
  let lastBox: FaceBox | null = null;
  let debugCrop: ImageData | null = null;

  // 2) Match predict.py frame handling: uniform sampling to 16 (+ pad-last if short).
  const picked = sampleFrames(frames, 16);
  if (picked.length !== 16) {
    throw new Error(`Expected 16 frames after sampling, got ${picked.length}`);
  }
  const prepared: ImageData[] = [];
  for (const frame of picked) {
    const res = await cropFace224(frame);
    if (res?.image) {
      prepared.push(res.image);
      debugCrop = res.image;
      lastBox = res.box ?? lastBox;
    } else {
      const resized = resizeFrameTo224(frame);
      prepared.push(resized);
      debugCrop = resized;
    }
  }

  if (!lastBox) {
    console.warn("⚠️ Face detection unavailable; using resized full frames.");
  }

  // Log raw pixel stats for first picked frame before preprocessing.
  const first = prepared[0];
  if (first) {
    const data = first.data;
    let minVal = data[0] ?? 0;
    let maxVal = data[0] ?? 0;
    for (let i = 0; i < data.length; i += 100) {
      minVal = Math.min(minVal, data[i]!);
      maxVal = Math.max(maxVal, data[i]!);
    }
    console.log(`Frame 0 pixel range: [${minVal}, ${maxVal}]`);
  }

  // 3) build input tensor [1,16,224,224,3] using selected preprocessing.
  const input = preprocessFrames(prepared, PREPROCESS_MODE);

  try {
    console.log("=== MODEL INFERENCE START ===");
    console.log("Input tensor shape:", input.shape);
    console.log("Frames prepared for model:", prepared.length);
    
    // Check input range
    const inputData = await input.data();
    let inputMin = Infinity, inputMax = -Infinity;
    for (let i = 0; i < inputData.length; i += 10000) {
      inputMin = Math.min(inputMin, inputData[i]!);
      inputMax = Math.max(inputMax, inputData[i]!);
    }
    console.log(
      `Preprocess mode: ${PREPROCESS_MODE} | Input tensor value range: [${inputMin.toFixed(
        6
      )}, ${inputMax.toFixed(6)}]`
    );
    if (inputMax < 0.01) console.warn("⚠️ WARNING: Input tensor is nearly all zeros!");
    
    const modelOut = m.execute(input);
    const out = (Array.isArray(modelOut) ? modelOut[0] : modelOut) as tf.Tensor;
    console.log("Output tensor shape:", out.shape);
    
    const probs = Array.from(await out.data());
    console.log("Raw model output (already softmaxed):", probs.map(p => p.toFixed(6)));
    console.log("Output array length:", probs.length);
    
    // NOTE: Model already applies softmax internally, so probs are already probabilities
    // Do NOT apply softmax again!
    
    // Check for NaN/Infinity
    const hasNaN = probs.some(p => !isFinite(p));
    if (hasNaN) {
      console.warn("⚠️ WARNING: Model output contains NaN or Infinity!");
    }
    
    // Check variance of output
    const mean = probs.reduce((a, b) => a + b, 0) / probs.length;
    const variance = probs.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / probs.length;
    const stdDev = Math.sqrt(variance);
    console.log(`Probability stats - Mean: ${mean.toFixed(6)}, StdDev: ${stdDev.toFixed(6)}`);
    
    const finalProbs = probs;
    console.log("Label mapping: none (direct model output)");

    const bestIdx = argmax(finalProbs);
    const bestScore = finalProbs[bestIdx] ?? 0;
    console.log(
      `Best emotion index: ${bestIdx}, confidence: ${(bestScore * 100).toFixed(
        1
      )}%, emotion: ${labels[bestIdx]}`
    );
    console.log(
      "All probability scores:",
      labels.map((l, i) => `${l}: ${(finalProbs[i]! * 100).toFixed(1)}%`).join(" | ")
    );

    if (COMPARE_PREPROCESS_MODES) {
      const otherModes: PreprocessMode[] = [
        "raw_rgb255",
        "zero_one_rgb",
        "minus1_to_1_rgb",
        "imagenet_bgr",
      ].filter((m) => m !== PREPROCESS_MODE) as PreprocessMode[];
      for (const mode of otherModes) {
        const dbgInput = preprocessFrames(prepared, mode);
        const dbgOut = m.execute(dbgInput);
        const dbgTensor = (Array.isArray(dbgOut) ? dbgOut[0] : dbgOut) as tf.Tensor;
        const dbgRaw = Array.from(await dbgTensor.data());
        const dbgMapped = dbgRaw;
        const dbgBestIdx = argmax(dbgMapped);
        console.log(
          `[Compare] ${mode}: ${labels[dbgBestIdx]} (${(
            (dbgMapped[dbgBestIdx] ?? 0) * 100
          ).toFixed(1)}%)`
        );
        if (Array.isArray(dbgOut)) dbgOut.forEach((t: tf.Tensor) => t.dispose());
        else dbgOut.dispose();
        dbgInput.dispose();
      }
    }
    
    if (finalProbs.length !== labels.length) {
      console.warn(
        `⚠️ Output class count mismatch: got ${finalProbs.length}, expected ${labels.length}`
      );
    }

    const label = labels[bestIdx] ?? "Neutral";
    const expected = parseExpectedLabelFromUrl();
    if (expected) {
      updateAndLogConfusion(expected, label);
    } else {
      console.log(
        "Eval note: add ?expected=Happy|Sad|Angry|... to URL to track confusion matrix"
      );
    }
    console.log("=== MODEL INFERENCE END ===\n");

    if (Array.isArray(modelOut)) {
      modelOut.forEach((t: tf.Tensor) => t.dispose());
    } else {
      modelOut.dispose();
    }
    return { label, box: lastBox, probs: finalProbs, debugCrop };
  } finally {
    input.dispose();
  }
}
