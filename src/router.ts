/**
 * Agent Protocol - Router
 * 
 * Routes messages between agents using the registry.
 */

import {
  AgentMessage,
  RequestMessage,
  ResponseMessage,
  AgentIdentity,
  Content,
  DiscoveryRequestMessage,
  DiscoveryResponseMessage,
  CapabilityQueryMessage,
  CapabilityResponseMessage,
} from './messages.js';
import { AgentRegistry, AgentInfo } from './registry.js';
import { Transport } from './transport.js';

export interface RouterConfig {
  registry: AgentRegistry;
  transport: Transport;
  enableDiscovery?: boolean;
  enableCapabilityQuery?: boolean;
  defaultTimeout?: number;
}

export interface RouteResult {
  success: boolean;
  response?: ResponseMessage;
  error?: string;
  routedTo?: string;
}

/**
 * Router
 * 
 * Routes messages between agents using registry-based discovery.
 */
export class Router {
  private registry: AgentRegistry;
  private transport: Transport;
  private config: RouterConfig;
  private running = false;

  constructor(config: RouterConfig) {
    this.config = config;
    this.registry = config.registry;
    this.transport = config.transport;
  }

  /**
   * Start the router
   */
  async start(): Promise<void> {
    this.running = true;

    // Set up message handler
    this.transport.onMessage(async (message) => {
      await this.handleMessage(message);
    });

    console.log('Router started');
  }

  /**
   * Stop the router
   */
  async stop(): Promise<void> {
    this.running = false;
    await this.transport.disconnect();
    console.log('Router stopped');
  }

  /**
   * Handle incoming message
   */
  private async handleMessage(message: AgentMessage): Promise<void> {
    try {
      if (this.config.enableDiscovery !== false && message.type === 'discovery-request') {
        await this.handleDiscovery(message as DiscoveryRequestMessage);
      } else if (this.config.enableCapabilityQuery !== false && message.type === 'capability-query') {
        await this.handleCapabilityQuery(message as CapabilityQueryMessage);
      } else if (message.type === 'request') {
        await this.handleRequest(message as RequestMessage);
      }
    } catch (error) {
      console.error('Router error:', error);
    }
  }

  /**
   * Handle discovery request
   */
  private async handleDiscovery(message: DiscoveryRequestMessage): Promise<void> {
    const { query } = message;

    let agents: AgentInfo[];

    if (query.capabilities && query.capabilities.length > 0) {
      agents = this.registry.findByCapabilities(query.capabilities);
    } else if (query.name) {
      agents = this.registry.findByName(query.name);
    } else {
      agents = this.registry.getAllHealthy();
    }

    const response: DiscoveryResponseMessage = {
      id: this.generateId(),
      type: 'discovery-response',
      timestamp: Date.now(),
      version: '1.0.0',
      agents,
    };

    // Send response back to requester
    await this.transport.send(response, message.sender);
  }

  /**
   * Handle capability query
   */
  private async handleCapabilityQuery(message: CapabilityQueryMessage): Promise<void> {
    const { query } = message;

    let agents: AgentInfo[];

    if (query.inputTypes && query.inputTypes.length > 0) {
      // Find agents supporting the input types
      agents = this.registry.getAllHealthy().filter((agent) =>
        agent.capabilities.some((cap) =>
          query.inputTypes!.some((t) => cap.inputTypes.includes(t))
        )
      );
    } else if (query.action) {
      agents = this.registry.findByCapability(query.action);
    } else {
      agents = this.registry.getAllHealthy();
    }

    const response: CapabilityResponseMessage = {
      id: this.generateId(),
      type: 'capability-response',
      timestamp: Date.now(),
      version: '1.0.0',
      capabilities: agents.flatMap((a) => a.capabilities),
    };

    await this.transport.send(response, message.sender);
  }

  /**
   * Handle request and route to appropriate agent
   */
  private async handleRequest(message: RequestMessage): Promise<void> {
    const result = await this.route(message);

    // Send response back to sender
    if (result.response) {
      await this.transport.send(result.response, message.sender);
    }
  }

  /**
   * Route a request to the appropriate agent
   */
  async route(request: RequestMessage): Promise<RouteResult> {
    const { action, recipient, content } = request;

    // Find target agent
    let targetAgent: AgentInfo | undefined;

    if (recipient) {
      targetAgent = this.registry.findById(recipient.id);
    } else if (action) {
      // Find agents with the required capability
      const agents = this.registry.findByCapability(action);
      if (agents.length > 0) {
        // Simple round-robin or pick first
        targetAgent = agents[0];
      }
    }

    if (!targetAgent) {
      return {
        success: false,
        error: `No agent found for action: ${action}`,
      };
    }

    // Forward request to target
    try {
      const response = await this.transport.request(
        request,
        targetAgent.endpoint,
        this.config.defaultTimeout || 30000
      );

      return {
        success: true,
        response: response as ResponseMessage,
        routedTo: targetAgent.identity.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        routedTo: targetAgent.identity.id,
      };
    }
  }

  /**
   * Get router statistics
   */
  getStats(): {
    running: boolean;
    registryStats: ReturnType<AgentRegistry['getStats']>;
  } {
    return {
      running: this.running,
      registryStats: this.registry.getStats(),
    };
  }

  private generateId(): string {
    return `route_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
  }
}

// ============================================================================
// Load Balancer
// ============================================================================

export interface LoadBalancerConfig {
  strategy: 'round-robin' | 'least-loaded' | 'random' | 'weighted';
  weights?: Record<string, number>;
}

/**
 * Load Balancer
 * 
 * Distributes requests across multiple agents.
 */
export class LoadBalancer {
  private agents: AgentInfo[] = [];
  private currentIndex = 0;
  private activeRequests: Map<string, number> = new Map();
  private config: LoadBalancerConfig;

  constructor(config: LoadBalancerConfig) {
    this.config = config;
  }

  /**
   * Add agent to pool
   */
  addAgent(agent: AgentInfo): void {
    this.agents.push(agent);
    this.activeRequests.set(agent.identity.id, 0);
  }

  /**
   * Remove agent from pool
   */
  removeAgent(agentId: string): void {
    this.agents = this.agents.filter((a) => a.identity.id !== agentId);
    this.activeRequests.delete(agentId);
  }

  /**
   * Select an agent based on strategy
   */
  select(): AgentInfo | undefined {
    if (this.agents.length === 0) return undefined;

    switch (this.config.strategy) {
      case 'round-robin':
        const agent = this.agents[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.agents.length;
        return agent;

      case 'least-loaded':
        let minRequests = Infinity;
        let leastLoaded = this.agents[0];
        for (const agent of this.agents) {
          const requests = this.activeRequests.get(agent.identity.id) || 0;
          if (requests < minRequests) {
            minRequests = requests;
            leastLoaded = agent;
          }
        }
        return leastLoaded;

      case 'weighted':
        return this.selectWeighted();

      case 'random':
      default:
        return this.agents[Math.floor(Math.random() * this.agents.length)];
    }
  }

  /**
   * Select agent based on weights
   */
  private selectWeighted(): AgentInfo {
    if (!this.config.weights) return this.agents[0];

    const totalWeight = this.agents.reduce(
      (sum, agent) => sum + (this.config.weights?.[agent.identity.id] || 1),
      0
    );

    let random = Math.random() * totalWeight;

    for (const agent of this.agents) {
      const weight = this.config.weights?.[agent.identity.id] || 1;
      random -= weight;
      if (random <= 0) return agent;
    }

    return this.agents[0];
  }

  /**
   * Record request start
   */
  recordRequestStart(agentId: string): void {
    const current = this.activeRequests.get(agentId) || 0;
    this.activeRequests.set(agentId, current + 1);
  }

  /**
   * Record request end
   */
  recordRequestEnd(agentId: string): void {
    const current = this.activeRequests.get(agentId) || 0;
    this.activeRequests.set(agentId, Math.max(0, current - 1));
  }

  /**
   * Get load statistics
   */
  getStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    for (const [id, count] of this.activeRequests) {
      stats[id] = count;
    }
    return stats;
  }
}
