import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, RotateCcw, Check } from "lucide-react";
import { Emotion } from "../types";
import {
  loadingMessages,
  emotionColors,
  cooldownMessages,
} from "../data/mockData";
import { EmotionalBlob } from "./EmotionalBlob";
import { useCaptureControls } from "./Layout";
import { loadEmotionModel, runEmotionModel } from "../../ml/runEmotionModel";
import { cropFace224 } from "../../ml/cropFace224";

type CaptureState = "ready" | "recording" | "processing" | "result" | "cooldown";

type FaceBox = {
  originX: number;
  originY: number;
  width: number;
  height: number;
  frameW?: number;
  frameH?: number;
  // optional metadata some detectors include
  angle?: number;
};

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

export function CaptureView() {
  const { registerCaptureControls, unregisterCaptureControls, updateCaptureState } =
    useCaptureControls();

  const [state, setState] = useState<CaptureState>("ready");
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingTimeRef = useRef(0);

  const [detectedEmotion, setDetectedEmotion] = useState<Emotion | null>(null);
  const [status, setStatus] = useState("");
  const [loadingMessage, setLoadingMessage] = useState("");
  const [charCount, setCharCount] = useState(0);
  const debugCropCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastBoxRef = useRef<any>(null);

  const cropBusyRef = useRef(false);
  const lastCropAtRef = useRef(0);
  const hasPreviewRef = useRef(false);

  // Two <video> nodes mount depending on state
  const readyVideoRef = useRef<HTMLVideoElement | null>(null);
  const recordingVideoRef = useRef<HTMLVideoElement | null>(null);

  // One shared MediaStream for the whole component lifetime
  const streamRef = useRef<MediaStream | null>(null);

  // Capture frames into 224x224 for the model
  const captureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameBufferRef = useRef<ImageData[]>([]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const maxChars = 50;

  const emotions: Emotion[] = [
    "Unknown",
    "Happy",
    "Sad",
    "Neutral",
    "Angry",
    "Surprise",
    "Disgust",
    "Fear",
  ];

  // --- camera plumbing ---

  const ensureStream = useCallback(async () => {
    if (streamRef.current) return streamRef.current;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false,
    });

    streamRef.current = stream;
    return stream;
  }, []);

  const attachStreamToVideo = useCallback(
    async (el: HTMLVideoElement | null) => {
      if (!el) return;

      try {
        const stream = await ensureStream();

        // Attach stream
        if (el.srcObject !== stream) {
          el.srcObject = stream;
        }

        // Only call play when needed; avoid AbortError spam on remounts
        if (el.paused) {
          await el.play();
        }
      } catch (err: any) {
        // AbortError can happen during quick remount; ignore it
        if (err?.name !== "AbortError") {
          console.error("Error accessing camera:", err);
        }
      }
    },
    [ensureStream]
  );

  // Stop camera on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t: MediaStreamTrack) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Preload model once so mock app inference uses the saved weights.
  useEffect(() => {
    loadEmotionModel().catch((e) => {
      console.error("Model preload failed:", e);
    });
  }, []);

  const getActiveVideoEl = useCallback(() => {
    return state === "recording" ? recordingVideoRef.current : readyVideoRef.current;
  }, [state]);

  function drawCropPreview(crop: ImageData | null) {
  const c = debugCropCanvasRef.current;
  if (!c || !crop) return;

  c.width = 224;
  c.height = 224;

  const ctx = c.getContext("2d");
  if (!ctx) return;

  ctx.putImageData(crop, 0, 0);
}

function drawBoxOnOverlay(box: any) {
  const canvas = overlayCanvasRef.current;
  const video = recordingVideoRef.current ?? readyVideoRef.current;

  if (!canvas || !video || !box) return;

  // Match overlay canvas to the element size (CSS pixels)
  const w = video.clientWidth;
  const h = video.clientHeight;
  if (!w || !h) return;

  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, w, h);

  // Map detector coordinates to overlay space using source frame dimensions.
  const srcW = box.frameW ?? 224;
  const srcH = box.frameH ?? 224;
  const sx = w / srcW;
  const sy = h / srcH;

  ctx.strokeStyle = "lime";
  ctx.lineWidth = 3;

  ctx.strokeRect(
    box.originX * sx,
    box.originY * sy,
    box.width * sx,
    box.height * sy
  );
}

  function drawDebugBox() {
    if (lastBoxRef.current) {
      drawBoxOnOverlay(lastBoxRef.current);
    }
  }

  // --- frame capture ---

  const captureFrame = useCallback(async () => {
    const video = recordingVideoRef.current ?? readyVideoRef.current;
    const canvas = captureCanvasRef.current;

    if (!video || !canvas) return;

    // need actual pixels
    if (video.readyState < 2) return;
    if (!video.videoWidth || !video.videoHeight) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Keep full camera resolution for better downstream face crop quality.
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (canvas.width !== vw || canvas.height !== vh) {
      canvas.width = vw;
      canvas.height = vh;
    }

    ctx.drawImage(video, 0, 0, vw, vh);
    const imageData = ctx.getImageData(0, 0, vw, vh);
    // Keep a rolling window of captured frames; inference then uniformly samples 16.
    const MAX_CAPTURE_FRAMES = 120;
    frameBufferRef.current.push(imageData);
    if (frameBufferRef.current.length > MAX_CAPTURE_FRAMES) {
      frameBufferRef.current.shift();
    }

    // Keep preview stable: only use fallback until first face crop is available.
    if (!hasPreviewRef.current) {
      drawCropPreview(resizeFrameTo224(imageData));
    }

    // lightweight logging checkpoints
    const len = frameBufferRef.current.length;
    if (len === 1 || len === 16) {
      console.log("frames buffered:", len);
    }

    // Throttled face detection (~500ms)
    const now = Date.now();
    if (!cropBusyRef.current && now - lastCropAtRef.current >= 500) {
      cropBusyRef.current = true;
      lastCropAtRef.current = now;

      try {
        const res = await cropFace224(imageData);
        if (res && res.box && res.image) {
          lastBoxRef.current = res.box;
          hasPreviewRef.current = true;
          drawCropPreview(res.image);
          drawBoxOnOverlay(res.box);
          console.log("Detected face box:", res.box);
        }
      } catch (error) {
        console.error("Face detection error:", error);
      } finally {
        cropBusyRef.current = false;
      }
    }
  }, []);

  // --- recording controls ---

  const stopRecording = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (recordingTimeRef.current >= 5) {
      setState("processing");
      processEmotion();
    } else {
      setState("ready");
    }

    updateCaptureState("ready", 0);
  }, [updateCaptureState]);

  const startRecording = useCallback(() => {
    // clear any prior run
    frameBufferRef.current = [];
    lastBoxRef.current = null;
    hasPreviewRef.current = false;

    setState("recording");
    setRecordingTime(0);
    recordingTimeRef.current = 0;
    updateCaptureState("recording", 0);

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      recordingTimeRef.current = Math.min(recordingTimeRef.current + 0.1, 10);

      setRecordingTime(recordingTimeRef.current);
      updateCaptureState("recording", recordingTimeRef.current);

      // capture pixels for ML
      captureFrame();

      // draw overlay (uses lastBoxRef set during processing; still safe to call)
      drawDebugBox();

      if (recordingTimeRef.current >= 10) {
        stopRecording();
      }
    }, 100);
  }, [captureFrame, drawDebugBox, stopRecording, updateCaptureState]);

  // --- processing/inference ---

  const processEmotion = () => {
    let messageIndex = 0;

    const messageInterval = setInterval(() => {
      setLoadingMessage(loadingMessages[messageIndex]);
      messageIndex = (messageIndex + 1) % loadingMessages.length;
    }, 1500);

    setTimeout(async () => {
      clearInterval(messageInterval);

      try {
        const { label, box, probs, debugCrop } = await runEmotionModel(
          frameBufferRef.current
        );

        // ✅ Sync UI to machine prediction
        setDetectedEmotion(label as Emotion);
        drawCropPreview(debugCrop);

        // (optional) keep for debugging
        console.log("Prediction:", label, { box, probs });
      } catch (e) {
        console.error("Model inference failed:", e);

        // Fallback stays random (or set Neutral)
        setDetectedEmotion("Neutral");
      }

      setState("result");
    }, 6000);
  };

  const submitStatus = () => {
    if (status.trim().length > 0 && status.length <= maxChars) {
      setState("cooldown");
    }
  };

  const reset = () => {
    setState("ready");
    setRecordingTime(0);
    recordingTimeRef.current = 0;
    setDetectedEmotion(null);
    setStatus("");
    setCharCount(0);
    setLoadingMessage("");
    lastBoxRef.current = null;
    hasPreviewRef.current = false;

    // clear overlay
    const c = overlayCanvasRef.current;
    const ctx = c?.getContext("2d");
    if (c && ctx) ctx.clearRect(0, 0, c.width, c.height);
  };

  // Register controls on mount
  useEffect(() => {
    registerCaptureControls(startRecording, stopRecording);
    return () => {
      unregisterCaptureControls();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center px-5 py-8">
      <AnimatePresence mode="wait">
        {state === "ready" && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center text-center"
          >
            <div className="w-full aspect-[3/4] max-h-[480px] mb-8 rounded-2xl bg-secondary border border-border flex items-center justify-center relative overflow-hidden">
              <video
                ref={(el: HTMLVideoElement | null) => {
                  readyVideoRef.current = el;
                  attachStreamToVideo(el);
                }}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                muted
                playsInline
              />

              {/* debug overlay */}
              <canvas
                ref={overlayCanvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
              />

              <Camera size={48} strokeWidth={1.5} style={{ color: "#A39B94" }} />
            </div>

            <h2 className="text-[22px] mb-2" style={{ color: "#5A5A5A" }}>
              Ready to feel?
            </h2>
            <p className="text-[13px] max-w-[280px]" style={{ color: "#A39B94" }}>
              Tap the red button below to start recording a 5–10 second video. The
              algorithm will understand you.
            </p>
          </motion.div>
        )}

        {state === "recording" && (
          <motion.div
            key="recording"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center w-full"
          >
            <div className="w-full aspect-[3/4] max-h-[440px] mb-4 rounded-2xl bg-secondary border border-border relative overflow-hidden">
              <video
                ref={(el: HTMLVideoElement | null) => {
                  recordingVideoRef.current = el;
                  attachStreamToVideo(el);
                }}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                muted
                playsInline
              />

              {/* debug overlay */}
              <canvas
                ref={overlayCanvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
              />

              {/* crop preview (bottom-left) */}
              <canvas
                ref={debugCropCanvasRef}
                className="absolute bottom-3 left-3 border-2 border-lime-500 rounded-lg pointer-events-none"
                width={224}
                height={224}
                style={{ 
                  width: "80px", 
                  height: "80px",
                  backgroundColor: "rgba(0, 0, 0, 0.5)"
                }}
              />

              <div
                className="absolute top-3 right-3 text-[11px] px-2 py-1 rounded-full flex items-center gap-1"
                style={{ backgroundColor: "#E74C3C", color: "#FFFFFF" }}
              >
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                REC
              </div>
            </div>

            <div className="text-[28px] mb-2" style={{ color: "#8B7E74" }}>
              {recordingTime.toFixed(1)}s
            </div>

            <div className="flex items-center gap-3 mb-3">
              <motion.div
                className="h-1 rounded-full"
                style={{ backgroundColor: "#E74C3C" }}
                initial={{ width: 0 }}
                animate={{ width: `${(recordingTime / 10) * 200}px` }}
                transition={{ duration: 0.1 }}
              />
            </div>

            <p className="text-[11px]" style={{ color: "#A39B94" }}>
              {recordingTime < 5
                ? `Record at least ${(5 - recordingTime).toFixed(1)}s more`
                : "Tap the button below to stop"}
            </p>
          </motion.div>
        )}

        {state === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center text-center"
          >
            <div className="w-32 h-32 mb-8 relative">
              <motion.div
                className="absolute inset-0 rounded-full bg-secondary"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute inset-4 rounded-full bg-primary/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
            </div>

            <motion.p
              key={loadingMessage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-[15px] mb-2 min-h-[60px] max-w-[280px]"
              style={{ color: "#5A5A5A" }}
            >
              {loadingMessage}
            </motion.p>

            <p className="text-[11px] italic" style={{ color: "#A39B94" }}>
              This will take longer than it should
            </p>
          </motion.div>
        )}

        {state === "result" && detectedEmotion && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center w-full"
          >
            <div className="mb-6">
              <EmotionalBlob emotion={detectedEmotion} size={100} />
            </div>

            <h2 className="text-[22px] mb-2" style={{ color: "#5A5A5A" }}>
              You're feeling: {detectedEmotion}
            </h2>
            <p className="text-[13px] mb-8" style={{ color: "#A39B94" }}>
              The machine has spoken. Now describe it briefly.
            </p>

            <div className="w-full max-w-[300px] mb-6">
              <textarea
                value={status}
                onChange={(e: any) => {
                  if (e.target.value.length <= maxChars) {
                    setStatus(e.target.value);
                    setCharCount(e.target.value.length);
                  }
                }}
                placeholder="Your feelings, quantified..."
                className="w-full h-24 px-4 py-3 rounded-2xl bg-secondary border border-border resize-none"
                style={{ color: "#5A5A5A" }}
              />
              <p
                className="text-[11px] text-right mt-2"
                style={{ color: charCount >= maxChars ? "#E8A8A0" : "#A39B94" }}
              >
                {charCount}/{maxChars}
              </p>
            </div>

            <button
              onClick={submitStatus}
              disabled={status.trim().length === 0}
              className="w-full max-w-[300px] bg-primary text-primary-foreground rounded-full py-4 px-6 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Check size={20} />
              Broadcast Your State
            </button>

            <p className="text-[10px] mt-4 italic" style={{ color: "#A39B94" }}>
              Everyone will be notified of how you feel
            </p>
          </motion.div>
        )}

        {state === "cooldown" && (
          <motion.div
            key="cooldown"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center text-center"
          >
            <div
              className="w-40 h-40 mb-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: emotionColors[detectedEmotion!] }}
            >
              <span className="text-[64px]">⏱</span>
            </div>

            <h2 className="text-[22px] mb-2" style={{ color: "#5A5A5A" }}>
              You're not ready to feel again
            </h2>
            <p className="text-[13px] mb-6 max-w-[280px]" style={{ color: "#A39B94" }}>
              {cooldownMessages[Math.floor(Math.random() * cooldownMessages.length)]}
            </p>

            <div className="bg-secondary rounded-2xl px-6 py-4 mb-8">
              <p className="text-[11px] mb-1" style={{ color: "#A39B94" }}>
                Next feeling available in
              </p>
              <p className="text-[28px]" style={{ color: "#8B7E74" }}>
                1h 47m
              </p>
            </div>

            <button
              onClick={reset}
              className="text-[13px] flex items-center gap-2 px-6 py-3 rounded-full bg-secondary"
              style={{ color: "#8B7E74" }}
            >
              <RotateCcw size={16} />
              Back to Reality
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* hidden capture canvas (model input frames) */}
      <canvas ref={captureCanvasRef} width={224} height={224} style={{ display: "none" }} />
    </div>
  );
}
