# Agent Protocol

<p align="center">
  <img src="logo.svg" alt="Agent Protocol" width="300"/>
</p>

<p align="center">
  <strong>Universal protocol for AI agent communication</strong>
</p>

<p align="center">
  <a href="https://github.com/moggan1337/agent-protocol/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License"/>
  </a>
</p>

---

## What is Agent Protocol?

A universal communication protocol for AI agents. Like TCP/IP is to the internet, Agent Protocol provides the foundation for agents to discover, communicate, and collaborate.

## Features

- **Universal Messages** - Standardized message types for all agent interactions
- **Capability Discovery** - Agents advertise and discover each other's capabilities
- **Smart Routing** - Intelligent message routing with load balancing
- **Multiple Transports** - HTTP, WebSocket, and in-memory transport support
- **Service Registry** - Built-in service discovery

## Quick Start

```typescript
import { Agent, Message, createServer } from 'agent-protocol';

// Create an agent
const agent = new Agent({
  id: 'my-agent',
  name: 'My Agent',
  capabilities: ['text', 'reasoning']
});

// Send a message
const response = await agent.send({
  to: 'other-agent',
  type: 'request',
  content: 'Hello!'
});
```

## Architecture

<img src="architecture.svg" alt="Architecture" width="100%"/>

## Installation

```bash
npm install agent-protocol
```

## License

MIT
