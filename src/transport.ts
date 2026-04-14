/**
 * Agent Protocol - Transport
 * 
 * Network transport for agent communication.
 */

import { AgentMessage, AgentIdentity } from './messages.js';

export type TransportType = 'http' | 'websocket' | 'memory' | 'grpc' | 'mqtt';

export interface TransportConfig {
  type: TransportType;
  url?: string;
  port?: number;
  headers?: Record<string, string>;
}

/**
 * Message handler type
 */
export type MessageHandler = (message: AgentMessage) => void | Promise<void>;

/**
 * Transport interface
 */
export interface Transport {
  /**
   * Connect to transport
   */
  connect(): Promise<void>;

  /**
   * Disconnect from transport
   */
  disconnect(): Promise<void>;

  /**
   * Send a message
   */
  send(message: AgentMessage, recipient?: AgentIdentity): Promise<void>;

  /**
   * Send and wait for response
   */
  request(message: AgentMessage, timeout?: number): Promise<AgentMessage>;

  /**
   * Register message handler
   */
  onMessage(handler: MessageHandler): void;

  /**
   * Remove message handler
   */
  offMessage(handler: MessageHandler): void;

  /**
   * Get transport type
   */
  getType(): TransportType;

  /**
   * Check if connected
   */
  isConnected(): boolean;
}

// ============================================================================
// Memory Transport (for in-process communication)
// ============================================================================

export interface MemoryTransportConfig extends TransportConfig {
  type: 'memory';
}

/**
 * Memory Transport
 * 
 * In-memory message passing for same-process agents.
 */
export class MemoryTransport implements Transport {
  private handlers: Set<MessageHandler> = new Set();
  private queues: Map<string, AgentMessage[]> = new Map();
  private pendingRequests: Map<string, { resolve: (msg: AgentMessage) => void; reject: (err: Error) => void }> = new Map();
  private connected = false;
  private identity?: AgentIdentity;

  constructor(config: MemoryTransportConfig, identity?: AgentIdentity) {
    this.identity = identity;
  }

  async connect(): Promise<void> {
    this.connected = true;
    console.log('Memory transport connected');
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    console.log('Memory transport disconnected');
  }

  async send(message: AgentMessage, recipient?: AgentIdentity): Promise<void> {
    if (!this.connected) {
      throw new Error('Transport not connected');
    }

    // If there's a pending request for this message, resolve it
    if (message.requestId || message.type === 'response') {
      const pending = this.pendingRequests.get(message.requestId as string);
      if (pending) {
        pending.resolve(message);
        this.pendingRequests.delete(message.requestId as string);
        return;
      }
    }

    // Queue message for recipient
    if (recipient) {
      const queue = this.queues.get(recipient.id) || [];
      queue.push(message);
      this.queues.set(recipient.id, queue);
    }

    // Notify handlers
    for (const handler of this.handlers) {
      await handler(message);
    }
  }

  async request(message: AgentMessage, timeout: number = 30000): Promise<AgentMessage> {
    return new Promise((resolve, reject) => {
      const requestId = (message as any).requestId || message.id;
      
      // Set up timeout
      const timeoutId = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error(`Request timeout after ${timeout}ms`));
      }, timeout);

      // Store pending request
      this.pendingRequests.set(requestId, {
        resolve: (msg) => {
          clearTimeout(timeoutId);
          resolve(msg);
        },
        reject: (err) => {
          clearTimeout(timeoutId);
          reject(err);
        },
      });

      // Send message
      this.send(message).catch((err) => {
        clearTimeout(timeoutId);
        this.pendingRequests.delete(requestId);
        reject(err);
      });
    });
  }

  onMessage(handler: MessageHandler): void {
    this.handlers.add(handler);
  }

  offMessage(handler: MessageHandler): void {
    this.handlers.delete(handler);
  }

  getType(): TransportType {
    return 'memory';
  }

  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Get pending messages for agent
   */
  getMessages(agentId: string): AgentMessage[] {
    const messages = this.queues.get(agentId) || [];
    this.queues.delete(agentId);
    return messages;
  }
}

// ============================================================================
// HTTP Transport
// ============================================================================

export interface HTTPTransportConfig extends TransportConfig {
  type: 'http';
  apiKey?: string;
}

/**
 * HTTP Transport
 * 
 * HTTP-based transport for REST-like communication.
 */
export class HTTPTransport implements Transport {
  private baseUrl: string;
  private headers: Record<string, string>;
  private handlers: Set<MessageHandler> = new Set();
  private connected = false;
  private pollingInterval?: NodeJS.Timeout;

  constructor(config: HTTPTransportConfig) {
    this.baseUrl = config.url || 'http://localhost:3000';
    this.headers = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
    if (config.apiKey) {
      this.headers['Authorization'] = `Bearer ${config.apiKey}`;
    }
  }

  async connect(): Promise<void> {
    this.connected = true;
    console.log(`HTTP transport connected to ${this.baseUrl}`);
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    console.log('HTTP transport disconnected');
  }

  async send(message: AgentMessage, _recipient?: AgentIdentity): Promise<void> {
    if (!this.connected) {
      throw new Error('Transport not connected');
    }

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
  }

  async request(message: AgentMessage, timeout: number = 30000): Promise<AgentMessage> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(message),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  onMessage(handler: MessageHandler): void {
    this.handlers.add(handler);
  }

  offMessage(handler: MessageHandler): void {
    this.handlers.delete(handler);
  }

  getType(): TransportType {
    return 'http';
  }

  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Start polling for messages
   */
  startPolling(interval: number = 1000): void {
    this.pollingInterval = setInterval(async () => {
      try {
        const response = await fetch(`${this.baseUrl}/messages/poll`, {
          headers: this.headers,
        });
        if (response.ok) {
          const messages: AgentMessage[] = await response.json();
          for (const message of messages) {
            for (const handler of this.handlers) {
              await handler(message);
            }
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, interval);
  }
}

// ============================================================================
// WebSocket Transport
// ============================================================================

export interface WebSocketTransportConfig extends TransportConfig {
  type: 'websocket';
}

/**
 * WebSocket Transport
 * 
 * WebSocket-based transport for real-time bidirectional communication.
 */
export class WebSocketTransport implements Transport {
  private ws?: WebSocket;
  private url: string;
  private headers: Record<string, string>;
  private handlers: Set<MessageHandler> = new Set();
  private connected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(config: WebSocketTransportConfig) {
    this.url = config.url || 'ws://localhost:3000';
    this.headers = config.headers || {};
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          this.connected = true;
          this.reconnectAttempts = 0;
          console.log(`WebSocket connected to ${this.url}`);
          resolve();
        };

        this.ws.onmessage = async (event) => {
          try {
            const message = JSON.parse(event.data) as AgentMessage;
            for (const handler of this.handlers) {
              await handler(message);
            }
          } catch (error) {
            console.error('Failed to parse message:', error);
          }
        };

        this.ws.onclose = () => {
          this.connected = false;
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private async attemptReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

    console.log(`Attempting reconnect in ${delay}ms...`);

    setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        console.error('Reconnection failed:', error);
      }
    }, delay);
  }

  async disconnect(): Promise<void> {
    this.maxReconnectAttempts = 0; // Prevent reconnect
    if (this.ws) {
      this.ws.close();
      this.ws = undefined;
    }
    this.connected = false;
    console.log('WebSocket disconnected');
  }

  async send(message: AgentMessage, _recipient?: AgentIdentity): Promise<void> {
    if (!this.connected || !this.ws) {
      throw new Error('Transport not connected');
    }

    this.ws.send(JSON.stringify(message));
  }

  async request(message: AgentMessage, timeout: number = 30000): Promise<AgentMessage> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Request timeout after ${timeout}ms`));
      }, timeout);

      const handler = (msg: AgentMessage) => {
        if ((msg as any).requestId === (message as any).requestId) {
          clearTimeout(timeoutId);
          this.offMessage(handler);
          resolve(msg);
        }
      };

      this.onMessage(handler);
      this.send(message).catch(reject);
    });
  }

  onMessage(handler: MessageHandler): void {
    this.handlers.add(handler);
  }

  offMessage(handler: MessageHandler): void {
    this.handlers.delete(handler);
  }

  getType(): TransportType {
    return 'websocket';
  }

  isConnected(): boolean {
    return this.connected;
  }
}

// ============================================================================
// Factory
// ============================================================================

/**
 * Create a transport instance
 */
export function createTransport(config: TransportConfig, identity?: AgentIdentity): Transport {
  switch (config.type) {
    case 'memory':
      return new MemoryTransport(config as MemoryTransportConfig, identity);
    case 'http':
      return new HTTPTransport(config as HTTPTransportConfig);
    case 'websocket':
      return new WebSocketTransport(config as WebSocketTransportConfig);
    default:
      throw new Error(`Unsupported transport type: ${config.type}`);
  }
}
