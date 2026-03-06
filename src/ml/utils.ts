export function sampleFrames<T>(frames: T[], target = 16): T[] {
  const N = frames.length;

  if (N === 0) return [];

  // Match training script:
  // - take first `target` frames
  // - if fewer than `target`, pad by repeating the last frame
  const head = frames.slice(0, target);
  if (head.length < target) {
    const last = head[head.length - 1];
    while (head.length < target) head.push(last);
  }
  if (head.length === target) return head;

  return head;
}
