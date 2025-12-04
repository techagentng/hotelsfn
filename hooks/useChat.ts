import { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  ChatMessage, 
  WebSocketMessage, 
  Attachment,
  MessageStatus,
  FileType,
  AttachmentStatus
} from '@/types/chat';
import { getSession } from '@/utils/auth';
import { api } from '@/lib/api';

const CHAT_STORAGE_KEY = 'iwe_chat_messages';
const MAX_MESSAGES = 100; // Maximum number of messages to keep in memory

const getFileType = (filename: string, mimeType: string): FileType => {
  if (mimeType.startsWith('image/')) return 'image';
  if (filename.endsWith('.pdf')) return 'pdf';
  if (filename.endsWith('.csv')) return 'csv';
  return 'pdf'; // default
};

export const useChat = () => {
  // State management
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [lastPing, setLastPing] = useState<number | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  
  // Refs for WebSocket and intervals
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load messages from localStorage on mount
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        if (Array.isArray(parsed)) {
          setMessages(parsed.slice(-MAX_MESSAGES));
        }
      }
    } catch (e) {
      console.error('Failed to load chat history', e);
    }
  }, []);

  // Save messages to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save chat history', e);
    }
  }, [messages]);

  // Handle incoming messages
  const handleMessage = useCallback((message: any) => {
    if (!message) {
      console.warn('⚠️ [useChat] Received empty message');
      return;
    }
    
    if (!message.type) {
      console.warn('⚠️ [useChat] Received message with no type:', message);
      return;
    }
    
    console.log(`🔄 [useChat] Handling message type: ${message.type}`, message);
    
    switch (message.type) {
      case 'pong':
        setLastPing(Date.now());
        break;
        
      case 'assistant_message':
        if (message.content && message.messageId) {
          setMessages(prev => {
            const existingIndex = prev.findIndex(m => m.messageId === message.messageId);
            
            if (existingIndex >= 0) {
              // Update existing message
              const newMessages = [...prev];
              newMessages[existingIndex] = {
                ...newMessages[existingIndex],
                content: message.content || '',
                status: 'sent',
                timestamp: message.timestamp || Date.now()
              };
              return newMessages;
            }
            
            // Add new message
            const newMessage: ChatMessage = {
              role: 'assistant',
              content: message.content,
              messageId: message.messageId,
              timestamp: message.timestamp || Date.now(),
              jobId: message.jobId,
              status: 'sent'
            };
            
            return [...prev, newMessage].slice(-MAX_MESSAGES);
          });
        }
        break;

      case 'stream_chunk':
        if (message.messageId && (message.content || message.chunk)) {
          const content = message.content || message.chunk || '';
          
          setMessages(prev => {
            const existingIndex = prev.findIndex(m => m.messageId === message.messageId);
            
            if (existingIndex >= 0) {
              // Update existing message
              const newMessages = [...prev];
              const existingMessage = newMessages[existingIndex];
              
              // If this is a new chunk, append it to the existing content
              const updatedContent = message.isLastChunk 
                ? content 
                : (existingMessage.content + content);
              
              newMessages[existingIndex] = {
                ...existingMessage,
                content: updatedContent,
                status: message.isLastChunk ? 'sent' : 'sending',
                timestamp: message.timestamp || Date.now()
              };
              
              return newMessages;
            }
            
            // Create new message for first chunk
            const newMessage: ChatMessage = {
              role: 'assistant',
              content,
              messageId: message.messageId,
              timestamp: message.timestamp || Date.now(),
              jobId: message.jobId,
              status: message.isLastChunk ? 'sent' : 'sending'
            };
            
            return [...prev, newMessage].slice(-MAX_MESSAGES);
          });
        }
        break;

      case 'job_update':
        if (message.jobId && message.status) {
          // Update the corresponding message with job status
          setMessages(prev => 
            prev.map(msg => 
              msg.jobId === message.jobId
                ? { 
                    ...msg, 
                    status: message.status === 'completed' ? 'sent' as MessageStatus : 'sending' as MessageStatus
                  }
                : msg
            )
          );
        }
        break;

      case 'error':
        console.error('WebSocket error:', message.error || 'Unknown error');
        
        if (message.messageId) {
          setMessages(prev => 
            prev.map(msg => 
              msg.messageId === message.messageId
                ? { ...msg, status: 'error', error: message.error || 'An error occurred' }
                : msg
            )
          );
        }
        break;

      default:
        console.log('Unhandled WebSocket message type:', message.type, message);
    }
  }, []);

  // Connect WebSocket on mount
  useEffect(() => {
    // Only connect in browser environment
    if (typeof window === 'undefined') return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws';
    
    if (!wsRef.current) {
      console.log('🔌 [useChat] Creating new WebSocket connection to:', wsUrl);
      const socket = new WebSocket(wsUrl);
      
      socket.onopen = () => {
        console.log('✅ [useChat] WebSocket connected successfully');
        console.log('📡 [useChat] WebSocket readyState:', getWebSocketState(socket.readyState));
        wsRef.current = socket;
        setIsConnected(true);
        
        // Send authentication message if user is logged in
        const token = getSession();
        if (token) {
          console.log('🔑 [useChat] Sending auth token with WebSocket connection');
          socket.send(JSON.stringify({
            type: 'auth',
            token: token
          }));
        }
      };
      
      socket.onmessage = (event) => {
        try {
          console.log('📨 [useChat] Raw WebSocket message received:', event.data);
          const message = JSON.parse(event.data);
          console.log('📩 [useChat] Parsed message:', message);
          
          // Log specific message types in more detail
          if (message.type === 'ai_chunk' || message.type === 'job_update') {
            console.log(`🤖 [useChat] ${message.type.toUpperCase()} received:`, {
              jobId: message.jobId || message.job_id,
              status: message.status,
              progress: message.progress,
              contentLength: message.chunk ? message.chunk.length : 0
            });
          }
          
          handleMessage(message);
        } catch (error) {
          console.error('❌ [useChat] Error parsing WebSocket message:', error, 'Raw data:', event.data);
        }
      };
      
      socket.onclose = (event) => {
        console.log('🔌 [useChat] WebSocket disconnected:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
        wsRef.current = null;
        setIsConnected(false);
        
        // Attempt to reconnect after a delay
        console.log('🔄 [useChat] Attempting to reconnect in 3 seconds...');
        setTimeout(() => {
          console.log('🔄 [useChat] Reconnecting...');
          wsRef.current = null; // This will trigger a reconnection
        }, 3000);
      };
      
      socket.onerror = (error) => {
        console.error('❌ [useChat] WebSocket error:', {
          error: error,
          readyState: socket.readyState,
          url: socket.url
        });
      };
      
      // Store WebSocket reference
      wsRef.current = socket;
      
      // Cleanup function
      return () => {
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
        }
        
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        
        if (socket.readyState === WebSocket.OPEN) {
          socket.close();
        }
      };
    }
  }, [handleMessage]);

  // Helper function to get WebSocket state name
  const getWebSocketState = (state: number) => {
    switch (state) {
      case WebSocket.CONNECTING: return 'CONNECTING';
      case WebSocket.OPEN: return 'OPEN';
      case WebSocket.CLOSING: return 'CLOSING';
      case WebSocket.CLOSED: return 'CLOSED';
      default: return `UNKNOWN (${state})`;
    }
  };

  // Send message function
  const sendMessage = useCallback((content: string, attachments: File[] = []) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('❌ [useChat] Cannot send message - WebSocket not connected. State:', 
        wsRef.current ? getWebSocketState(wsRef.current.readyState) : 'No socket');
      return;
    }

    if (!content.trim()) {
      throw new Error('Message cannot be empty');
    }

    const messageId = uuidv4();
    const timestamp = Date.now();
    
    // Generate a unique job ID for tracking this message
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Optimistically add the user message
    const userMessage: ChatMessage = {
      role: 'user',
      content,
      messageId,
      timestamp,
      jobId, // Now properly declared
      status: 'sending'
    };
    
    console.log('📤 [useChat] Sending new message with jobId:', jobId);

    setMessages(prev => [...prev, userMessage].slice(-MAX_MESSAGES));

    // If WebSocket is connected, send the message
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        const message: WebSocketMessage = {
          type: 'user_message',
          messageId,
          content,
          jobId, // Now properly declared
          timestamp
        };
        
        console.log('📡 [useChat] Sending WebSocket message:', {
          type: message.type,
          messageId: message.messageId,
          jobId: message.jobId,
          contentLength: content.length
        });
        
        wsRef.current.send(JSON.stringify(message));
        
        // Update message status to sent
        setMessages(prev => 
          prev.map(msg => 
            msg.messageId === messageId 
              ? { ...msg, status: 'sent' } 
              : msg
          )
        );
        
      } catch (error) {
        console.error('Error sending message:', error);
        
        // Update message status to error
        setMessages(prev => 
          prev.map(msg => 
            msg.messageId === messageId 
              ? { 
                  ...msg, 
                  status: 'error', 
                  error: 'Failed to send message' 
                } 
              : msg
          )
        );
        
        throw error;
      }
    } else {
      // If WebSocket is not connected, mark as error
      setMessages(prev => 
        prev.map(msg => 
          msg.messageId === messageId 
            ? { 
                ...msg, 
                status: 'error', 
                error: 'Not connected to server' 
              } 
            : msg
        )
      );
      
      throw new Error('Not connected to server');
    }

    return messageId;
  }, []);

  // Upload a file
  const uploadFile = useCallback(async (file: File): Promise<string> => {
    if (!file) {
      throw new Error('No file provided');
    }

    const formData = new FormData();
    formData.append('file', file);

    // Add file to attachments
    const attachmentId = uuidv4();
    const fileType = getFileType(file.name, file.type);
    
    const attachment: Attachment = {
      id: attachmentId,
      name: file.name,
      type: fileType,
      size: file.size,
      status: 'uploading',
      progress: 0,
      file
    };

    setAttachments(prev => [...prev, attachment]);

    try {
      const token = getSession();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      console.log('📤 [useChat] Uploading file:', {
        name: file.name,
        type: file.type,
        size: file.size,
        attachmentId
      });
      
      const response = await api.uploadFile(file, token);
      
      console.log('📥 [useChat] File upload response:', {
        success: true,
        fileId: response.data?.file_id,
        data: response.data
      });
      
      if (response.data?.file_id) {
        // Update attachment with file ID and mark as completed
        setAttachments(prev =>
          prev.map(att => 
            att.id === attachmentId 
              ? { 
                  ...att, 
                  status: 'completed', 
                  progress: 100, 
                  jobId: response.data.file_id // Using file_id as jobId for backward compatibility
                } 
              : att
          )
        );
        
        return response.data.file_id;
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error) {
      // Update attachment with error
      setAttachments(prev =>
        prev.map(att => 
          att.id === attachmentId 
            ? { 
                ...att, 
                status: 'error', 
                error: error instanceof Error ? error.message : 'Upload failed' 
              } 
            : att
        )
      );
      
      throw error;
    }
  }, []);

  // Send file
  const sendFile = useCallback(async (file: File): Promise<string> => {
    const jobId = await uploadFile(file);
    
    // Create a message for the file
    const messageId = uuidv4();
    const timestamp = Date.now();
    
    const fileMessage: ChatMessage = {
      role: 'user',
      content: `[File: ${file.name}]`,
      messageId,
      timestamp,
      jobId,
      status: 'sending'
    };
    
    setMessages(prev => [...prev, fileMessage].slice(-MAX_MESSAGES));
    
    // Send file uploaded event
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type: 'file_uploaded',
        messageId,
        jobId,
        filename: file.name,
        fileType: getFileType(file.name, file.type),
        timestamp
      };
      
      wsRef.current.send(JSON.stringify(message));
      
      // Update message status to sent
      setMessages(prev => 
        prev.map(msg => 
          msg.messageId === messageId 
            ? { ...msg, status: 'sent' } 
            : msg
        )
      );
    }
    
    return messageId;
  }, [uploadFile]);

  // Clear error message
  const clearError = useCallback(() => {
    setConnectionError(null);
  }, []);

  return {
    messages,
    isConnected,
    connectionStatus,
    error: connectionError,
    lastPing,
    attachments,
    sendMessage,
    sendFile,
    uploadFile,
    clearError
  };
};
