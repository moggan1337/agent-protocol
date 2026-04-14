/**
 * HTTP Server Example
 * 
 * Demonstrates exposing an agent via HTTP transport.
 */

import { Agent, AgentIdentity, Capability, HTTPTransport } from '../src/protocol.js';
import http from 'http';

// Create a simple task agent
const agent = new Agent({
  identity: {
    id: 'task-agent',
    name: 'Task Agent',
    version: '1.0.0',
    type: 'agent',
  },
  capabilities: [
    {
      name: 'process',
      version: '1.0.0',
      description: 'Process a task',
      inputTypes: ['text', 'data'],
      outputTypes: ['text', 'data'],
    },
  ],
  endpoint: 'http://localhost:3000',
});

// Register task handler
agent.registerHandler('process', async (request) => {
  const input = request.content[0];
  let result: string;

  if (input.type === 'text') {
    result = `Processed text: ${(input as { text: string }).text}`;
  } else if (input.type === 'data') {
    result = `Processed data: ${(input as { content: string }).content}`;
  } else {
    result = 'Unknown input type';
  }

  return {
    id: crypto.randomUUID(),
    type: 'response',
    timestamp: Date.now(),
    version: '1.0.0',
    requestId: request.requestId,
    status: 'success',
    content: [{ type: 'text', text: result }],
  };
});

// Create HTTP transport
const transport = new HTTPTransport({
  type: 'http',
  url: 'http://localhost:3000',
});

// HTTP server
const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy', agent: agent.getIdentity() }));
    return;
  }

  if (req.method === 'GET' && req.url === '/capabilities') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ capabilities: agent.getCapabilities() }));
    return;
  }

  if (req.method === 'POST' && req.url === '/messages') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const message = JSON.parse(body);
        const response = await agent.process(message);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: (error as Error).message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

async function main() {
  await agent.start();
  
  const PORT = 3000;
  server.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                  Task Agent Server                       ║
╠════════════════════════════════════════════════════════════╣
║  Agent: ${agent.getIdentity().name.padEnd(47)}║
║  URL:   http://localhost:${PORT}                            ║
╠════════════════════════════════════════════════════════════╣
║  Endpoints:                                              ║
║  • GET  /health       - Health check                     ║
║  • GET  /capabilities - List capabilities                ║
║  • POST /messages     - Send message                     ║
╚════════════════════════════════════════════════════════════╝
    `);
  });
}

main().catch(console.error);
