export function sampleFrames<T>(frames: T[], target = 16): T[] {
  const N = frames.length;

  if (N === 0) return [];

  // Match predict.py sample_indices:
  // - if N <= target: use all frames, then pad by repeating last frame
  // - if N > target: uniform center-of-bin sampling
  if (N <= target) {
    const out = [...frames];
    const last = out[out.length - 1];
    while (out.length < target) out.push(last);
    return out;
  }

  const step = N / target;
  return Array.from({ length: target }, (_, i) => {
    const idx = Math.floor(step * i + step / 2);
    return frames[Math.min(Math.max(idx, 0), N - 1)];
  });
}
