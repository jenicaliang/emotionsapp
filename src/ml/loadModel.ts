import * as tf from "@tensorflow/tfjs";

let model: tf.GraphModel | null = null;

export async function loadModel() {
  if (!model) {
    // optional: choose backend. (webgl is default on most browsers)
    await tf.ready();
    model = await tf.loadGraphModel("/model/model.json");
  }
  return model;
}