/**
 * Basic Agent Example
 * 
 * Demonstrates creating a simple echo agent.
 */

import { Agent, AgentIdentity, Capability, MemoryTransport, Content } from '../src/protocol.js';

// Define agent identity
const identity: AgentIdentity = {
  id: 'basic-echo-agent',
  name: 'Basic Echo Agent',
  version: '1.0.0',
  type: 'agent',
};

// Define capabilities
const capabilities: Capability[] = [
  {
    name: 'echo',
    version: '1.0.0',
    description: 'Echoes back the input text',
    inputTypes: ['text'],
    outputTypes: ['text'],
  },
  {
    name: 'uppercase',
    version: '1.0.0',
    description: 'Converts text to uppercase',
    inputTypes: ['text'],
    outputTypes: ['text'],
  },
];

// Create agent
const agent = new Agent({
  identity,
  capabilities,
  endpoint: 'memory://basic-echo-agent',
});

// Register handlers
agent.registerHandler('echo', async (request) => {
  const text = (request.content[0] as { text: string }).text;
  
  console.log(`[Echo Agent] Received: "${text}"`);
  
  return {
    id: crypto.randomUUID(),
    type: 'response',
    timestamp: Date.now(),
    version: '1.0.0',
    requestId: request.requestId,
    status: 'success',
    content: [{ type: 'text', text: `Echo: ${text}` }],
  };
});

agent.registerHandler('uppercase', async (request) => {
  const text = (request.content[0] as { text: string }).text;
  
  console.log(`[Echo Agent] Uppercasing: "${text}"`);
  
  return {
    id: crypto.randomUUID(),
    type: 'response',
    timestamp: Date.now(),
    version: '1.0.0',
    requestId: request.requestId,
    status: 'success',
    content: [{ type: 'text', text: text.toUpperCase() }],
  };
});

// Start agent
async function main() {
  await agent.start();
  console.log('Basic Echo Agent started!');
  
  // Create request
  const request = {
    id: crypto.randomUUID(),
    type: 'request' as const,
    timestamp: Date.now(),
    version: '1.0.0',
    requestId: 'req_001',
    action: 'echo',
    sender: { id: 'test-client', name: 'Test Client' },
    content: [{ type: 'text' as const, text: 'Hello, Agent Protocol!' }],
  };
  
  // Process request
  const response = await agent.process(request);
  
  console.log('Response:', JSON.stringify(response, null, 2));
  
  // Test uppercase
  const upperRequest = {
    ...request,
    requestId: 'req_002',
    action: 'uppercase',
    content: [{ type: 'text', text: 'make me uppercase' }],
  };
  
  const upperResponse = await agent.process(upperRequest);
  console.log('Uppercase Response:', JSON.stringify(upperResponse, null, 2));
  
  await agent.stop();
}

main().catch(console.error);
