const { spawn } = require('child_process');
const fs = require('fs');

console.log('Checking TypeScript compilation...');

// Check if we're in the right directory
const packageJsonPath = './package.json';
if (!fs.existsSync(packageJsonPath)) {
  console.error('package.json not found. Make sure you are in the project root.');
  process.exit(1);
}

// Run TypeScript check
const tscProcess = spawn('npx', ['tsc', '--noEmit'], {
  stdio: 'pipe',
  cwd: process.cwd()
});

let stdout = '';
let stderr = '';

tscProcess.stdout.on('data', (data) => {
  stdout += data.toString();
});

tscProcess.stderr.on('data', (data) => {
  stderr += data.toString();
});

tscProcess.on('close', (code) => {
  console.log('=== TypeScript Check Result ===');
  console.log('Exit code:', code);
  
  if (stdout) {
    console.log('=== STDOUT ===');
    console.log(stdout);
  }
  
  if (stderr) {
    console.log('=== STDERR ===');
    console.log(stderr);
  }
  
  if (code === 0) {
    console.log('✅ TypeScript check passed!');
    
    // Now try the build
    console.log('\n=== Running Build ===');
    const buildProcess = spawn('npm', ['run', 'build'], {
      stdio: 'pipe',
      cwd: process.cwd()
    });
    
    let buildStdout = '';
    let buildStderr = '';
    
    buildProcess.stdout.on('data', (data) => {
      buildStdout += data.toString();
    });
    
    buildProcess.stderr.on('data', (data) => {
      buildStderr += data.toString();
    });
    
    buildProcess.on('close', (buildCode) => {
      console.log('=== Build Result ===');
      console.log('Exit code:', buildCode);
      
      if (buildStdout) {
        console.log('=== BUILD STDOUT ===');
        console.log(buildStdout);
      }
      
      if (buildStderr) {
        console.log('=== BUILD STDERR ===');
        console.log(buildStderr);
      }
      
      if (buildCode === 0) {
        console.log('✅ Build passed!');
      } else {
        console.log('❌ Build failed!');
      }
    });
  } else {
    console.log('❌ TypeScript check failed!');
  }
});