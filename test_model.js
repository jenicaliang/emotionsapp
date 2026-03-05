const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');

async function testEmotionModel() {
  console.log('=== EMOTION MODEL TEST ===\n');
  
  try {
    console.log('Loading model from ./public/web_model/model.json...');
    const model = await tf.loadGraphModel('file://./public/web_model/model.json');
    console.log('✅ Model loaded successfully!\n');
    
    console.log(`Input shape: ${JSON.stringify(model.inputs[0].shape)}`);
    console.log(`Output shape: ${JSON.stringify(model.outputs[0].shape)}\n`);
    
    // Test 1: Zero input
    console.log('--- Test 1: Zero Input ---');
    const zeroInput = tf.zeros([1, 16, 224, 224, 3]);
    const zeroOut = model.execute(zeroInput);
    const zeroProbs = await (Array.isArray(zeroOut) ? zeroOut[0] : zeroOut).data();
    const zeroArray = Array.from(zeroProbs);
    console.log(`Output: ${zeroArray.map(p => p.toFixed(4)).join(', ')}`);
    zeroInput.dispose();
    if (Array.isArray(zeroOut)) zeroOut.forEach(t => t.dispose());
    else zeroOut.dispose();
    
    // Test 2: Random input
    console.log('\n--- Test 2: Random Input ---');
    const randInput = tf.randomUniform([1, 16, 224, 224, 3]);
    const randOut = model.execute(randInput);
    const randProbs = await (Array.isArray(randOut) ? randOut[0] : randOut).data();
    const randArray = Array.from(randProbs);
    console.log(`Output: ${randArray.map(p => p.toFixed(4)).join(', ')}`);
    randInput.dispose();
    if (Array.isArray(randOut)) randOut.forEach(t => t.dispose());
    else randOut.dispose();
    
    // Analysis
    console.log('\n--- Analysis ---');
    const mean = randArray.reduce((a, b) => a + b, 0) / randArray.length;
    const variance = randArray.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / randArray.length;
    const stdDev = Math.sqrt(variance);
    const sum = randArray.reduce((a, b) => a + b, 0);
    
    console.log(`Mean: ${mean.toFixed(6)}`);
    console.log(`StdDev: ${stdDev.toFixed(6)}`);
    console.log(`Sum: ${sum.toFixed(4)} (should be ~1.0)`);
    
    if (stdDev > 0.05) {
      console.log('\n✅ SUCCESS: Model outputs vary with input!');
      
      // Find which emotion is predicted
      const emotions = ["Neutral", "Happy", "Sad", "Surprise", "Fear", "Disgust", "Angry", "Contempt"];
      const maxIdx = randArray.indexOf(Math.max(...randArray));
      console.log(`Top emotion: ${emotions[maxIdx]} (${(randArray[maxIdx] * 100).toFixed(1)}%)`);
    } else {
      console.log('\n❌ PROBLEM: Model outputs are nearly uniform');
      console.log('Weights may not be loaded or applied correctly.');
    }
    
  } catch (e) {
    console.error('\n❌ ERROR:', e.message);
    console.error(e.stack);
  }
  
  process.exit(0);
}

testEmotionModel();
