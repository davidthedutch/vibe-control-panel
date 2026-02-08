/**
 * Quick test script for terminal server
 * Run: node test-terminal.js
 */

const WebSocket = require('ws');

console.log('Testing Terminal Server Connection...\n');

const ws = new WebSocket('ws://localhost:3001');

ws.on('open', () => {
  console.log('✓ Connected to terminal server');

  // Create terminal session
  console.log('→ Creating terminal session...');
  ws.send(JSON.stringify({
    type: 'create',
    cols: 80,
    rows: 24,
    cwd: process.cwd()
  }));
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data.toString());

    switch (message.type) {
      case 'created':
        console.log(`✓ Terminal session created (ID: ${message.terminalId})`);

        // Send a test command
        console.log('→ Sending test command: echo "Hello from terminal test"');
        ws.send(JSON.stringify({
          type: 'input',
          data: 'echo "Hello from terminal test"\r'
        }));

        // Exit after 2 seconds
        setTimeout(() => {
          console.log('\n✓ Test completed successfully!');
          ws.send(JSON.stringify({
            type: 'input',
            data: 'exit\r'
          }));
          setTimeout(() => {
            process.exit(0);
          }, 500);
        }, 2000);
        break;

      case 'output':
        process.stdout.write(message.data);
        break;

      case 'exit':
        console.log(`\n→ Process exited with code ${message.exitCode}`);
        break;

      case 'error':
        console.error(`✗ Error: ${message.message}`);
        break;
    }
  } catch (err) {
    console.error('✗ Failed to parse message:', err);
  }
});

ws.on('error', (error) => {
  console.error('\n✗ WebSocket error:', error.message);
  console.error('\nMake sure the terminal server is running:');
  console.error('  npm run dev:terminal');
  process.exit(1);
});

ws.on('close', () => {
  console.log('\n→ Connection closed');
});

// Timeout after 10 seconds
setTimeout(() => {
  console.error('\n✗ Test timeout - server not responding');
  process.exit(1);
}, 10000);
