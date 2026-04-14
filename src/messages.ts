/**
 * Agent Protocol Messages
 * 
 * Universal message format for all agent communication.
 */

// ============================================================================
// Core Types
// ============================================================================

export type MessageType = 
  | 'request'
  | 'response'
  | 'stream-start'
  | 'stream-chunk'
  | 'stream-end'
  | 'error'
  | 'capability-query'
  | 'capability-response'
  | 'discovery-request'
  | 'discovery-response'
  | 'handoff'
  | 'heartbeat'
  | 'close';

export type ContentType = 
  | 'text'
  | 'image'
  | 'audio'
  | 'video'
  | 'document'
  | 'code'
  | 'data'
  | 'stream';

export type StatusCode = 
  | 'success'
  | 'error'
  | 'partial'
  | 'timeout'
  | 'unauthorized'
  | 'forbidden'
  | 'not-found'
  | 'unsupported';

// ============================================================================
// Content Types
// ============================================================================

export interface TextContent {
  type: 'text';
  text: string;
  format?: 'plain' | 'markdown' | 'html';
  language?: string;
}

export interface ImageContent {
  type: 'image';
  url?: string;
  base64?: string;
  mimeType: string;
  width?: number;
  height?: number;
}

export interface AudioContent {
  type: 'audio';
  url?: string;
  base64?: string;
  mimeType: string;
  duration?: number; // seconds
}

export interface VideoContent {
  type: 'video';
  url?: string;
  base64?: string;
  mimeType: string;
  duration?: number;
  width?: number;
  height?: number;
}

export interface DocumentContent {
  type: 'document';
  url?: string;
  base64?: string;
  mimeType: string;
  filename?: string;
  size?: number;
}

export interface CodeContent {
  type: 'code';
  code: string;
  language: string;
  filename?: string;
}

export interface DataContent {
  type: 'data';
  format: 'json' | 'xml' | 'csv' | 'yaml';
  content: string;
}

export interface StreamContent {
  type: 'stream';
  streamId: string;
  format: 'text' | 'binary';
}

export type Content = 
  | TextContent
  | ImageContent
  | AudioContent
  | VideoContent
  | DocumentContent
  | CodeContent
  | DataContent
  | StreamContent;

// ============================================================================
// Message Types
// ============================================================================

export interface AgentMessage {
  id: string;
  type: MessageType;
  timestamp: number;
  version: string;
}

export interface RequestMessage extends AgentMessage {
  type: 'request';
  requestId: string;
  action: string;
  sender: AgentIdentity;
  recipient?: AgentIdentity;
  content: Content[];
  context?: RecordContext;
  metadata?: Record<string, unknown>;
}

export interface ResponseMessage extends AgentMessage {
  type: 'response';
  requestId: string;
  status: StatusCode;
  content: Content[];
  error?: ErrorInfo;
  metadata?: Record<string, unknown>;
}

export interface StreamStartMessage extends AgentMessage {
  type: 'stream-start';
  streamId: string;
  requestId: string;
  contentType: ContentType;
  metadata?: Record<string, unknown>;
}

export interface StreamChunkMessage extends AgentMessage {
  type: 'stream-chunk';
  streamId: string;
  chunk: string | number[];
  index: number;
  final?: boolean;
}

export interface StreamEndMessage extends AgentMessage {
  type: 'stream-end';
  streamId: string;
  summary?: Content[];
  metadata?: Record<string, unknown>;
}

export interface ErrorMessage extends AgentMessage {
  type: 'error';
  requestId?: string;
  error: ErrorInfo;
}

export interface ErrorInfo {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
}

// ============================================================================
// Capability System
// ============================================================================

export interface Capability {
  name: string;
  version: string;
  description: string;
  inputTypes: ContentType[];
  outputTypes: ContentType[];
  parameters?: CapabilityParameter[];
  authentication?: AuthenticationMethod;
  rateLimit?: RateLimit;
  metadata?: Record<string, unknown>;
}

export interface CapabilityParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  default?: unknown;
  description: string;
}

export interface AuthenticationMethod {
  type: 'none' | 'api-key' | 'oauth2' | 'jwt' | 'custom';
  instructions?: string;
}

export interface RateLimit {
  requests: number;
  window: number; // seconds
}

export interface CapabilityQueryMessage extends AgentMessage {
  type: 'capability-query';
  query: CapabilityQuery;
}

export interface CapabilityQuery {
  action?: string;
  inputTypes?: ContentType[];
  outputTypes?: ContentType[];
  metadata?: Record<string, unknown>;
}

export interface CapabilityResponseMessage extends AgentMessage {
  type: 'capability-response';
  capabilities: Capability[];
}

// ============================================================================
// Discovery System
// ============================================================================

export interface DiscoveryRequestMessage extends AgentMessage {
  type: 'discovery-request';
  query: DiscoveryQuery;
}

export interface DiscoveryQuery {
  capabilities?: string[];
  name?: string;
  distance?: number; // hops from requester
  metadata?: Record<string, unknown>;
}

export interface DiscoveryResponseMessage extends AgentMessage {
  type: 'discovery-response';
  agents: AgentInfo[];
}

export interface AgentInfo {
  identity: AgentIdentity;
  capabilities: Capability[];
  endpoint: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Handoff (Agent-to-Agent Transfer)
// ============================================================================

export interface HandoffMessage extends AgentMessage {
  type: 'handoff';
  from: AgentIdentity;
  to: AgentIdentity;
  requestId: string;
  context: RecordContext;
  history: HistoryEntry[];
  reason?: string;
}

export interface HistoryEntry {
  timestamp: number;
  role: 'user' | 'agent' | 'system';
  content: Content[];
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Agent Identity
// ============================================================================

export interface AgentIdentity {
  id: string;
  name: string;
  version?: string;
  type?: 'agent' | 'user' | 'system' | 'service';
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Context Management
// ============================================================================

export interface RecordContext {
  sessionId?: string;
  conversationId?: string;
  taskId?: string;
  parentTaskId?: string;
  traceId?: string;
  spanId?: string;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  deadline?: number; // timestamp
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Heartbeat & Close
// ============================================================================

export interface HeartbeatMessage extends AgentMessage {
  type: 'heartbeat';
  status: 'alive' | 'busy' | 'degraded';
  metrics?: AgentMetrics;
}

export interface AgentMetrics {
  activeRequests: number;
  queueDepth: number;
  cpuUsage?: number;
  memoryUsage?: number;
  uptime: number;
}

export interface CloseMessage extends AgentMessage {
  type: 'close';
  reason?: string;
  graceful: boolean;
}

// ============================================================================
// Type Guards
// ============================================================================

export function isRequest(msg: AgentMessage): msg is RequestMessage {
  return msg.type === 'request';
}

export function isResponse(msg: AgentMessage): msg is ResponseMessage {
  return msg.type === 'response';
}

export function isStreamStart(msg: AgentMessage): msg is StreamStartMessage {
  return msg.type === 'stream-start';
}

export function isStreamChunk(msg: AgentMessage): msg is StreamChunkMessage {
  return msg.type === 'stream-chunk';
}

export function isStreamEnd(msg: AgentMessage): msg is StreamEndMessage {
  return msg.type === 'stream-end';
}

export function isError(msg: AgentMessage): msg is ErrorMessage {
  return msg.type === 'error';
}

export function isCapabilityQuery(msg: AgentMessage): msg is CapabilityQueryMessage {
  return msg.type === 'capability-query';
}

export function isDiscoveryRequest(msg: AgentMessage): msg is DiscoveryRequestMessage {
  return msg.type === 'discovery-request';
}

export function isHandoff(msg: AgentMessage): msg is HandoffMessage {
  return msg.type === 'handoff';
}

export function isHeartbeat(msg: AgentMessage): msg is HeartbeatMessage {
  return msg.type === 'heartbeat';
}

export function isClose(msg: AgentMessage): msg is CloseMessage {
  return msg.type === 'close';
}
