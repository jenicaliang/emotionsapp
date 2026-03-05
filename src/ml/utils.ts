export function sampleFrames<T>(frames: T[], target = 16): T[] {
  const N = frames.length;

  if (N === 0) return [];

  // pad if too short
  if (N <= target) {
    const pad = Array(target - N).fill(frames[0]);
    return [...pad, ...frames];
  }

  // evenly sample if too long
  return Array.from({ length: target }, (_, k) => {
    const idx = Math.round((k * (N - 1)) / (target - 1));
    return frames[idx];
  });
}