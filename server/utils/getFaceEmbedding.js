const { spawn } = require('child_process');
const path = require('path');

function getFaceEmbedding(imageBase64) {
  return new Promise((resolve, reject) => {
    const pythonScriptPath = path.join(__dirname, '..', 'python', 'face_embed.py');
    const python = spawn('python', [pythonScriptPath]);

    let data = '';
    let error = '';

    python.stdout.on('data', (chunk) => {
      data += chunk.toString();
    });

    python.stderr.on('data', (chunk) => {
      error += chunk.toString();
    });

    python.on('close', (code) => {
      if (code !== 0 || error) {
        return reject(new Error(`Python error: ${error}`));
      }
      try {
        const result = JSON.parse(data);
        if (result.error) {
          return reject(new Error(result.error));
        }
        resolve(result.embedding);
      } catch (parseError) {
        reject(new Error(`Failed to parse embedding result: ${parseError.message}`));
      }
    });

    if (python.stdin.writable) {
      python.stdin.write(imageBase64);
      python.stdin.end();
    } else {
      reject(new Error('Cannot write to closed stdin'));
    }
  });
}

module.exports = getFaceEmbedding;