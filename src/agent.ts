/**
 * Agent Protocol - Agent Implementation
 * 
 * Base class and utilities for implementing Agent Protocol compatible agents.
 */

import {
  AgentIdentity,
  Capability,
  Content,
  RequestMessage,
  ResponseMessage,
  ErrorMessage,
  StreamStartMessage,
  StreamChunkMessage,
  StreamEndMessage,
  StatusCode,
  ErrorInfo,
  AgentMessage,
  HeartbeatMessage,
  CloseMessage,
  isRequest,
  isClose,
  isHeartbeat,
} from './messages.js';

export interface AgentConfig {
  identity: AgentIdentity;
  capabilities: Capability[];
  endpoint: string;
  metadata?: Record<string, unknown>;
}

export interface RequestHandler {
  (request: RequestMessage): Promise<ResponseMessage | AsyncIterable<ResponseMessage>>;
}

export interface StreamHandler {
  (request: RequestMessage): AsyncIterable<ResponseMessage>;
}

export interface EventHandler {
  (event: AgentMessage): void | Promise<void>;
}

/**
 * Base Agent class implementing the Agent Protocol
 */
export abstract class Agent {
  protected config: AgentConfig;
  protected handlers: Map<string, RequestHandler> = new Map();
  protected streamHandlers: Map<string, StreamHandler> = new Map();
  protected eventHandlers: EventHandler[] = [];
  protected running = false;
  protected metrics = {
    activeRequests: 0,
    queueDepth: 0,
    totalRequests: 0,
    totalErrors: 0,
    startTime: Date.now(),
  };

  constructor(config: AgentConfig) {
    this.config = config;
  }

  /**
   * Get agent identity
   */
  getIdentity(): AgentIdentity {
    return this.config.identity;
  }

  /**
   * Get agent capabilities
   */
  getCapabilities(): Capability[] {
    return this.config.capabilities;
  }

  /**
   * Get endpoint
   */
  getEndpoint(): string {
    return this.config.endpoint;
  }

  /**
   * Register an action handler
   */
  registerHandler(action: string, handler: RequestHandler): void {
    this.handlers.set(action, handler);
  }

  /**
   * Register a streaming handler
   */
  registerStreamHandler(action: string, handler: StreamHandler): void {
    this.streamHandlers.set(action, handler);
  }

  /**
   * Add event listener
   */
  addEventListener(handler: EventHandler): void {
    this.eventHandlers.push(handler);
  }

  /**
   * Remove event listener
   */
  removeEventListener(handler: EventHandler): void {
    const index = this.eventHandlers.indexOf(handler);
    if (index !== -1) {
      this.eventHandlers.splice(index, 1);
    }
  }

  /**
   * Emit an event
   */
  protected async emit(event: AgentMessage): Promise<void> {
    for (const handler of this.eventHandlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error('Event handler error:', error);
      }
    }
  }

  /**
   * Process an incoming message
   */
  async process(message: AgentMessage): Promise<AgentMessage> {
    this.metrics.totalRequests++;
    this.metrics.activeRequests++;

    try {
      let response: AgentMessage;

      if (isRequest(message)) {
        response = await this.handleRequest(message);
      } else if (isHeartbeat(message)) {
        response = this.handleHeartbeat(message);
      } else if (isClose(message)) {
        response = await this.handleClose(message);
      } else {
        response = this.createError(message.requestId as string || '', {
          code: 'UNSUPPORTED_MESSAGE',
          message: `Unsupported message type: ${message.type}`,
        });
      }

      await this.emit(response);
      return response;
    } catch (error) {
      this.metrics.totalErrors++;
      const errorMsg = error instanceof Error 
        ? { code: 'INTERNAL_ERROR', message: error.message }
        : { code: 'UNKNOWN_ERROR', message: String(error) };
      
      const response = this.createError(message.requestId as string || '', errorMsg);
      await this.emit(response);
      return response;
    } finally {
      this.metrics.activeRequests--;
    }
  }

  /**
   * Handle a request message
   */
  protected async handleRequest(request: RequestMessage): Promise<ResponseMessage | ErrorMessage> {
    const handler = this.handlers.get(request.action);
    
    if (!handler) {
      return this.createError(request.requestId, {
        code: 'ACTION_NOT_FOUND',
        message: `Action not supported: ${request.action}`,
      });
    }

    try {
      const result = await handler(request);
      
      if (result instanceof ResponseMessage) {
        return result;
      }

      // Async iterable (streaming)
      return await this.handleStreamingRequest(request);
    } catch (error) {
      return this.createError(request.requestId, {
        code: 'HANDLER_ERROR',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Handle a streaming request
   */
  protected async handleStreamingRequest(request: RequestMessage): Promise<ResponseMessage> {
    const streamHandler = this.streamHandlers.get(request.action);
    
    if (!streamHandler) {
      return this.createError(request.requestId, {
        code: 'STREAM_NOT_SUPPORTED',
        message: `Streaming not supported for action: ${request.action}`,
      });
    }

    const streamId = `stream_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    let index = 0;

    // Send stream start
    await this.emit({
      id: this.generateId(),
      type: 'stream-start',
      timestamp: Date.now(),
      version: '1.0.0',
      streamId,
      requestId: request.requestId,
      contentType: 'text',
    });

    // Process stream
    try {
      for await (const chunk of streamHandler(request)) {
        await this.emit({
          id: this.generateId(),
          type: 'stream-chunk',
          timestamp: Date.now(),
          version: '1.0.0',
          streamId,
          chunk: typeof chunk === 'string' ? chunk : JSON.stringify(chunk),
          index: index++,
        });
      }
    } catch (error) {
      await this.emit({
        id: this.generateId(),
        type: 'error',
        timestamp: Date.now(),
        version: '1.0.0',
        requestId: request.requestId,
        error: {
          code: 'STREAM_ERROR',
          message: error instanceof Error ? error.message : String(error),
        },
      });
    }

    // Send stream end
    await this.emit({
      id: this.generateId(),
      type: 'stream-end',
      timestamp: Date.now(),
      version: '1.0.0',
      streamId,
    });

    // Return placeholder response
    return {
      id: this.generateId(),
      type: 'response',
      timestamp: Date.now(),
      version: '1.0.0',
      requestId: request.requestId,
      status: 'success',
      content: [{ type: 'text', text: `Stream ${streamId} completed` }],
    };
  }

  /**
   * Handle heartbeat
   */
  protected handleHeartbeat(_message: HeartbeatMessage): ResponseMessage {
    return {
      id: this.generateId(),
      type: 'response',
      timestamp: Date.now(),
      version: '1.0.0',
      requestId: 'heartbeat',
      status: 'success',
      content: [{ type: 'text', text: 'OK' }],
      metadata: {
        status: this.metrics.activeRequests > 0 ? 'busy' : 'alive',
        metrics: {
          activeRequests: this.metrics.activeRequests,
          queueDepth: this.metrics.queueDepth,
          uptime: Date.now() - this.metrics.startTime,
        },
      },
    };
  }

  /**
   * Handle close
   */
  protected async handleClose(message: CloseMessage): Promise<ResponseMessage> {
    this.running = false;
    
    return {
      id: this.generateId(),
      type: 'response',
      timestamp: Date.now(),
      version: '1.0.0',
      requestId: message.id,
      status: 'success',
      content: [{ type: 'text', text: 'Goodbye' }],
    };
  }

  /**
   * Create an error response
   */
  protected createError(requestId: string, error: ErrorInfo): ErrorMessage {
    return {
      id: this.generateId(),
      type: 'error',
      timestamp: Date.now(),
      version: '1.0.0',
      requestId,
      error,
    };
  }

  /**
   * Generate a unique ID
   */
  protected generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
  }

  /**
   * Get metrics
   */
  getMetrics(): AgentMetrics {
    return {
      activeRequests: this.metrics.activeRequests,
      queueDepth: this.metrics.queueDepth,
      uptime: Date.now() - this.metrics.startTime,
    };
  }

  /**
   * Start the agent
   */
  abstract start(): Promise<void>;

  /**
   * Stop the agent
   */
  abstract stop(): Promise<void>;
}

/**
 * Simple echo agent for testing
 */
export class EchoAgent extends Agent {
  constructor() {
    super({
      identity: {
        id: 'echo-agent',
        name: 'Echo Agent',
        version: '1.0.0',
        type: 'agent',
      },
      capabilities: [
        {
          name: 'echo',
          version: '1.0.0',
          description: 'Echoes back the input',
          inputTypes: ['text'],
          outputTypes: ['text'],
        },
      ],
      endpoint: 'memory://echo-agent',
    });

    this.registerHandler('echo', async (request) => ({
      id: this.generateId(),
      type: 'response',
      timestamp: Date.now(),
      version: '1.0.0',
      requestId: request.requestId,
      status: 'success',
      content: request.content,
    }));
  }

  async start(): Promise<void> {
    this.running = true;
    console.log('Echo agent started');
  }

  async stop(): Promise<void> {
    this.running = false;
    console.log('Echo agent stopped');
  }
}

/**
 * Router-aware agent
 */
export class RouterAwareAgent extends Agent {
  private routerEndpoint?: string;

  constructor(config: AgentConfig, routerEndpoint?: string) {
    super(config);
    this.routerEndpoint = routerEndpoint;
  }

  /**
   * Forward request to router for handoff
   */
  async forwardToRouter(request: RequestMessage, targetAgentId: string): Promise<ResponseMessage> {
    if (!this.routerEndpoint) {
      return {
        id: this.generateId(),
        type: 'response',
        timestamp: Date.now(),
        version: '1.0.0',
        requestId: request.requestId,
        status: 'error',
        content: [{ type: 'text', text: 'No router configured' }],
        error: {
          code: 'NO_ROUTER',
          message: 'Router endpoint not configured',
        },
      };
    }

    // In a real implementation, this would send via transport
    // For now, return error indicating need for transport
    return {
      id: this.generateId(),
      type: 'response',
      timestamp: Date.now(),
      version: '1.0.0',
      requestId: request.requestId,
      status: 'error',
      content: [{ type: 'text', text: 'Forward not implemented - need transport' }],
    };
  }
}
