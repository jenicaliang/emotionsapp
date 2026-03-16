import * as tf from '@tensorflow/tfjs';

async function testModel() {
  console.log('=== EMOTION MODEL DIAGNOSTIC ===\n');
  
  try {
    console.log('📦 Loading model from /web_model/model.json...');
    const model = await tf.loadGraphModel('/web_model/model.json');
    console.log('✅ Model loaded!\n');
    
    console.log(`Input shape: ${JSON.stringify(model.inputs[0].shape)}`);
    console.log(`Output shape: ${JSON.stringify(model.outputs[0].shape)}\n`);
    
    // Test with uniform random input (each channel value 0-1)
    const testTensor = tf.randomUniform([1, 16, 224, 224, 3]);
    console.log('Running inference on random [1,16,224,224,3] input...');
    
    const output = model.execute(testTensor);
    const results = await (Array.isArray(output) ? output[0] : output).data();
    const probs = Array.from(results);
    
    console.log('\nRaw output (should be softmax probabilities):');
    console.log(probs.map(p => p.toFixed(6)).join(', '));
    
    const sum = probs.reduce((a, b) => a + b, 0);
    const mean = sum / probs.length;
    const variance = probs.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / probs.length;
    const stdDev = Math.sqrt(variance);
    
    console.log(`\nStatistics:`);
    console.log(`  Sum: ${sum.toFixed(4)} (expected ~1.0)`);
    console.log(`  Mean: ${mean.toFixed(6)} (1/8 = 0.125)`);
    console.log(`  StdDev: ${stdDev.toFixed(6)}`);
    
    const emotions = ["Happy", "Sad", "Neutral", "Angry", "Surprise", "Disgust", "Fear"];
    const maxIdx = probs.indexOf(Math.max(...probs));
    const maxVal = probs[maxIdx];
    
    console.log(`\nTop prediction: ${emotions[maxIdx]} (${(maxVal * 100).toFixed(1)}%)`);
    
    if (stdDev > 0.1) {
      console.log('\n✅ Model is discriminating! Weights appear to be loaded.');
    } else {
      console.log('\n⚠️  Output distribution very uniform. Check if weights loaded correctly.');
    }
    
    testTensor.dispose();
    if (Array.isArray(output)) output.forEach(t => t.dispose());
    else output.dispose();
    
  } catch (e) {
    console.error('ERROR:', e.message);
    console.error(e.stack);
  }
}

// Export for testing
export { testModel };
