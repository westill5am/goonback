const { spawn } = require('child_process');
const path = require('path');

module.exports = async function ashemaletube(query) {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, 'scrapers', 'ashemaletube.py');
    const pythonProcess = spawn('python', [pythonScript, query]);
    
    let output = '';
    let error = '';
    
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const results = JSON.parse(output);
          resolve(results);
        } catch (parseError) {
          console.error('ashemaletube parse error:', parseError.message);
          resolve([]);
        }
      } else {
        console.error('ashemaletube error:', error);
        resolve([]);
      }
    });
    
    // Set a timeout to prevent hanging
    setTimeout(() => {
      pythonProcess.kill();
      resolve([]);
    }, 60000); // 60 second timeout
  });
};
