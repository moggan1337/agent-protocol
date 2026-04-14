/**
 * Agent Protocol - Agent Registry
 * 
 * Service registry for discovering and managing agents.
 */

import { AgentInfo, Capability, AgentIdentity } from './messages.js';

export interface RegistryConfig {
  name: string;
  type: 'local' | 'distributed' | 'blockchain';
  peers?: string[];
}

export interface RegistryEntry {
  agent: AgentInfo;
  registeredAt: number;
  lastSeen: number;
  health: 'healthy' | 'degraded' | 'unhealthy';
}

/**
 * Agent Registry
 * 
 * Central registry for agent discovery and management.
 * Can be used locally or distributed across multiple nodes.
 */
export class AgentRegistry {
  private entries: Map<string, RegistryEntry> = new Map();
  private config: RegistryConfig;
  private cleanupInterval?: NodeJS.Timeout;

  constructor(config: RegistryConfig) {
    this.config = config;
  }

  /**
   * Start the registry
   */
  async start(): Promise<void> {
    // Start cleanup interval for stale entries
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // Every minute

    console.log(`Agent Registry started (${this.config.type})`);
  }

  /**
   * Stop the registry
   */
  async stop(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    console.log('Agent Registry stopped');
  }

  /**
   * Register an agent
   */
  async register(agent: AgentInfo): Promise<void> {
    const entry: RegistryEntry = {
      agent,
      registeredAt: Date.now(),
      lastSeen: Date.now(),
      health: 'healthy',
    };

    this.entries.set(agent.identity.id, entry);
    console.log(`Agent registered: ${agent.identity.name} (${agent.identity.id})`);
  }

  /**
   * Unregister an agent
   */
  async unregister(agentId: string): Promise<boolean> {
    const deleted = this.entries.delete(agentId);
    if (deleted) {
      console.log(`Agent unregistered: ${agentId}`);
    }
    return deleted;
  }

  /**
   * Update agent heartbeat
   */
  async heartbeat(agentId: string): Promise<boolean> {
    const entry = this.entries.get(agentId);
    if (entry) {
      entry.lastSeen = Date.now();
      entry.health = 'healthy';
      return true;
    }
    return false;
  }

  /**
   * Find agents by capability
   */
  findByCapability(capability: string): AgentInfo[] {
    const results: AgentInfo[] = [];

    for (const entry of this.entries.values()) {
      if (entry.health === 'unhealthy') continue;

      const hasCapability = entry.agent.capabilities.some(
        (c) => c.name.toLowerCase() === capability.toLowerCase()
      );

      if (hasCapability) {
        results.push(entry.agent);
      }
    }

    return results;
  }

  /**
   * Find agents by capability requirements
   */
  findByCapabilities(
    requiredCapabilities: string[],
    requireAll: boolean = true
  ): AgentInfo[] {
    const results: AgentInfo[] = [];

    for (const entry of this.entries.values()) {
      if (entry.health === 'unhealthy') continue;

      const agentCapabilities = entry.agent.capabilities.map((c) => c.name.toLowerCase());
      const requiredLower = requiredCapabilities.map((c) => c.toLowerCase());

      const matches = requireAll
        ? requiredLower.every((r) => agentCapabilities.includes(r))
        : requiredLower.some((r) => agentCapabilities.includes(r));

      if (matches) {
        results.push(entry.agent);
      }
    }

    return results;
  }

  /**
   * Find agent by ID
   */
  findById(agentId: string): AgentInfo | undefined {
    const entry = this.entries.get(agentId);
    return entry?.agent;
  }

  /**
   * Find agent by name
   */
  findByName(name: string): AgentInfo[] {
    const results: AgentInfo[] = [];
    const nameLower = name.toLowerCase();

    for (const entry of this.entries.values()) {
      if (
        entry.agent.identity.name.toLowerCase().includes(nameLower) &&
        entry.health !== 'unhealthy'
      ) {
        results.push(entry.agent);
      }
    }

    return results;
  }

  /**
   * Get all healthy agents
   */
  getAllHealthy(): AgentInfo[] {
    const results: AgentInfo[] = [];

    for (const entry of this.entries.values()) {
      if (entry.health !== 'unhealthy') {
        results.push(entry.agent);
      }
    }

    return results;
  }

  /**
   * Get all registered agents
   */
  getAll(): AgentInfo[] {
    return Array.from(this.entries.values()).map((e) => e.agent);
  }

  /**
   * Get registry statistics
   */
  getStats(): {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
    byCapability: Record<string, number>;
  } {
    let healthy = 0;
    let degraded = 0;
    let unhealthy = 0;
    const byCapability: Record<string, number> = {};

    for (const entry of this.entries.values()) {
      switch (entry.health) {
        case 'healthy':
          healthy++;
          break;
        case 'degraded':
          degraded++;
          break;
        case 'unhealthy':
          unhealthy++;
          break;
      }

      for (const cap of entry.agent.capabilities) {
        byCapability[cap.name] = (byCapability[cap.name] || 0) + 1;
      }
    }

    return {
      total: this.entries.size,
      healthy,
      degraded,
      unhealthy,
      byCapability,
    };
  }

  /**
   * Update agent health status
   */
  async updateHealth(
    agentId: string,
    health: 'healthy' | 'degraded' | 'unhealthy'
  ): Promise<boolean> {
    const entry = this.entries.get(agentId);
    if (entry) {
      entry.health = health;
      return true;
    }
    return false;
  }

  /**
   * Cleanup stale entries
   */
  private cleanup(): void {
    const now = Date.now();
    const staleThreshold = 5 * 60 * 1000; // 5 minutes

    for (const [id, entry] of this.entries) {
      if (now - entry.lastSeen > staleThreshold) {
        if (entry.health === 'unhealthy') {
          // Remove very stale entries
          this.entries.delete(id);
          console.log(`Removed stale agent: ${id}`);
        } else {
          entry.health = 'degraded';
        }
      }
    }
  }
}

// ============================================================================
// Capability Matcher
// ============================================================================

export interface CapabilityMatch {
  agent: AgentInfo;
  capability: Capability;
  score: number; // 0-100
  missingParams?: string[];
}

/**
 * Capability Matcher
 * 
 * Finds and scores agents based on capability matching.
 */
export class CapabilityMatcher {
  /**
   * Find best matching agents for a request
   */
  static match(
    registry: AgentRegistry,
    requiredCapabilities: string[],
    preferredInputTypes?: string[]
  ): CapabilityMatch[] {
    const agents = registry.getAllHealthy();
    const matches: CapabilityMatch[] = [];

    for (const agent of agents) {
      for (const capability of agent.capabilities) {
        const requiredSet = new Set(requiredCapabilities.map((c) => c.toLowerCase()));
        const agentCapSet = new Set([capability.name.toLowerCase()]);

        // Check if capability matches
        const matchesRequired = requiredSet.has(capability.name.toLowerCase());

        if (!matchesRequired) continue;

        // Calculate score
        let score = 100;

        // Penalty for missing input types
        if (preferredInputTypes) {
          const hasPreferred = preferredInputTypes.some((t) =>
            capability.inputTypes.includes(t as any)
          );
          if (!hasPreferred) {
            score -= 30;
          }
        }

        // Bonus for exact match
        if (requiredCapabilities.length === 1 && requiredCapabilities[0].toLowerCase() === capability.name.toLowerCase()) {
          score += 10;
        }

        matches.push({
          agent,
          capability,
          score,
        });
      }
    }

    // Sort by score descending
    matches.sort((a, b) => b.score - a.score);

    return matches;
  }

  /**
   * Check if an agent supports a specific action
   */
  static supports(agent: AgentInfo, action: string): boolean {
    return agent.capabilities.some((c) => c.name.toLowerCase() === action.toLowerCase());
  }
}
