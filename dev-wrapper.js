const { spawn } = require('child_process');
const path = require('path');

// Start Discord interaction service
const discordProcess = spawn('node', ['./discordInteraction/index.js'], {
  stdio: 'inherit',
  cwd: __dirname
});

// Create a modified environment for electron-nuxt
const electronNuxtEnv = {...process.env};
electronNuxtEnv.NODE_OPTIONS = '--openssl-legacy-provider';

// We need to patch the Electron launcher to not inherit NODE_OPTIONS
const electronNuxtProcess = spawn('node', ['-e', `
  const originalSpawn = require('child_process').spawn;
  require('child_process').spawn = function(command, args, options) {
    if (command.includes('electron')) {
      // Clear NODE_OPTIONS for Electron
      if (options && options.env) {
        delete options.env.NODE_OPTIONS;
      } else if (options) {
        options.env = {...process.env};
        delete options.env.NODE_OPTIONS;
      } else {
        options = { env: {...process.env} };
        delete options.env.NODE_OPTIONS;
      }
    }
    return originalSpawn.call(this, command, args, options);
  };
  require('./.electron-nuxt/dev.js');
`], {
  stdio: 'inherit',
  cwd: __dirname,
  env: electronNuxtEnv
});

// Handle process termination
process.on('SIGINT', () => {
  discordProcess.kill();
  electronNuxtProcess.kill();
  process.exit();
});

discordProcess.on('exit', (code) => {
  console.log(`Discord service exited with code ${code}`);
  electronNuxtProcess.kill();
  process.exit(code);
});

electronNuxtProcess.on('exit', (code) => {
  console.log(`Electron-nuxt exited with code ${code}`);
  discordProcess.kill();
  process.exit(code);
});