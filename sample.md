//chat.tsx
import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '../hooks/useChat';
import { FileType } from '@/types/chat';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export default function ChatPage() {
  const { user, logout } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Use the chat hook
  const {
    messages,
    sendMessage,
    uploadFile,
    connectionStatus,
    attachments,
    setMessages,
  } = useChat();
  
  // Refs for file inputs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Connection status indicator
  const getConnectionStatusColor = () => {
    switch(connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  // Handle sending a message
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() && attachments.length === 0) return;
    
    const message = inputValue.trim() || 'Analyze this document';
    setInputValue('');
    
    try {
      // Get the active job ID from attachments if any
      const activeAttachment = attachments.find(a => a.status === 'processing');
      const jobId = activeAttachment?.jobId;
      
      // Send the message using the chat hook
      await sendMessage({
        content: message,
        jobId,
        documentText: '' // Add document text if needed
      });
      
    } catch (error) {
      console.error('Error sending message:', error);
      // The error is already handled by the useChat hook
    }
  }, [inputValue, attachments, sendMessage]);
  
  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    if (!file) return;
    
    try {
      // Upload the file using the chat hook
      await uploadFile(file);
    } catch (error) {
      console.error('File upload error:', error);
      // The error is already handled by the useChat hook
    }
  }, [uploadFile]);
  
  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset the input value to allow selecting the same file again
    if (e.target) {
      e.target.value = '';
    }
  };
  
  // Handle key press in input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Clear chat history
  const handleNewChat = () => {
    setMessages([]);
  };
  
  // Get file type icon
  const getFileIcon = (type: FileType) => {
    switch (type) {
      case 'pdf':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'csv':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 13H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 17H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 9H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'image':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8.5 10C9.32843 10 10 9.32843 10 8.5C10 7.67157 9.32843 7 8.5 7C7.67157 7 7 7.67157 7 8.5C7 9.32843 7.67157 10 8.5 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
    }
  };
  
  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 shadow-lg transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold">ChatIWE</h1>
            <div className="flex items-center mt-2">
              <div className={`w-2 h-2 rounded-full mr-2 ${getConnectionStatusColor()}`}></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {connectionStatus === 'connected' ? 'Connected' : 
                 connectionStatus === 'connecting' ? 'Connecting...' : 
                 connectionStatus === 'error' ? 'Connection Error' : 'Disconnected'}
              </span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <button
              onClick={handleNewChat}
              className="w-full mb-4 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              New Chat
            </button>
            
            {/* Chat history would go here */}
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              Recent chats will appear here
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium">{user?.email || 'User'}</div>
                <button 
                  onClick={logout}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex items-center justify-between">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <h1 className="text-xl font-semibold">Chat</h1>
          
          <div className="w-8"></div> {/* Spacer for flex alignment */}
        </header>
        
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="text-2xl font-semibold mb-2">How can I help you today?</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                Ask me anything or upload a document to get started. I'm here to help with your questions!
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] p-4 rounded-lg ${
                      message.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none'
                    }`}
                  >
                    {message.content}
                    {message.status === 'sending' && (
                      <div className="flex space-x-1 mt-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    )}
                    {message.error && (
                      <div className="text-red-500 text-xs mt-1">{message.error}</div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        {/* Input area */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {attachments.map((attachment) => (
                <div 
                  key={attachment.id}
                  className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm"
                >
                  <div className="text-blue-500">
                    {getFileIcon(attachment.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{attachment.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(attachment.size)}
                      {attachment.progress > 0 && attachment.progress < 100 && (
                        <span> • {Math.round(attachment.progress)}%</span>
                      )}
                    </div>
                  </div>
                  {attachment.status === 'completed' && (
                    <div className="w-4 h-4 text-green-500">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  {attachment.status === 'error' && (
                    <div className="w-4 h-4 text-red-500">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-end gap-2">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Attach file"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 17L21 12M21 12L16 7M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.csv,.xlsx,.doc,.docx,.jpg,.jpeg,.png"
              />
            </button>
            
            <div className="flex-1 relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                className="w-full p-3 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                style={{ minHeight: '48px', maxHeight: '200px' }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() && attachments.length === 0}
                className="absolute right-2 bottom-2 p-1 rounded-full bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                title="Send message"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
            ChatIWE can make mistakes. Consider checking important information.
          </div>
        </div>
      </div>
      
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}



//hooks/useChat.tsx
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

type SendMessageOptions = {
  content: string;
  jobId?: string;
  documentText?: string;
};

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
    if (!message || !message.type) {
      console.warn('⚠️ [useChat] Received invalid message:', message);
      return;
    }
    
    console.log(`🔄 [useChat] Handling message type: ${message.type}`, message);
    
    switch (message.type) {
      case 'pong':
        setLastPing(Date.now());
        break;
        
      case 'ack':
        // Message was received by the server
        console.log(`✅ [useChat] Message ${message.messageId} acknowledged by server`);
        break;
        
      case 'assistant_typing':
        // Show typing indicator
        console.log('✍️ [useChat] Assistant is typing...');
        // You might want to update your UI to show a typing indicator
        break;
        
      case 'stream_chunk':
        // Handle streaming response chunks
        if (message.messageId && (message.content || message.chunk)) {
          const content = message.content || message.chunk || '';
          
          setMessages(prev => {
            const existingIndex = prev.findIndex(m => m.messageId === message.messageId);
            
            if (existingIndex >= 0) {
              // Update existing message
              const newMessages = [...prev];
              const existingMessage = newMessages[existingIndex];
              
              // Append new content to existing message
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
        
      case 'assistant_message':
        // Handle complete assistant message
        if (message.content && message.messageId) {
          setMessages(prev => {
            const existingIndex = prev.findIndex(m => m.messageId === message.messageId);
            
            if (existingIndex >= 0) {
              // Update existing message
              const newMessages = [...prev];
              newMessages[existingIndex] = {
                ...newMessages[existingIndex],
                content: message.content,
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
  const sendMessage = useCallback(async ({ content, jobId, documentText = '' }: SendMessageOptions) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      const error = '❌ [useChat] Cannot send message - WebSocket not connected';
      console.error(error);
      throw new Error(error);
    }

    if (!content.trim()) {
      throw new Error('Message cannot be empty');
    }

    const messageId = uuidv4();
    const timestamp = Date.now();
    
    // Create user message
    const userMessage: ChatMessage = {
      role: 'user',
      content,
      messageId,
      timestamp,
      jobId,
      status: 'sending'
    };
    
    console.log('📤 [useChat] Sending message:', {
      messageId,
      jobId,
      contentLength: content.length
    });

    // Add message to UI immediately
    setMessages(prev => [...prev, userMessage].slice(-MAX_MESSAGES));

    try {
      // Send message to WebSocket
      const message = {
        type: 'user_message',
        messageId,
        content,
        jobId,
        documentText,
        timestamp
      };

      console.log('📡 [useChat] Sending WebSocket message:', message);
      wsRef.current.send(JSON.stringify(message));

      return messageId;
    } catch (error) {
      console.error('Error sending message:', error);
      // Update message status to error
      setMessages(prev => 
        prev.map(msg => 
          msg.messageId === messageId 
            ? { ...msg, status: 'error', error: 'Failed to send message' } 
            : msg
        )
      );
      throw error;
    }
  }, []);

  // Upload a file
  const uploadFile = useCallback(async (file: File): Promise<string> => {
    if (!file) {
      throw new Error('No file provided');
    }

    const token = getSession();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const attachmentId = uuidv4();
    
    // Add to attachments list
    const attachment: Attachment = {
      id: attachmentId,
      name: file.name,
      type: getFileType(file.name, file.type),
      size: file.size,
      status: 'uploading',
      progress: 0,
      file
    };

    setAttachments(prev => [...prev, attachment]);

    try {
      console.log('📤 [useChat] Uploading file:', {
        name: file.name,
        type: file.type,
        size: file.size,
        attachmentId
      });
      
      // Upload the file
      const response = await api.uploadFile(file, token);
      
      console.log('📥 [useChat] File upload response:', {
        success: response.success,
        jobId: response.data?.job_id,
        data: response.data
      });
      
      if (!response.success || !response.data?.job_id) {
        throw new Error((response as any).error || 'Failed to upload file');
      }

      const jobId = response.data.job_id;
      
      // Update attachment with job ID and mark as processing
      setAttachments(prev => 
        prev.map(att => 
          att.id === attachmentId
            ? { ...att, status: 'processing', jobId, progress: 50 }
            : att
        )
      );

      return jobId;
    } catch (error) {
      console.error('❌ [useChat] File upload failed:', error);
      setAttachments(prev => 
        prev.map(att => 
          att.id === attachmentId
            ? { 
                ...att, 
                status: 'error', 
                error: error instanceof Error ? error.message : 'Upload failed',
                progress: 0 
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
    setMessages, // Add setMessages to the returned object
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



//chat.tsx
//chat.tsx
import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '../hooks/useChat';
import { FileType } from '@/types/chat';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export default function ChatPage() {
  const { user, logout } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Use the chat hook
  const {
    messages,
    sendMessage,
    uploadFile,
    connectionStatus,
    attachments,
    setMessages,
  } = useChat();
  
  // Refs for file inputs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Connection status indicator
  const getConnectionStatusColor = () => {
    switch(connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  // Handle sending a message
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() && attachments.length === 0) return;
    
    const message = inputValue.trim() || 'Analyze this document';
    setInputValue('');
    
    try {
      // Get the active job ID from attachments if any
      const activeAttachment = attachments.find(a => a.status === 'processing');
      const jobId = activeAttachment?.jobId;
      
      // Send the message using the chat hook
      await sendMessage({
        content: message,
        jobId,
        documentText: '' // Add document text if needed
      });
      
    } catch (error) {
      console.error('Error sending message:', error);
      // The error is already handled by the useChat hook
    }
  }, [inputValue, attachments, sendMessage]);
  
  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    if (!file) return;
    
    try {
      // Upload the file using the chat hook
      await uploadFile(file);
    } catch (error) {
      console.error('File upload error:', error);
      // The error is already handled by the useChat hook
    }
  }, [uploadFile]);
  
  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset the input value to allow selecting the same file again
    if (e.target) {
      e.target.value = '';
    }
  };
  
  // Handle key press in input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Clear chat history
  const handleNewChat = () => {
    setMessages([]);
  };
  
  // Get file type icon
  const getFileIcon = (type: FileType) => {
    switch (type) {
      case 'pdf':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'csv':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 13H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 17H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 9H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'image':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8.5 10C9.32843 10 10 9.32843 10 8.5C10 7.67157 9.32843 7 8.5 7C7.67157 7 7 7.67157 7 8.5C7 9.32843 7.67157 10 8.5 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
    }
  };
  
  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 shadow-lg transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold">ChatIWE</h1>
            <div className="flex items-center mt-2">
              <div className={`w-2 h-2 rounded-full mr-2 ${getConnectionStatusColor()}`}></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {connectionStatus === 'connected' ? 'Connected' : 
                 connectionStatus === 'connecting' ? 'Connecting...' : 
                 connectionStatus === 'error' ? 'Connection Error' : 'Disconnected'}
              </span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <button
              onClick={handleNewChat}
              className="w-full mb-4 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              New Chat
            </button>
            
            {/* Chat history would go here */}
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              Recent chats will appear here
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium">{user?.email || 'User'}</div>
                <button 
                  onClick={logout}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex items-center justify-between">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <h1 className="text-xl font-semibold">Chat</h1>
          
          <div className="w-8"></div> {/* Spacer for flex alignment */}
        </header>
        
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="text-2xl font-semibold mb-2">How can I help you today?</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                Ask me anything or upload a document to get started. I'm here to help with your questions!
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] p-4 rounded-lg ${
                      message.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none'
                    }`}
                  >
                    {message.content}
                    {message.status === 'sending' && (
                      <div className="flex space-x-1 mt-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    )}
                    {message.error && (
                      <div className="text-red-500 text-xs mt-1">{message.error}</div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        {/* Input area */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {attachments.map((attachment) => (
                <div 
                  key={attachment.id}
                  className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm"
                >
                  <div className="text-blue-500">
                    {getFileIcon(attachment.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{attachment.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(attachment.size)}
                      {attachment.progress > 0 && attachment.progress < 100 && (
                        <span> • {Math.round(attachment.progress)}%</span>
                      )}
                    </div>
                  </div>
                  {attachment.status === 'completed' && (
                    <div className="w-4 h-4 text-green-500">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  {attachment.status === 'error' && (
                    <div className="w-4 h-4 text-red-500">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-end gap-2">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Attach file"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 17L21 12M21 12L16 7M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.csv,.xlsx,.doc,.docx,.jpg,.jpeg,.png"
              />
            </button>
            
            <div className="flex-1 relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                className="w-full p-3 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                style={{ minHeight: '48px', maxHeight: '200px' }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() && attachments.length === 0}
                className="absolute right-2 bottom-2 p-1 rounded-full bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                title="Send message"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
            ChatIWE can make mistakes. Consider checking important information.
          </div>
        </div>
      </div>
      
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}


