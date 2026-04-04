import { chromium, FullConfig } from '@playwright/test';
import { spawn, ChildProcess } from 'child_process';

let serverProcess: ChildProcess | null = null;

async function globalSetup(config: FullConfig) {
  console.log('Starting server...');

  // Start the server
  serverProcess = spawn('node', ['server.mjs'], {
    stdio: 'inherit',
    detached: false
  });

  // Wait for server to be ready
  const browser = await chromium.launch();
  const page = await browser.newPage();

  let serverReady = false;
  for (let i = 0; i < 30; i++) {
    try {
      const response = await page.goto('http://localhost:3000/loans/upload', {
        timeout: 1000,
        waitUntil: 'domcontentloaded'
      });
      if (response && response.ok()) {
        serverReady = true;
        console.log('Server is ready!');
        break;
      }
    } catch (error) {
      // Server not ready yet, wait and retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  await browser.close();

  if (!serverReady) {
    console.error('Server failed to start within timeout');
    if (serverProcess) {
      serverProcess.kill();
    }
    throw new Error('Server failed to start');
  }

  // Store the process ID so we can kill it later
  if (serverProcess && serverProcess.pid) {
    process.env.SERVER_PID = serverProcess.pid.toString();
  }

  return async () => {
    console.log('Shutting down server...');
    if (serverProcess) {
      serverProcess.kill();
    }
  };
}

export default globalSetup;
