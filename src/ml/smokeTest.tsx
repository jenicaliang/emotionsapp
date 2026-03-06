import { useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";

export default function ModelSmokeTest() {
  const [status, setStatus] = useState("loading…");

  useEffect(() => {
  (async () => {
    await tf.ready();
    const model = await tf.loadGraphModel("/model/model.json");

    console.log("model inputs:", model.inputs);
    console.log("model outputs:", model.outputs);

    // Use the input shape from the model:
    const shape = model.inputs[0].shape?.map((d) => (d == null ? 1 : d)) as number[];
    const x = tf.zeros([1, 16, 224, 224, 3], "float32");

    const y = await model.executeAsync(x as any);

    const logits = Array.isArray(y) ? y[0] : y;  // your case: single tensor
const arr = Array.from(await logits.data());  // length 8

// convert to probabilities
const probs = tf.softmax(tf.tensor1d(arr));
const p = Array.from(await probs.data());

const labels = ["Unknown", "Happy", "Sad", "Neutral", "Angry", "Surprise", "Disgust", "Fear"]; // matches teammate inference order
const top = p
  .map((v, i) => ({ label: labels[i] ?? `class_${i}`, p: v }))
  .sort((a, b) => b.p - a.p)
  .slice(0, 3);

console.log("top predictions:", top);
    // y can be a Tensor or Tensor[]
    if (Array.isArray(y)) {
      console.log("executeAsync outputs (array):", y.map(t => ({ shape: t.shape, dtype: t.dtype })));
    } else {
      console.log("executeAsync output (single):", { shape: y.shape, dtype: y.dtype });
    }

    setStatus("inference ✅ (see console)");
  })().catch((e) => {
    console.error(e);
    setStatus(`error: ${String(e?.message ?? e)}`);
  });
}, []);

  return (
    <div style={{ padding: 16, fontFamily: "system-ui" }}>
      <div>TFJS model: {status}</div>
    </div>
  );
}
