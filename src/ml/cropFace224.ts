import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";

export type FaceBox = {
  originX: number;
  originY: number;
  width: number;
  height: number;
  frameW: number;
  frameH: number;
};

let detector: FaceDetector | null = null;

async function getDetector() {
  if (detector) return detector;

  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

  detector = await FaceDetector.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
    },
    runningMode: "IMAGE",
  });

  return detector;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function centerCropSquareBounds(width: number, height: number) {
  const side = Math.min(width, height);
  const x = Math.floor((width - side) / 2);
  const y = Math.floor((height - side) / 2);
  return { x, y, w: side, h: side };
}

/**
 * Takes a 224×224 ImageData frame (from your capture canvas),
 * detects the face, and returns:
 *  - `image`: a 224×224 face crop ImageData
 *  - `box`: the face box in *frame coordinates* (224×224) for drawing an overlay
 */
export async function cropFace224(
  frame: ImageData
): Promise<{ image: ImageData; box: FaceBox } | null> {
  const det = await getDetector();

  // MediaPipe detector accepts ImageData directly
  const result = det.detect(frame);
  
  if (!result.detections?.length) {
    console.warn("❌ No face detected in frame");
    return null;
  }

  const bb = result.detections[0]?.boundingBox;
  if (!bb) {
    console.warn("❌ Face detected but no bounding box");
    return null;
  }

  console.log(`✅ Face detected: origin(${bb.originX?.toFixed(1)}, ${bb.originY?.toFixed(1)}), size(${bb.width?.toFixed(1)}x${bb.height?.toFixed(1)})`);

  const frameW = frame.width;
  const frameH = frame.height;

  // MediaPipe bbox is in pixels for ImageData input
  const originX = bb.originX ?? 0;
  const originY = bb.originY ?? 0;
  const width = bb.width ?? 0;
  const height = bb.height ?? 0;

  // Match predict.py crop_face(padding=0.3):
  // face rectangle + 30% margin on each axis, then resize to 224x224.
  const PADDING = 0.3;
  const padX = Math.floor(width * PADDING);
  const padY = Math.floor(height * PADDING);
  let sx = Math.floor(originX - padX);
  let sy = Math.floor(originY - padY);
  let sw = Math.floor(width + 2 * padX);
  let sh = Math.floor(height + 2 * padY);

  // Clamp crop to frame bounds
  sx = clamp(sx, 0, frameW - 1);
  sy = clamp(sy, 0, frameH - 1);
  sw = clamp(sw, 1, frameW - sx);
  sh = clamp(sh, 1, frameH - sy);
  if (sw <= 1 || sh <= 1) {
    const c = centerCropSquareBounds(frameW, frameH);
    sx = c.x;
    sy = c.y;
    sw = c.w;
    sh = c.h;
  }

  // Draw full frame into tmp canvas
  const tmp = document.createElement("canvas");
  tmp.width = frameW;
  tmp.height = frameH;

  const tctx = tmp.getContext("2d", { willReadFrequently: true });
  if (!tctx) return null;

  tctx.putImageData(frame, 0, 0);

  // Draw crop into 224×224 output
  const outCanvas = document.createElement("canvas");
  outCanvas.width = 224;
  outCanvas.height = 224;

  const octx = outCanvas.getContext("2d", { willReadFrequently: true });
  if (!octx) return null;

  octx.drawImage(tmp, sx, sy, sw, sh, 0, 0, 224, 224);

  const cropped = octx.getImageData(0, 0, 224, 224);
  
  // Log pixel stats of the crop
  const data = cropped.data;
  let minPx = data[0] ?? 0;
  let maxPx = data[0] ?? 0;
  for (let i = 0; i < data.length; i += 100) {
    minPx = Math.min(minPx, data[i]!);
    maxPx = Math.max(maxPx, data[i]!);
  }
  console.log(`  Crop pixel range: [${minPx}, ${maxPx}]`);

  return {
    image: cropped,
    box: { originX, originY, width, height, frameW, frameH },
  };
}
