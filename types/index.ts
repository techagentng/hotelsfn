// Chat message types
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  messageId: string;
  jobId?: string;
  status?: 'sending' | 'sent' | 'error';
  error?: string;
}

export interface JobStatus {
  jobId: string;
  status: 'processing' | 'completed' | 'error';
  progress?: number;
  message?: string;
  timestamp: number;
}

// Base message interface
export interface BaseMessage {
  type: string;
  jobId?: string;
  job_id?: string; // Keep for backward compatibility
  timestamp?: string | number;
  [key: string]: any; // Allow additional properties
}

// Specific message types
export interface JobUpdateMessage extends BaseMessage {
  type: 'job_update';
  progress: number;
  status?: string;
}

export interface AIChunkMessage extends BaseMessage {
  type: 'ai_chunk';
  chunk: string;
  done?: boolean;
}

export interface JobCompletedMessage extends BaseMessage {
  type: 'job_completed';
  result?: any;
}

export interface JobFailedMessage extends BaseMessage {
  type: 'job_failed';
  error: string;
}

export interface ConnectionMessage extends BaseMessage {
  type: 'connection';
  status: 'connected' | 'disconnected';
}

export interface ErrorMessage extends BaseMessage {
  type: 'error';
  error: string;
}

// Internal message types for streaming
export interface RawMessage extends BaseMessage {
  type: 'raw';
  data: any;
}

export interface StreamUpdateMessage extends BaseMessage {
  type: 'stream_update';
  data: string;
  done: boolean;
}

export interface StreamCompleteMessage extends BaseMessage {
  type: 'stream_complete';
  data: string;
  done: true;
  chunk?: string;
  partial?: string;
  ai_response?: string;
  error?: string;
  message?: string;
}

// Auth response message
export interface AuthResponseMessage extends BaseMessage {
  type: 'auth_response';
  authenticated: boolean;
  error?: string;
  timestamp: number;
}

// WebSocket message type
export type WebSocketMessage = 
  | JobUpdateMessage
  | AIChunkMessage
  | JobCompletedMessage
  | JobFailedMessage
  | ConnectionMessage
  | ErrorMessage
  | RawMessage
  | StreamUpdateMessage
  | StreamCompleteMessage
  | AuthResponseMessage
  | {
      type: 'auth_verified' | 'pong' | 'user_message' | 'assistant_message' | 'stream_chunk' | 'job_update' | 'ack' | 'assistant_typing' | 'file_uploaded' | 'cancel';
      messageId?: string;
      content?: string;
      jobId?: string;
      job_id?: string; // For backward compatibility
      timestamp?: number;
      status?: 'processing' | 'completed' | 'error';
      progress?: number;
      code?: string;
      isLastChunk?: boolean;
      isComplete?: boolean;
      filename?: string;
      fileType?: 'pdf' | 'csv' | 'image';
      error?: string;
      sessionId?: string;
      serverTime?: number;
      chunk?: string;
      done?: boolean;
    };

// Processing job types
export interface ProcessingJob {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  file_name: string;
  created_at: string;
  completed_at?: string;
  error?: string;
  ai_response?: string;
}

// API response types
export interface UploadResponse {
  success: boolean;
  data: {
    job_id: string;
    status: string;
    progress: number;
    message: string;
  };
}

export interface JobStatusResponse {
  success: boolean;
  data: ProcessingJob;
}

export interface JobsListResponse {
  success: boolean;
  data: {
    jobs: ProcessingJob[];
    total: number;
  };
}
