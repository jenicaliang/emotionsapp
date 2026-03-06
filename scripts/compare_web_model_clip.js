const fs = require("fs");
const path = require("path");
const tf = require("@tensorflow/tfjs");
require("@tensorflow/tfjs-node");

const CLASS_NAMES = [
  "Unknown",
  "Happy",
  "Sad",
  "Neutral",
  "Angry",
  "Surprise",
  "Disgust",
  "Fear",
];

function listFrameFiles(framesDir) {
  const all = fs
    .readdirSync(framesDir)
    .filter((f) => /\.(jpg|jpeg|png)$/i.test(f))
    .sort((a, b) => a.localeCompare(b))
    .map((f) => path.join(framesDir, f));
  return all;
}

async function loadClipTensor(framesDir) {
  const paths = listFrameFiles(framesDir).slice(0, 16);
  if (paths.length === 0) {
    throw new Error(`No .jpg/.jpeg/.png frames found in ${framesDir}`);
  }

  while (paths.length < 16) {
    paths.push(paths[paths.length - 1]);
  }

  const frames = [];
  for (const p of paths) {
    const raw = fs.readFileSync(p);
    const decoded = tf.node.decodeImage(raw, 3);
    const resized = tf.image.resizeBilinear(decoded, [224, 224]);
    frames.push(resized.toFloat()); // raw RGB [0..255] to match teammate snippet
    decoded.dispose();
    resized.dispose();
  }

  const clip = tf.stack(frames).expandDims(0); // [1,16,224,224,3]
  frames.forEach((t) => t.dispose());
  return { clip, paths };
}

async function main() {
  const framesDir = process.argv[2] || "frames";
  const modelPath = process.argv[3] || "file://./public/web_model/model.json";

  console.log(`Loading web model: ${modelPath}`);
  const model = await tf.loadGraphModel(modelPath);
  console.log(`Model input: ${JSON.stringify(model.inputs[0]?.shape)}`);
  console.log(`Model output: ${JSON.stringify(model.outputs[0]?.shape)}`);

  const { clip, paths } = await loadClipTensor(framesDir);
  console.log(`Using ${paths.length} frames from: ${framesDir}`);
  console.log(`First frame: ${paths[0]}`);
  console.log(`Last frame:  ${paths[paths.length - 1]}`);

  const out = model.execute(clip);
  const tensor = Array.isArray(out) ? out[0] : out;
  const probs = Array.from(await tensor.data());

  const ranked = CLASS_NAMES.map((name, i) => ({ name, p: probs[i] || 0 }))
    .sort((a, b) => b.p - a.p);

  console.log("\nRaw probs (teammate class order):");
  CLASS_NAMES.forEach((name, i) => {
    console.log(`${name.padEnd(10)} ${(probs[i] || 0).toFixed(8)}`);
  });

  console.log("\nRanked:");
  ranked.forEach((x) => {
    console.log(`${x.name.padEnd(10)} ${(x.p * 100).toFixed(2)}%`);
  });

  console.log(`\nPrediction: ${ranked[0]?.name || "Unknown"}`);

  if (Array.isArray(out)) out.forEach((t) => t.dispose());
  else out.dispose();
  clip.dispose();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
