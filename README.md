# Agent Protocol

[![CI](https://github.com/moggan1337/agent-protocol/actions/workflows/ci.yml/badge.svg)](https://github.com/moggan1337/agent-protocol/actions/workflows/ci.yml)

<p align="center">
  <img src="logo.svg" alt="Agent Protocol" width="300"/>
</p>

<p align="center">
  <strong>Universal protocol for AI agent communication</strong>
</p>

<p align="center">
  <em>Like TCP/IP is to the internet, Agent Protocol is for AI agents.</em>
</p>

<p align="center">
  <a href="https://github.com/moggan1337/agent-protocol/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License"/>
  </a>
  <a href="https://www.npmjs.com/package/agent-protocol">
    <img src="https://img.shields.io/npm/v/agent-protocol.svg" alt="npm"/>
  </a>
  <a href="https://github.com/moggan1337/agent-protocol/actions">
    <img src="https://github.com/moggan1337/agent-protocol/workflows/CI/badge.svg" alt="CI"/>
  </a>
</p>

---

## 🎬 Demo
![Agent Protocol Demo](demo.gif)

*Protocol handshake and message exchange in action*

## Screenshots
| Component | Preview |
|-----------|---------|
| Protocol Flow | ![flow](screenshots/flow.png) |
| Message Schema | ![schema](screenshots/schema.png) |
| Agent Registry | ![registry](screenshots/registry.png) |

## Visual Description
Demo shows agents discovering each other via protocol handshake, exchanging capabilities, and negotiating tasks. Message schemas render as structured JSON with syntax highlighting. Registry displays connected agents with supported operations.

---


## 📋 Table of Contents

- [What is Agent Protocol?](#-what-is-agent-protocol)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Core Concepts](#-core-concepts)
- [Detailed Usage](#-detailed-usage)
- [API Reference](#-api-reference)
- [Configuration Options](#-configuration-options)
- [Advanced Patterns](#-advanced-patterns)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 What is Agent Protocol?

Agent Protocol is a **universal communication standard** that enables AI agents to discover, communicate, route, and collaborate on complex tasks. Just as TCP/IP provides the foundational protocol for internet communication, Agent Protocol provides a standardized layer for AI agent interaction.

### Why Agent Protocol?

In a world of increasingly sophisticated AI agents, interoperability is critical. Agent Protocol solves several fundamental challenges:

| Challenge | Solution |
|-----------|----------|
| **Interoperability** | Standardized message format across all agents |
| **Discovery** | Built-in capability registry for finding agents |
| **Routing** | Intelligent message routing based on capabilities |
| **Scalability** | Support for multi-transport and distributed architectures |
| **Type Safety** | Full TypeScript support with comprehensive type definitions |

### Use Cases

- **Multi-Agent Systems**: Build complex workflows where specialized agents collaborate
- **Agent Orchestration**: Coordinate multiple AI agents for complex tasks
- **Service Discovery**: Agents dynamically discover and utilize each other's capabilities
- **Distributed AI**: Deploy agents across different machines or data centers
- **Testing & Simulation**: Create mock agent environments for development

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| **Universal Messages** | Standardized message types for all agent interactions |
| **Capability Discovery** | Agents advertise and discover each other's abilities |
| **Smart Routing** | Intelligent message routing with load balancing |
| **Multi-Transport** | HTTP, WebSocket, and in-memory transport support |
| **Service Registry** | Built-in service discovery and registration |
| **Type-Safe** | Full TypeScript support with type definitions |
| **Streaming Support** | Native support for streaming responses |
| **Error Handling** | Comprehensive error codes and recovery mechanisms |
| **Heartbeat System** | Built-in health monitoring and detection |
| **Load Balancing** | Multiple strategies: round-robin, least-loaded, weighted |

---

## 🏗️ Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AGENT PROTOCOL LAYER                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐    │
│   │                        MESSAGE LAYER                                │    │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │    │
│   │  │ Request  │  │ Response │  │  Stream  │  │  Error   │           │    │
│   │  │ Messages │  │ Messages │  │ Messages │  │ Messages │           │    │
│   │  └──────────┘  └──────────┘  └──────────┘  └──────────┘           │    │
│   └─────────────────────────────────────────────────────────────────────┘    │
│                                      │                                       │
│   ┌──────────────────────────────────┼──────────────────────────────────┐    │
│   │                        CAPABILITY LAYER                              │    │
│   │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐ │    │
│   │  │  Discovery   │  │   Registry   │  │  Capability Matching     │ │    │
│   │  │   Service    │  │              │  │                          │ │    │
│   │  └──────────────┘  └──────────────┘  └──────────────────────────┘ │    │
│   └──────────────────────────────────┼──────────────────────────────────┘    │
│                                      │                                       │
│   ┌──────────────────────────────────┼──────────────────────────────────┐    │
│   │                        ROUTING LAYER                                │    │
│   │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐ │    │
│   │  │   Router     │  │ Load Balancer│  │    Message Handler       │ │    │
│   │  │              │  │              │  │                          │ │    │
│   │  └──────────────┘  └──────────────┘  └──────────────────────────┘ │    │
│   └──────────────────────────────────┼──────────────────────────────────┘    │
│                                      │                                       │
│   ┌──────────────────────────────────┼──────────────────────────────────┐    │
│   │                      TRANSPORT LAYER                                │    │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │    │
│   │  │   HTTP   │  │WebSocket │  │  Memory  │  │   gRPC   │           │    │
│   │  └──────────┘  └──────────┘  └──────────┘  └──────────┘           │    │
│   └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AGENTS                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Agent A   │  │   Agent B   │  │   Agent C   │  │   Agent D   │         │
│  │  (Specialist)│ │ (Coordinator)│ │  (Worker)   │  │  (Worker)   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        MESSAGE FLOW EXAMPLE                               │
└──────────────────────────────────────────────────────────────────────────┘

   Client                  Router                Registry               Agent
     │                       │                      │                     │
     │  1. Send Request      │                      │                     │
     │──────────────────────>│                      │                     │
     │                       │                      │                     │
     │                       │  2. Lookup Agent     │                     │
     │                       │─────────────────────>│                     │
     │                       │                      │                     │
     │                       │  3. Return Target    │                     │
     │                       │<─────────────────────│                     │
     │                       │                      │                     │
     │                       │  4. Forward Request  │                     │
     │                       │────────────────────────────────────────────>│
     │                       │                      │                     │
     │                       │                      │      5. Process      │
     │                       │                      │        Request       │
     │                       │                      │                     │
     │                       │  6. Return Response   │                     │
     │                       │<────────────────────────────────────────────│
     │                       │                      │                     │
     │  7. Response          │                      │                     │
     │<──────────────────────│                      │                     │
     │                       │                      │                     │
```

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              REQUEST PROCESSING                             │
└─────────────────────────────────────────────────────────────────────────────┘

   Incoming Message                                                             
        │                                                                       
        ▼                                                                       
   ┌─────────────┐                                                              
   │  Validation │  ──► Check message format, version, required fields        
   └──────┬──────┘                                                              
          │                                                                     
          ▼                                                                     
   ┌─────────────┐                                                              
   │   Routing   │  ──► Determine target agent based on recipient/capability   
   └──────┬──────┘                                                              
          │                                                                     
          ▼                                                                     
   ┌─────────────┐                                                              
   │  Handler    │  ──► Execute registered action handler                      
   │   Lookup    │                                                              
   └──────┬──────┘                                                              
          │                                                                     
          ▼                                                                     
   ┌─────────────┐                                                              
   │  Processing │  ──► Run agent logic, potentially return streaming response   
   └──────┬──────┘                                                              
          │                                                                     
          ▼                                                                     
   ┌─────────────┐                                                              
   │  Response   │  ──► Format and send response back to sender                
   │   Format    │                                                              
   └─────────────┘                                                              
```

---

## 📦 Installation

### Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **Package Manager**: npm, yarn, or pnpm
- **TypeScript**: Version 5.0.0 or higher (for type support)

### Using npm

```bash
npm install agent-protocol
```

### Using yarn

```bash
yarn add agent-protocol
```

### Using pnpm

```bash
pnpm add agent-protocol
```

### Building from Source

```bash
# Clone the repository
git clone https://github.com/moggan1337/agent-protocol.git
cd agent-protocol

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

### TypeScript Configuration

For the best TypeScript experience, ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  }
}
```

---

## ⚡ Quick Start

### Basic Agent Example

```typescript
import { Agent, AgentIdentity, Capability } from 'agent-protocol';

// Define agent identity
const identity: AgentIdentity = {
  id: 'my-first-agent',
  name: 'My First Agent',
  version: '1.0.0',
  type: 'agent',
};

// Define capabilities
const capabilities: Capability[] = [
  {
    name: 'greet',
    version: '1.0.0',
    description: 'Greets the user',
    inputTypes: ['text'],
    outputTypes: ['text'],
  },
];

// Create agent
const agent = new Agent({
  identity,
  capabilities,
  endpoint: 'memory://my-first-agent',
});

// Register a handler
agent.registerHandler('greet', async (request) => {
  const name = request.content[0].text;
  
  return {
    id: crypto.randomUUID(),
    type: 'response',
    timestamp: Date.now(),
    version: '1.0.0',
    requestId: request.requestId,
    status: 'success',
    content: [{ type: 'text', text: `Hello, ${name}!` }],
  };
});

// Start and use
async function main() {
  await agent.start();
  
  const response = await agent.process({
    id: 'msg_1',
    type: 'request',
    timestamp: Date.now(),
    version: '1.0.0',
    requestId: 'req_001',
    action: 'greet',
    sender: { id: 'client', name: 'Client' },
    content: [{ type: 'text', text: 'World' }],
  });
  
  console.log(response.content[0].text); // "Hello, World!"
  
  await agent.stop();
}

main();
```

### Multi-Agent Communication

```typescript
import { 
  Agent, 
  AgentRegistry, 
  Router, 
  MemoryTransport 
} from 'agent-protocol';

// Create specialized agents
const searchAgent = new Agent({
  identity: { id: 'search', name: 'Search Agent', type: 'agent' },
  capabilities: [{ name: 'search', version: '1.0.0', description: 'Web search', inputTypes: ['text'], outputTypes: ['text'] }],
  endpoint: 'memory://search',
});

const analyzerAgent = new Agent({
  identity: { id: 'analyzer', name: 'Analyzer Agent', type: 'agent' },
  capabilities: [{ name: 'analyze', version: '1.0.0', description: 'Data analysis', inputTypes: ['text'], outputTypes: ['text'] }],
  endpoint: 'memory://analyzer',
});

// Create registry and router
const registry = new AgentRegistry({ name: 'main', type: 'local' });
const transport = new MemoryTransport();
const router = new Router({ registry, transport });

// Register handlers and start
async function main() {
  await registry.start();
  await searchAgent.start();
  await analyzerAgent.start();
  await router.start();

  await registry.register(searchAgent.getInfo());
  await registry.register(analyzerAgent.getInfo());

  // Agents can now discover and communicate with each other
  const agents = registry.getAllHealthy();
  console.log('Available agents:', agents.map(a => a.identity.name));

  await router.stop();
  await searchAgent.stop();
  await analyzerAgent.stop();
  await registry.stop();
}

main();
```

---

## 📚 Core Concepts

### 1. Agents

An **Agent** is the fundamental unit of the protocol. Each agent has:

- **Identity**: Unique ID, name, version, and type
- **Capabilities**: What actions the agent can perform
- **Endpoint**: Where to reach the agent
- **Handlers**: Functions that process incoming requests

```typescript
const agent = new Agent({
  identity: {
    id: 'unique-agent-id',
    name: 'Agent Name',
    version: '1.0.0',
    type: 'agent',  // or 'user', 'system', 'service'
  },
  capabilities: [
    {
      name: 'action-name',
      version: '1.0.0',
      description: 'What this action does',
      inputTypes: ['text', 'image'],
      outputTypes: ['text', 'data'],
      parameters: [
        { name: 'param1', type: 'string', required: true, description: 'Description' }
      ],
      rateLimit: { requests: 100, window: 60 }, // per minute
    },
  ],
  endpoint: 'memory://agent-id',
  metadata: { author: 'team', environment: 'production' },
});
```

### 2. Messages

The protocol defines several message types:

| Type | Description | Use Case |
|------|-------------|----------|
| `request` | Ask an agent to perform an action | Main communication |
| `response` | Return results from a request | API responses |
| `stream-start` | Begin a streaming response | Real-time output |
| `stream-chunk` | Part of a streaming response | Progressive data |
| `stream-end` | Complete a streaming response | End of stream |
| `error` | Report an error | Error handling |
| `heartbeat` | Health check | Monitoring |
| `close` | Graceful shutdown | Cleanup |
| `discovery-request` | Find agents | Service discovery |
| `discovery-response` | Return agent list | Service discovery |
| `capability-query` | Query capabilities | Finding specific skills |
| `capability-response` | Return capabilities | Capability lookup |
| `handoff` | Transfer to another agent | Agent collaboration |

### 3. Content Types

Messages can contain various content types:

```typescript
// Text content
{ type: 'text', text: 'Hello, world!', format: 'markdown' }

// Image content
{ type: 'image', url: 'https://...', mimeType: 'image/png', width: 800, height: 600 }

// Code content
{ type: 'code', code: 'const x = 1;', language: 'javascript', filename: 'example.js' }

// Data content
{ type: 'data', format: 'json', content: '{"key": "value"}' }

// Stream reference
{ type: 'stream', streamId: 'stream_123', format: 'text' }
```

### 4. Capabilities

Capabilities define what an agent can do:

```typescript
interface Capability {
  name: string;                    // Unique action name
  version: string;                  // Semantic version
  description: string;             // Human-readable description
  inputTypes: ContentType[];       // What it accepts
  outputTypes: ContentType[];      // What it returns
  parameters?: CapabilityParameter[]; // Expected parameters
  authentication?: AuthenticationMethod;
  rateLimit?: RateLimit;
  metadata?: Record<string, unknown>;
}

interface CapabilityParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  default?: unknown;
  description: string;
}
```

### 5. Transport Layer

The transport layer handles message delivery:

| Transport | Description | Use Case |
|----------|-------------|----------|
| `memory` | In-process communication | Same machine, testing |
| `http` | REST-like communication | Web APIs, microservices |
| `websocket` | Real-time bidirectional | Live updates, streaming |

---

## 🔧 Detailed Usage

### Creating a Custom Agent

```typescript
import { Agent, AgentIdentity, Capability, Content } from 'agent-protocol';

interface MyAgentConfig {
  identity: AgentIdentity;
  capabilities: Capability[];
}

class MyAgent extends Agent {
  private state: Map<string, any> = new Map();

  constructor(config: MyAgentConfig) {
    super({
      ...config,
      endpoint: `memory://${config.identity.id}`,
    });

    this.registerHandlers();
  }

  private registerHandlers() {
    // Basic text processing
    this.registerHandler('process', async (request) => {
      const text = this.extractText(request.content);
      const result = this.processText(text);
      
      return {
        id: this.generateId(),
        type: 'response',
        timestamp: Date.now(),
        version: '1.0.0',
        requestId: request.requestId,
        status: 'success',
        content: [{ type: 'text', text: result }],
      };
    });

    // Streaming handler
    this.registerStreamHandler('stream-process', async function* (request) {
      const text = this.extractText(request.content);
      const words = text.split(' ');
      
      for (const word of words) {
        await new Promise(resolve => setTimeout(resolve, 100));
        yield { type: 'text', text: word };
      }
    });

    // Error handling
    this.registerHandler('error-prone', async (request) => {
      throw new Error('Something went wrong!');
    });
  }

  private extractText(content: Content[]): string {
    return content
      .filter(c => c.type === 'text')
      .map(c => (c as any).text)
      .join(' ');
  }

  private processText(text: string): string {
    return text.toUpperCase();
  }

  async start(): Promise<void> {
    console.log(`Starting agent: ${this.getIdentity().name}`);
    this.running = true;
  }

  async stop(): Promise<void> {
    console.log(`Stopping agent: ${this.getIdentity().name}`);
    this.running = false;
  }
}

// Usage
const agent = new MyAgent({
  identity: { id: 'my-agent', name: 'My Custom Agent', type: 'agent' },
  capabilities: [
    {
      name: 'process',
      version: '1.0.0',
      description: 'Process text',
      inputTypes: ['text'],
      outputTypes: ['text'],
    },
  ],
});
```

### Using the Registry

```typescript
import { AgentRegistry, CapabilityMatcher } from 'agent-protocol';

// Create registry
const registry = new AgentRegistry({
  name: 'production-registry',
  type: 'local',  // or 'distributed', 'blockchain'
});

// Start registry
await registry.start();

// Register an agent
await registry.register({
  identity: { id: 'agent-1', name: 'Agent One', type: 'agent' },
  capabilities: [
    {
      name: 'text-generation',
      version: '1.0.0',
      description: 'Generates text',
      inputTypes: ['text'],
      outputTypes: ['text'],
    },
  ],
  endpoint: 'memory://agent-1',
});

// Find agents by capability
const textAgents = registry.findByCapability('text-generation');

// Find agents by multiple capabilities
const agents = registry.findByCapabilities(['text-generation', 'summarization'], false); // requireAny=false means AND

// Get all healthy agents
const healthyAgents = registry.getAllHealthy();

// Get registry statistics
const stats = registry.getStats();
console.log(`
  Total: ${stats.total}
  Healthy: ${stats.healthy}
  By Capability: ${JSON.stringify(stats.byCapability)}
`);

// Capability matching with scoring
const matches = CapabilityMatcher.match(registry, ['text-generation'], ['text']);
for (const match of matches) {
  console.log(`Agent: ${match.agent.identity.name}, Score: ${match.score}`);
}

// Unregister
await registry.unregister('agent-1');

// Stop registry
await registry.stop();
```

### Using the Router

```typescript
import { Router, AgentRegistry, MemoryTransport, LoadBalancer } from 'agent-protocol';

// Setup
const registry = new AgentRegistry({ name: 'router-registry', type: 'local' });
const transport = new MemoryTransport();

const router = new Router({
  registry,
  transport,
  enableDiscovery: true,
  enableCapabilityQuery: true,
  defaultTimeout: 30000, // 30 seconds
});

// Start everything
await registry.start();
await transport.connect();
await router.start();

// Route a request
const request = {
  id: 'msg_1',
  type: 'request' as const,
  timestamp: Date.now(),
  version: '1.0.0',
  requestId: 'req_001',
  action: 'chat',
  sender: { id: 'client', name: 'Client' },
  content: [{ type: 'text', text: 'Hello!' }],
};

const result = await router.route(request);

if (result.success) {
  console.log('Response:', result.response);
  console.log('Routed to:', result.routedTo);
} else {
  console.error('Error:', result.error);
}

// Get router stats
const stats = router.getStats();
console.log('Router running:', stats.running);
console.log('Registry stats:', stats.registryStats);

// Stop
await router.stop();
await transport.disconnect();
await registry.stop();
```

### Load Balancing

```typescript
import { LoadBalancer } from 'agent-protocol';

// Configure load balancer
const loadBalancer = new LoadBalancer({
  strategy: 'least-loaded', // or 'round-robin', 'random', 'weighted'
  weights: {
    'agent-1': 2,  // Gets 2x traffic
    'agent-2': 1,
    'agent-3': 1,
  },
});

// Add agents
loadBalancer.addAgent({ identity: { id: 'agent-1', name: 'Agent 1' }, capabilities: [], endpoint: 'mem://1' });
loadBalancer.addAgent({ identity: { id: 'agent-2', name: 'Agent 2' }, capabilities: [], endpoint: 'mem://2' });
loadBalancer.addAgent({ identity: { id: 'agent-3', name: 'Agent 3' }, capabilities: [], endpoint: 'mem://3' });

// Select agent for request
const selectedAgent = loadBalancer.select();
console.log('Selected:', selectedAgent.identity.name);

// Record request lifecycle
loadBalancer.recordRequestStart(selectedAgent.identity.id);
// ... process request ...
loadBalancer.recordRequestEnd(selectedAgent.identity.id);

// Get load stats
const stats = loadBalancer.getStats();
console.log('Current loads:', stats);
```

### Streaming Responses

```typescript
import { Agent } from 'agent-protocol';

const streamingAgent = new Agent({
  identity: { id: 'stream-agent', name: 'Streaming Agent', type: 'agent' },
  capabilities: [{
    name: 'generate',
    version: '1.0.0',
    description: 'Generate streaming text',
    inputTypes: ['text'],
    outputTypes: ['stream', 'text'],
  }],
  endpoint: 'memory://stream-agent',
});

// Register streaming handler
streamingAgent.registerStreamHandler('generate', async function* (request) {
  const prompt = request.content[0].text;
  const words = prompt.split(' ');
  
  for (const word of words) {
    await new Promise(resolve => setTimeout(resolve, 200));
    yield { type: 'text', text: word + ' ' };
  }
  
  yield { type: 'text', text: '[DONE]' };
});

// Process the streaming request
const response = await streamingAgent.process({
  id: 'stream_req_1',
  type: 'request',
  timestamp: Date.now(),
  version: '1.0.0',
  requestId: 'stream_001',
  action: 'generate',
  sender: { id: 'client', name: 'Client' },
  content: [{ type: 'text', text: 'Hello world this is streaming' }],
});

// The response will indicate streaming was initiated
console.log('Stream initiated:', response);
```

---

## 📖 API Reference

### Agent Class

```typescript
import { Agent, AgentConfig, RequestHandler, StreamHandler } from 'agent-protocol';

// Configuration
interface AgentConfig {
  identity: AgentIdentity;
  capabilities: Capability[];
  endpoint: string;
  metadata?: Record<string, unknown>;
}

// Create agent (must be extended)
class MyAgent extends Agent {
  constructor(config: AgentConfig) {
    super(config);
  }

  async start(): Promise<void> {
    // Initialize resources
  }

  async stop(): Promise<void> {
    // Cleanup resources
  }
}

// Methods
const agent = new MyAgent(config);

// Identity & Info
agent.getIdentity(): AgentIdentity
agent.getCapabilities(): Capability[]
agent.getEndpoint(): string

// Handlers
agent.registerHandler(action: string, handler: RequestHandler): void
agent.registerStreamHandler(action: string, handler: StreamHandler): void
agent.addEventListener(handler: EventHandler): void
agent.removeEventListener(handler: EventHandler): void

// Processing
agent.process(message: AgentMessage): Promise<AgentMessage>
agent.getMetrics(): AgentMetrics
```

### Registry Class

```typescript
import { AgentRegistry, CapabilityMatcher, RegistryConfig } from 'agent-protocol';

// Configuration
interface RegistryConfig {
  name: string;
  type: 'local' | 'distributed' | 'blockchain';
  peers?: string[];
}

// Create registry
const registry = new AgentRegistry(config);

// Lifecycle
await registry.start(): Promise<void>
await registry.stop(): Promise<void>

// Registration
await registry.register(agent: AgentInfo): Promise<void>
await registry.unregister(agentId: string): Promise<boolean>
await registry.heartbeat(agentId: string): Promise<boolean>
await registry.updateHealth(agentId: string, health: HealthStatus): Promise<boolean>

// Discovery
registry.findByCapability(capability: string): AgentInfo[]
registry.findByCapabilities(requiredCapabilities: string[], requireAll?: boolean): AgentInfo[]
registry.findById(agentId: string): AgentInfo | undefined
registry.findByName(name: string): AgentInfo[]
registry.getAllHealthy(): AgentInfo[]
registry.getAll(): AgentInfo[]
registry.getStats(): RegistryStats

// Capability Matching
CapabilityMatcher.match(registry, requiredCapabilities, preferredInputTypes?): CapabilityMatch[]
CapabilityMatcher.supports(agent: AgentInfo, action: string): boolean
```

### Router Class

```typescript
import { Router, RouterConfig, LoadBalancer } from 'agent-protocol';

// Configuration
interface RouterConfig {
  registry: AgentRegistry;
  transport: Transport;
  enableDiscovery?: boolean;
  enableCapabilityQuery?: boolean;
  defaultTimeout?: number;
}

// Create router
const router = new Router(config);

// Lifecycle
await router.start(): Promise<void>
await router.stop(): Promise<void>

// Routing
router.route(request: RequestMessage): Promise<RouteResult>
router.getStats(): RouterStats

// Route Result
interface RouteResult {
  success: boolean;
  response?: ResponseMessage;
  error?: string;
  routedTo?: string;
}
```

### Transport Classes

```typescript
import { 
  MemoryTransport, 
  HTTPTransport, 
  WebSocketTransport,
  createTransport,
  TransportConfig 
} from 'agent-protocol';

// Memory Transport (same-process communication)
const memoryTransport = new MemoryTransport({ type: 'memory' });
await memoryTransport.connect();
await memoryTransport.send(message, recipient);
await memoryTransport.request(message, timeout);
memoryTransport.getMessages(agentId): AgentMessage[];

// HTTP Transport (REST communication)
const httpTransport = new HTTPTransport({ 
  type: 'http',
  url: 'http://localhost:3000',
  apiKey: 'your-api-key',
});
httpTransport.startPolling(interval); // Poll for incoming messages

// WebSocket Transport (real-time communication)
const wsTransport = new WebSocketTransport({ 
  type: 'websocket',
  url: 'ws://localhost:3000',
});
wsTransport.onMessage(handler);
wsTransport.offMessage(handler);

// Factory function
const transport = createTransport(config, identity?): Transport;

// Common Transport Methods
transport.connect(): Promise<void>
transport.disconnect(): Promise<void>
transport.send(message: AgentMessage, recipient?: AgentIdentity): Promise<void>
transport.request(message: AgentMessage, timeout?: number): Promise<AgentMessage>
transport.onMessage(handler: MessageHandler): void
transport.offMessage(handler: MessageHandler): void
transport.getType(): TransportType
transport.isConnected(): boolean
```

### Load Balancer Class

```typescript
import { LoadBalancer, LoadBalancerConfig } from 'agent-protocol';

// Configuration
interface LoadBalancerConfig {
  strategy: 'round-robin' | 'least-loaded' | 'random' | 'weighted';
  weights?: Record<string, number>;
}

// Create load balancer
const lb = new LoadBalancer(config);

// Agent Management
lb.addAgent(agent: AgentInfo): void
lb.removeAgent(agentId: string): void

// Selection
lb.select(): AgentInfo | undefined

// Recording
lb.recordRequestStart(agentId: string): void
lb.recordRequestEnd(agentId: string): void

// Statistics
lb.getStats(): Record<string, number>
```

### Message Types

```typescript
// All message types are exported from the main module
import { 
  AgentMessage,
  RequestMessage,
  ResponseMessage,
  StreamStartMessage,
  StreamChunkMessage,
  StreamEndMessage,
  ErrorMessage,
  HeartbeatMessage,
  CloseMessage,
  DiscoveryRequestMessage,
  DiscoveryResponseMessage,
  CapabilityQueryMessage,
  CapabilityResponseMessage,
  HandoffMessage,
} from 'agent-protocol';

// Type guards
isRequest(msg: AgentMessage): boolean
isResponse(msg: AgentMessage): boolean
isStreamStart(msg: AgentMessage): boolean
isStreamChunk(msg: AgentMessage): boolean
isStreamEnd(msg: AgentMessage): boolean
isError(msg: AgentMessage): boolean
isCapabilityQuery(msg: AgentMessage): boolean
isDiscoveryRequest(msg: AgentMessage): boolean
isHandoff(msg: AgentMessage): boolean
isHeartbeat(msg: AgentMessage): boolean
isClose(msg: AgentMessage): boolean
```

---

## ⚙️ Configuration Options

### Agent Configuration

```typescript
const config: AgentConfig = {
  identity: {
    id: 'unique-id',
    name: 'My Agent',
    version: '1.0.0',
    type: 'agent',
    metadata: { /* custom metadata */ },
  },
  capabilities: [
    {
      name: 'action',
      version: '1.0.0',
      description: 'Does something',
      inputTypes: ['text'],
      outputTypes: ['text'],
      parameters: [
        { name: 'param', type: 'string', required: false, default: 'default', description: '...' },
      ],
      rateLimit: { requests: 100, window: 60 },
    },
  ],
  endpoint: 'memory://my-agent', // or 'http://localhost:3000', 'ws://localhost:3000'
  metadata: { environment: 'production' },
};
```

### Registry Configuration

```typescript
// Local registry (single process)
const localConfig: RegistryConfig = {
  name: 'local-registry',
  type: 'local',
};

// Distributed registry (multiple nodes)
const distConfig: RegistryConfig = {
  name: 'distributed-registry',
  type: 'distributed',
  peers: ['http://node1:3000', 'http://node2:3000', 'http://node3:3000'],
};
```

### Router Configuration

```typescript
const routerConfig: RouterConfig = {
  registry: myRegistry,
  transport: myTransport,
  enableDiscovery: true,         // Enable discovery requests
  enableCapabilityQuery: true,    // Enable capability queries
  defaultTimeout: 30000,          // 30 second default timeout
};
```

### Transport Configuration

```typescript
// Memory Transport
const memoryConfig = {
  type: 'memory' as const,
};

// HTTP Transport
const httpConfig = {
  type: 'http' as const,
  url: 'http://localhost:3000',
  headers: { 'X-Custom': 'header' },
  apiKey: 'optional-api-key',
};

// WebSocket Transport
const wsConfig = {
  type: 'websocket' as const,
  url: 'ws://localhost:3000',
  headers: { 'X-Custom': 'header' },
};
```

### Load Balancer Configuration

```typescript
// Round-robin (equal distribution)
const roundRobinConfig = {
  strategy: 'round-robin' as const,
};

// Least-loaded (busiest agent gets fewer requests)
const leastLoadedConfig = {
  strategy: 'least-loaded' as const,
};

// Weighted (higher weight = more traffic)
const weightedConfig = {
  strategy: 'weighted' as const,
  weights: {
    'agent-1': 3,  // 3x traffic
    'agent-2': 2,  // 2x traffic
    'agent-3': 1,  // 1x traffic
  },
};

// Random
const randomConfig = {
  strategy: 'random' as const,
};
```

---

## 🔄 Advanced Patterns

### Agent-to-Agent Handoff

Transfer context between agents when one agent delegates to another:

```typescript
import { Agent, HandoffMessage, HistoryEntry } from 'agent-protocol';

// Agent A receives a request it can't fully handle
agentA.registerHandler('complex-task', async (request) => {
  const history: HistoryEntry[] = [
    { timestamp: Date.now(), role: 'user', content: request.content },
  ];
  
  // Create handoff message
  const handoff: HandoffMessage = {
    id: crypto.randomUUID(),
    type: 'handoff',
    timestamp: Date.now(),
    version: '1.0.0',
    from: agentA.getIdentity(),
    to: { id: 'agent-b', name: 'Agent B', type: 'agent' },
    requestId: request.requestId,
    context: { taskId: 'task-123', priority: 'high' },
    history,
    reason: 'Agent B has better tools for this task',
  };
  
  // Send handoff via transport
  await transport.send(handoff);
  
  return {
    id: crypto.randomUUID(),
    type: 'response',
    timestamp: Date.now(),
    version: '1.0.0',
    requestId: request.requestId,
    status: 'success',
    content: [{ type: 'text', text: 'Request forwarded to Agent B' }],
  };
});

// Agent B receives handoff and continues
agentB.registerHandler('process-handoff', async (request) => {
  // Access history from handoff
  const conversationHistory = request.history; // Available in handoff context
  
  // Process with full context
  const response = await processWithContext(conversationHistory);
  
  return {
    id: crypto.randomUUID(),
    type: 'response',
    timestamp: Date.now(),
    version: '1.0.0',
    requestId: request.requestId,
    status: 'success',
    content: [{ type: 'text', text: response }],
  };
});
```

### Multi-Stage Processing Pipeline

Chain multiple specialized agents:

```typescript
import { Router, AgentRegistry, LoadBalancer } from 'agent-protocol';

class ProcessingPipeline {
  private stages: Agent[] = [];
  private registry: AgentRegistry;
  
  constructor(registry: AgentRegistry) {
    this.registry = registry;
  }
  
  addStage(agent: Agent, capability: string): void {
    this.stages.push(agent);
    this.registry.register(agent.getInfo());
  }
  
  async process(input: Content[]): Promise<Content[]> {
    let current = input;
    
    for (const stage of this.stages) {
      const response = await this.sendToStage(stage, current);
      current = response.content;
    }
    
    return current;
  }
  
  private async sendToStage(agent: Agent, input: Content[]): Promise<ResponseMessage> {
    // Route to agent via capability
    const result = await router.route({
      id: crypto.randomUUID(),
      type: 'request',
      timestamp: Date.now(),
      version: '1.0.0',
      requestId: crypto.randomUUID(),
      action: 'process',
      sender: { id: 'pipeline', name: 'Pipeline' },
      content: input,
    });
    
    return result.response!;
  }
}

// Usage
const pipeline = new ProcessingPipeline(registry);
pipeline.addStage(tokenizer, 'tokenize');
pipeline.addStage(analyzer, 'analyze');
pipeline.addStage(generator, 'generate');

const result = await pipeline.process([{ type: 'text', text: 'Hello world' }]);
```

### Service Mesh Pattern

Multiple routers with distributed registry:

```typescript
import { AgentRegistry, Router, HTTPTransport } from 'agent-protocol';

// Regional registries
const registries = {
  usEast: new AgentRegistry({ name: 'us-east', type: 'distributed', peers: [...] }),
  usWest: new AgentRegistry({ name: 'us-west', type: 'distributed', peers: [...] }),
  euCentral: new AgentRegistry({ name: 'eu-central', type: 'distributed', peers: [...] }),
};

// Regional routers
const routers = {
  usEast: new Router({ registry: registries.usEast, transport: new HTTPTransport({ type: 'http', url: 'http://use1.agent.local' }) }),
  usWest: new Router({ registry: registries.usWest, transport: new HTTPTransport({ type: 'http', url: 'http://usw1.agent.local' }) }),
  euCentral: new Router({ registry: registries.euCentral, transport: new HTTPTransport({ type: 'http', url: 'http://euc1.agent.local' }) }),
};

// Global router (routes to regional routers)
class GlobalRouter {
  async route(request: RequestMessage): Promise<RouteResult> {
    const region = this.determineRegion(request);
    const regionalRouter = this.routers[region];
    return regionalRouter.route(request);
  }
  
  private determineRegion(request: RequestMessage): string {
    // Logic to determine best region
    const metadata = request.metadata as { region?: string };
    return metadata?.region || 'usEast';
  }
}
```

### Event-Driven Architecture

Use events for loose coupling:

```typescript
import { Agent } from 'agent-protocol';

// Event aggregator agent
class EventAggregator extends Agent {
  private subscribers: Map<string, AgentIdentity[]> = new Map();
  
  constructor() {
    super({
      identity: { id: 'events', name: 'Event Aggregator', type: 'agent' },
      capabilities: [{ name: 'event', version: '1.0.0', description: 'Event handling', inputTypes: ['data'], outputTypes: ['text'] }],
      endpoint: 'memory://events',
    });
    
    this.registerHandler('subscribe', async (request) => {
      const { eventType, subscriber } = request.content[0] as any;
      const subs = this.subscribers.get(eventType) || [];
      subs.push(subscriber);
      this.subscribers.set(eventType, subs);
      
      return { status: 'success' };
    });
    
    this.registerHandler('publish', async (request) => {
      const { eventType, payload } = request.content[0] as any;
      const subs = this.subscribers.get(eventType) || [];
      
      for (const subscriber of subs) {
        await this.transport.send({
          id: crypto.randomUUID(),
          type: 'request',
          timestamp: Date.now(),
          version: '1.0.0',
          requestId: crypto.randomUUID(),
          action: 'on-event',
          sender: this.getIdentity(),
          recipient: subscriber,
          content: [{ type: 'data', format: 'json', content: JSON.stringify(payload) }],
        });
      }
      
      return { status: 'success', content: [{ type: 'text', text: `Published to ${subs.length} subscribers` }] };
    });
  }
  
  async start(): Promise<void> {}
  async stop(): Promise<void> {}
}
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Agent Not Discovering Other Agents

**Problem**: Agents registered in the registry are not being discovered.

**Solutions**:

```typescript
// Ensure registry is started before registering
await registry.start();
await registry.register(agent.getInfo());

// Check health status
const stats = registry.getStats();
console.log('Healthy agents:', stats.healthy);

// Manually trigger heartbeat
await registry.heartbeat('agent-id');

// Check capability matching
const agents = registry.findByCapability('action-name');
console.log('Found agents:', agents.length);
```

#### 2. Request Timeout Errors

**Problem**: Requests timeout before receiving responses.

**Solutions**:

```typescript
// Increase timeout
const router = new Router({
  registry,
  transport,
  defaultTimeout: 60000, // 60 seconds
});

// Check agent is running
if (!agent.running) {
  await agent.start();
}

// Verify endpoint is correct
console.log('Agent endpoint:', agent.getEndpoint());

// Check network connectivity (for HTTP/WebSocket)
try {
  await transport.connect();
  console.log('Transport connected:', transport.isConnected());
} catch (error) {
  console.error('Connection failed:', error);
}
```

#### 3. Transport Not Connected

**Problem**: `Transport not connected` errors.

**Solutions**:

```typescript
// Always connect before sending
await transport.connect();
console.log('Connected:', transport.isConnected());

// Handle reconnection
async function ensureConnected(transport: Transport) {
  if (!transport.isConnected()) {
    await transport.connect();
  }
}

// For WebSocket, check reconnection logic
wsTransport.on('close', () => {
  console.log('Connection closed, will reconnect automatically');
});
```

#### 4. Handler Not Found

**Problem**: `ACTION_NOT_FOUND` errors when calling an agent.

**Solutions**:

```typescript
// Verify handler is registered
agent.registerHandler('my-action', async (request) => {
  return { status: 'success', content: [] };
});

// Check the action name matches
const request = {
  action: 'my-action', // Must match exactly
  // ...
};

// List registered handlers
console.log('Registered handlers:', Array.from(agent.handlers.keys()));
```

#### 5. Message Format Errors

**Problem**: Messages are rejected due to format issues.

**Solutions**:

```typescript
// Ensure all required fields are present
const request = {
  id: crypto.randomUUID(),          // Required
  type: 'request' as const,         // Required
  timestamp: Date.now(),            // Required
  version: '1.0.0',                 // Required
  requestId: crypto.randomUUID(),  // Required for requests
  action: 'action-name',            // Required for requests
  sender: { id: 'client', name: 'Client' },  // Required
  content: [{ type: 'text', text: 'Hello' }], // Required
};

// Use type guards to validate
import { isRequest, isResponse } from 'agent-protocol';

if (isRequest(message)) {
  console.log('Valid request:', message.action);
} else if (isResponse(message)) {
  console.log('Valid response:', message.status);
}
```

#### 6. Memory Transport Not Receiving Messages

**Problem**: Messages sent via MemoryTransport not being received.

**Solutions**:

```typescript
// Register message handler
transport.onMessage((message) => {
  console.log('Received:', message);
});

// For direct retrieval
const messages = transport.getMessages('recipient-id');
for (const msg of messages) {
  console.log('Queued message:', msg);
}

// Check queue
console.log('Queues:', Array.from(transport.queues.keys()));
```

### Debug Mode

Enable detailed logging:

```typescript
// Add logging to event handlers
agent.addEventListener((event) => {
  console.log(`[${agent.getIdentity().name}] Event:`, {
    type: event.type,
    id: event.id,
    timestamp: new Date(event.timestamp).toISOString(),
  });
});

// Log all handler calls
const originalHandler = agent.handlers.get('action');
agent.registerHandler('action', async (request) => {
  console.log(`[Handler] Processing:`, request.action);
  const result = await originalHandler!(request);
  console.log(`[Handler] Completed:`, result.status);
  return result;
});

// Monitor registry changes
registry.on('register', (agent) => console.log('Registered:', agent.identity.name));
registry.on('unregister', (id) => console.log('Unregistered:', id));
```

### Testing Tips

```typescript
// Test with EchoAgent
import { EchoAgent } from 'agent-protocol';

const echo = new EchoAgent();
await echo.start();

// Simple test
const response = await echo.process({
  id: 'test-1',
  type: 'request',
  timestamp: Date.now(),
  version: '1.0.0',
  requestId: 'test-req-1',
  action: 'echo',
  sender: { id: 'test', name: 'Test' },
  content: [{ type: 'text', text: 'test' }],
});

console.assert(response.type === 'response', 'Should be response');
console.assert((response.content[0] as any).text === 'test', 'Should echo');
```

### Getting Help

- **GitHub Issues**: [Report bugs](https://github.com/moggan1337/agent-protocol/issues)
- **Discussions**: [Ask questions](https://github.com/moggan1337/agent-protocol/discussions)
- **Documentation**: [Full docs](https://github.com/moggan1337/agent-protocol#readme)

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/agent-protocol.git
cd agent-protocol

# Install dependencies
npm install

# Create a feature branch
git checkout -b feature/amazing-feature

# Make your changes
# ... edit code ...

# Run tests
npm test

# Run linting
npm run lint

# Build
npm run build
```

### Pull Request Process

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request
6. Wait for review and address feedback

### Code Style

- Use TypeScript with strict mode
- Follow ESLint configuration
- Add JSDoc comments for public APIs
- Include tests for new features

---

## 📁 Project Structure

```
agent-protocol/
├── src/
│   ├── agent.ts         # Base Agent class
│   ├── messages.ts      # Message types and type guards
│   ├── protocol.ts      # Protocol exports
│   ├── registry.ts      # Agent registry and capability matching
│   ├── router.ts        # Message routing and load balancing
│   └── transport.ts     # Transport implementations
├── examples/
│   ├── basic-agent.ts         # Simple agent example
│   ├── multi-agent-chat.ts    # Multi-agent communication
│   └── http-server.ts        # HTTP server example
├── docs/                 # Additional documentation
├── logo.svg              # Project logo
├── architecture.svg      # Architecture diagram
├── package.json
├── tsconfig.json
└── README.md
```

---

## 📄 License

MIT License - see [LICENSE](LICENSE)

Copyright (c) 2024 moggan1337

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

<p align="center">
  <strong>Building the foundation for agent communication</strong>
</p>
