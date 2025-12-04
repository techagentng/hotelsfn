export type MessageStatus = 'sending' | 'sent' | 'error';
export type FileType = 'pdf' | 'csv' | 'image';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  messageId: string;
  jobId?: string;
  status?: MessageStatus;
  error?: string;
}

// JobStatus is imported from '@/types/index'

export type WebSocketMessageType = 
  | 'user_message' 
  | 'assistant_message' 
  | 'stream_chunk' 
  | 'job_update' 
  | 'error' 
  | 'ack' 
  | 'assistant_typing' 
  | 'file_uploaded' 
  | 'cancel'
  | 'ping'
  | 'pong';

export type JobStatus = 'processing' | 'completed' | 'error';

export interface WebSocketMessage {
  type: WebSocketMessageType;
  messageId?: string;
  content?: string;
  jobId?: string;
  timestamp?: number;
  status?: JobStatus;
  progress?: number;
  code?: string;
  isLastChunk?: boolean;
  isComplete?: boolean;
  filename?: string;
  fileType?: FileType;
  error?: string;
  sessionId?: string;
  serverTime?: number;
  chunk?: string;
  done?: boolean;
}

export interface ChatState {
  messages: ChatMessage[];
  isConnected: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  lastPing: number | null;
  connectionError: string | null;
  attachments: Attachment[];
}

export type AttachmentStatus = 'uploading' | 'completed' | 'error';

export interface Attachment {
  id: string;
  name: string;
  type: FileType;
  size: number;
  status: AttachmentStatus;
  progress: number;
  jobId?: string;
  file?: File;
  error?: string;
}

export interface UseChatReturn {
  messages: ChatMessage[];
  sendMessage: (content: string, jobId?: string) => Promise<string>;
  sendFile: (file: File) => Promise<string>;
  isConnected: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  error: string | null;
  clearError: () => void;
  attachments: Attachment[];
  uploadFile: (file: File) => Promise<string>;
}
