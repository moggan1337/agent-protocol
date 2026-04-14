/**
 * Multi-Agent Chat Example
 * 
 * Demonstrates two agents communicating via the protocol.
 */

import { 
  Agent, 
  AgentIdentity, 
  Capability, 
  AgentRegistry, 
  Router, 
  MemoryTransport,
  RequestMessage,
  Content,
} from '../src/protocol.js';

// Create agents
function createChatAgent(id: string, name: string): Agent {
  const identity: AgentIdentity = {
    id,
    name,
    version: '1.0.0',
    type: 'agent',
  };

  const capabilities: Capability[] = [
    {
      name: 'chat',
      version: '1.0.0',
      description: 'Natural language conversation',
      inputTypes: ['text'],
      outputTypes: ['text'],
    },
  ];

  const agent = new Agent({
    identity,
    capabilities,
    endpoint: `memory://${id}`,
  });

  // Simple chat handler that prefixes responses
  agent.registerHandler('chat', async (request) => {
    const text = (request.content[0] as { text: string }).text;
    
    return {
      id: crypto.randomUUID(),
      type: 'response',
      timestamp: Date.now(),
      version: '1.0.0',
      requestId: request.requestId,
      status: 'success',
      content: [{ 
        type: 'text', 
        text: `[${name}] I received: ${text}` 
      }],
    };
  });

  return agent;
}

// Create agents
const alice = createChatAgent('alice', 'Alice');
const bob = createChatAgent('bob', 'Bob');

// Create registry
const registry = new AgentRegistry({ name: 'local-registry', type: 'local' });

// Create transport
const transport = new MemoryTransport();

// Create router
const router = new Router({
  registry,
  transport,
});

// Main function
async function main() {
  // Start all components
  await registry.start();
  await alice.start();
  await bob.start();
  await router.start();

  // Register agents
  await registry.register(alice.getInfo());
  await registry.register(bob.getInfo());

  console.log('\n=== Multi-Agent Chat ===\n');

  // Alice sends message to Bob
  console.log('Alice sending message to Bob...');
  const message: RequestMessage = {
    id: crypto.randomUUID(),
    type: 'request',
    timestamp: Date.now(),
    version: '1.0.0',
    requestId: 'msg_001',
    action: 'chat',
    sender: alice.getIdentity(),
    recipient: bob.getIdentity(),
    content: [{ type: 'text', text: 'Hello Bob! How are you?' }],
  };

  const response = await router.route(message);
  console.log('Bob responded:', response);

  // Discovery: Find all agents
  console.log('\n=== Discovering Agents ===\n');
  const agents = registry.getAllHealthy();
  console.log('Registered agents:', agents.map(a => a.identity.name));

  // Capability query: Find agents with 'chat'
  console.log('\n=== Capability Query ===\n');
  const chatAgents = registry.findByCapability('chat');
  console.log('Agents with chat capability:', chatAgents.map(a => a.identity.name));

  // Cleanup
  await router.stop();
  await alice.stop();
  await bob.stop();
  await registry.stop();

  console.log('\n=== Done ===');
}

main().catch(console.error);
