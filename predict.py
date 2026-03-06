"""
DFEW Facial Expression Prediction Script

Runs the trained DFEWClassifier on a single image or video file.
Automatically detects and crops the face using MediaPipe before prediction.

Usage:
    python predict.py --input photo.jpg --weights output/fold3/phase2/best.weights.h5
    python predict.py --input video.mov --weights output/fold3/phase2/best.weights.h5
"""

import argparse
import os
import sys

import cv2
import numpy as np
import tensorflow as tf
try:
    import mediapipe as mp
except Exception:
    mp = None

from train import Config, build_model

CLASS_NAMES = [
    "Unknown", "Happy", "Sad", "Neutral",
    "Angry", "Surprise", "Disgust", "Fear",
]

NUM_FRAMES = 16
IMAGE_SIZE = 224


def get_face_detector():
    if mp is None:
        raise RuntimeError(
            "MediaPipe is not available. Install it with: pip install mediapipe "
            "or run with --no-face-detect."
        )
    if hasattr(mp, "solutions"):
        return mp.solutions.face_detection.FaceDetection(
            model_selection=1, min_detection_confidence=0.5,
        )
    # Compatibility fallback for some builds where solutions is nested differently.
    from mediapipe.python import solutions as mp_solutions
    return mp_solutions.face_detection.FaceDetection(
        model_selection=1, min_detection_confidence=0.5,
    )


def trim_black_borders(image_rgb: np.ndarray, threshold: int = 10) -> np.ndarray:
    """Remove constant black borders introduced by face alignment/rotation."""
    mask = np.any(image_rgb > threshold, axis=2)
    ys, xs = np.where(mask)
    if len(xs) == 0 or len(ys) == 0:
        return image_rgb
    x1, x2 = int(xs.min()), int(xs.max()) + 1
    y1, y2 = int(ys.min()), int(ys.max()) + 1
    return image_rgb[y1:y2, x1:x2]


def center_crop_square(image_rgb: np.ndarray) -> np.ndarray:
    h, w = image_rgb.shape[:2]
    side = min(h, w)
    y1 = (h - side) // 2
    x1 = (w - side) // 2
    return image_rgb[y1:y1 + side, x1:x1 + side]


def crop_face(
    image_rgb: np.ndarray,
    detector,
    padding: float = 0.3,
    use_face_detection: bool = True,
) -> np.ndarray:
    """Detect the largest face and crop with padding to remove black borders.

    Args:
        image_rgb: HxWx3 uint8 RGB image.
        detector: MediaPipe FaceDetection instance.
        padding: Fraction of the bounding box to add as margin (0.3 = 30%).

    Returns:
        224x224x3 uint8 RGB face crop.
    """
    image_rgb = trim_black_borders(image_rgb)

    if not use_face_detection:
        return cv2.resize(center_crop_square(image_rgb), (IMAGE_SIZE, IMAGE_SIZE))

    h, w = image_rgb.shape[:2]
    results = detector.process(image_rgb)

    if not results.detections:
        return cv2.resize(center_crop_square(image_rgb), (IMAGE_SIZE, IMAGE_SIZE))

    best = max(results.detections, key=lambda d: d.score[0])
    box = best.location_data.relative_bounding_box

    bw, bh = box.width * w, box.height * h
    pad_x = int(bw * padding)
    pad_y = int(bh * padding)

    x1 = max(0, int(box.xmin * w) - pad_x)
    y1 = max(0, int(box.ymin * h) - pad_y)
    x2 = min(w, int((box.xmin + box.width) * w) + pad_x)
    y2 = min(h, int((box.ymin + box.height) * h) + pad_y)

    face = image_rgb[y1:y2, x1:x2]
    if face.size == 0:
        return cv2.resize(center_crop_square(image_rgb), (IMAGE_SIZE, IMAGE_SIZE))
    return cv2.resize(face, (IMAGE_SIZE, IMAGE_SIZE))


def sample_indices(total: int, k: int) -> list:
    """Same uniform sampling as training."""
    if total <= k:
        indices = list(range(total))
        while len(indices) < k:
            indices.append(indices[-1])
        return indices
    step = total / k
    return [int(step * i + step / 2) for i in range(k)]


def load_image(path: str, detector, use_face_detection: bool) -> np.ndarray:
    """Load a single image, detect face, return 224x224 crop."""
    bgr = cv2.imread(path)
    if bgr is None:
        sys.exit(f"Error: cannot read image '{path}'")
    if use_face_detection and detector is None:
        sys.exit("Error: face detector not initialized. Disable it with --no-face-detect.")
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    return crop_face(rgb, detector, use_face_detection=use_face_detection)


def load_video_frames(path: str, detector, use_face_detection: bool) -> list:
    """Load all frames from a video, detect face in each."""
    cap = cv2.VideoCapture(path)
    if not cap.isOpened():
        sys.exit(f"Error: cannot open video '{path}'")
    if use_face_detection and detector is None:
        sys.exit("Error: face detector not initialized. Disable it with --no-face-detect.")

    faces = []
    while True:
        ret, bgr = cap.read()
        if not ret:
            break
        rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
        faces.append(crop_face(rgb, detector, use_face_detection=use_face_detection))
    cap.release()

    if not faces:
        sys.exit(f"Error: no frames read from '{path}'")
    return faces


def build_clip(faces: list) -> np.ndarray:
    """Build a (1, 16, 224, 224, 3) float32 clip from face crops."""
    indices = sample_indices(len(faces), NUM_FRAMES)
    clip = np.empty((1, NUM_FRAMES, IMAGE_SIZE, IMAGE_SIZE, 3), dtype=np.float32)
    for j, idx in enumerate(indices):
        clip[0, j] = faces[idx].astype(np.float32)
    clip = tf.keras.applications.resnet50.preprocess_input(clip)
    return clip


def print_results(probs: np.ndarray):
    ranked = sorted(zip(CLASS_NAMES, probs), key=lambda x: -x[1])
    print()
    for name, p in ranked:
        bar = "#" * int(p * 40)
        print(f"  {name:10s} {p:6.2%}  {bar}")
    print(f"\n  Prediction: {CLASS_NAMES[int(np.argmax(probs))]}")


def main():
    parser = argparse.ArgumentParser(description="Predict facial expression.")
    parser.add_argument("--input", required=True,
                        help="Path to an image (.jpg/.png) or video (.mov/.mp4/.avi)")
    parser.add_argument("--weights", required=True,
                        help="Path to trained weights, e.g. output/fold3/phase2/best.weights.h5")
    parser.add_argument("--gpu-memory-limit", type=int, default=0,
                        help="Hard GPU memory limit in MB (0 = memory growth)")
    parser.add_argument("--no-face-detect", action="store_true", default=False,
                        help="Disable MediaPipe face detection and use center crop")
    args = parser.parse_args()

    # Improve run-to-run reproducibility for identical inputs.
    tf.keras.utils.set_random_seed(42)
    tf.config.experimental.enable_op_determinism()
    os.environ["TF_DETERMINISTIC_OPS"] = "1"

    gpus = tf.config.list_physical_devices("GPU")
    if gpus:
        if args.gpu_memory_limit > 0:
            tf.config.set_logical_device_configuration(
                gpus[0],
                [tf.config.LogicalDeviceConfiguration(memory_limit=args.gpu_memory_limit)],
            )
        else:
            tf.config.experimental.set_memory_growth(gpus[0], True)

    cfg = Config(num_frames=NUM_FRAMES, image_size=IMAGE_SIZE)
    model = build_model(cfg)
    model.load_weights(args.weights)
    print(f"Loaded weights from {args.weights}")

    detector = None
    if not args.no_face_detect:
        detector = get_face_detector()

    ext = args.input.lower().rsplit(".", 1)[-1]
    is_video = ext in ("mov", "mp4", "avi", "mkv", "webm")

    if is_video:
        print(f"Processing video: {args.input}")
        faces = load_video_frames(
            args.input, detector, use_face_detection=not args.no_face_detect
        )
        print(f"  Extracted {len(faces)} frames, sampling {NUM_FRAMES}")
        clip = build_clip(faces)
    else:
        print(f"Processing image: {args.input}")
        face = load_image(
            args.input, detector, use_face_detection=not args.no_face_detect
        )
        faces = [face] * NUM_FRAMES
        clip = build_clip(faces)

    probs = model(clip, training=False).numpy()[0]
    print_results(probs)


if __name__ == "__main__":
    main()
