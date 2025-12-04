import { useEffect, useRef, useState, useCallback } from 'react';
import { 
  WebSocketMessage, 
  StreamUpdateMessage, 
  StreamCompleteMessage, 
  RawMessage 
} from '@/types/index';

// Determine if we're in production based on the current hostname
const isProd = typeof window !== 'undefined' && 
  (window.location.hostname.endsWith('iweapps.com') || 
   process.env.NODE_ENV === 'production');

// Base URL without the /ws suffix to prevent duplication
const getBaseUrl = (): string => {
  // If NEXT_PUBLIC_WS_URL is set, use it as-is
  if (process.env.NEXT_PUBLIC_WS_URL) {
    const url = process.env.NEXT_PUBLIC_WS_URL.replace(/\/+$/, ''); // Remove trailing slashes
    console.log('🌐 Using NEXT_PUBLIC_WS_URL:', url);
    return url;
  }
  
  // In development, use WebSocket protocol matching the current page's protocol
  if (!isProd) {
    const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = typeof window !== 'undefined' ? window.location.host : 'localhost:8080';
    const url = `${protocol}//${host}`;
    console.log('🌐 Using development WebSocket URL:', url);
    return url;
  }
  
  // Production fallback
  return 'wss://api.iweapps.com';
};

const WS_BASE_URL = getBaseUrl();

// Debug logging for WebSocket configuration
console.log('🌐 WebSocket Configuration:', {
  isProd,
  WS_BASE_URL,
  hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
  protocol: typeof window !== 'undefined' ? window.location.protocol : 'server',
  env: process.env.NODE_ENV,
  NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL
});

// Get auth token from localStorage for development
const getDevAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  // Try to get token from auth context first, then fallback to localStorage
  try {
    const authState = JSON.parse(localStorage.getItem('auth_state') || '{}');
    return authState?.token || localStorage.getItem('dev_jwt');
  } catch (e) {
    return localStorage.getItem('dev_jwt');
  }
};

// Construct WebSocket URL with proper authentication
function getWebSocketUrl(isReactNative: boolean = false, authToken?: string): string {
  let baseUrl = WS_BASE_URL;
  const wsProtocol = baseUrl.startsWith('https') ? 'wss://' : 'ws://';
  const wsUrl = baseUrl.replace(/^https?:\/\//, '');
  
  // Construct the WebSocket URL
  let url = `${wsProtocol}${wsUrl}`;
  
  // Ensure /ws endpoint
  if (!url.endsWith('/ws')) {
    url = url.endsWith('/') ? `${url}ws` : `${url}/ws`;
  }
  
  // Add token to URL if provided
  if (authToken) {
    const separator = url.includes('?') ? '&' : '?';
    url += `${separator}token=${encodeURIComponent(authToken)}`;
  }
  
  console.log('🌐 WebSocket URL:', url);
  return url;
}

const WS_URL = getWebSocketUrl();

interface MessageHandler {
  (message: any): void;
}

type MessageHandlers = Map<string, MessageHandler>;

interface UseWebSocketOptions {
  /** Global message handler */
  onMessage?: (message: WebSocketMessage) => void;
  /** Callback when connection is established */
  onConnect?: () => void;
  /** Callback when connection is closed */
  onDisconnect?: () => void;
  /** Callback when an error occurs */
  onError?: (error: Event | Error) => void;
  /** Initial delay before reconnecting (ms) */
  reconnectInterval?: number;
  /** Maximum number of reconnection attempts */
  maxReconnectAttempts?: number;
  /** JWT token for authentication */
  authToken?: string;
  /** Initial message handlers */
  messageHandlers?: MessageHandlers;
  /** Enable ping/pong keep-alive (default: true) */
  keepAlive?: boolean;
  /** Ping interval in milliseconds (default: 30000) */
  pingInterval?: number;
}

interface UseWebSocketReturn {
  /** Whether the WebSocket is connected */
  isConnected: boolean;
  /** Last received message */
  lastMessage: WebSocketMessage | null;
  /** Send a message through the WebSocket */
  sendMessage: (type: string, data?: any) => boolean;
  /** Reconnect to the WebSocket */
  reconnect: () => void;
  /** Add a message handler for a specific message type */
  addMessageHandler: (type: string, handler: MessageHandler) => () => void;
  /** Remove a message handler */
  removeMessageHandler: (type: string) => void;
  /** Clear all message handlers */
  clearMessageHandlers: () => void;
  /** Get the current WebSocket instance */
  getWebSocket: () => WebSocket | null;
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5,
    authToken,
    messageHandlers: initialHandlers,
    keepAlive = true,
    pingInterval = 30000
  } = options;
  
  const debug = (message: string, data?: any) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[WebSocket] ${message}`, data || '');
    }
  };

  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const messageBufferRef = useRef('');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const pingIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const messageHandlersRef = useRef<MessageHandlers>(initialHandlers || new Map());
  const isMountedRef = useRef(true);

  // Setup ping/pong mechanism
  const setupPingPong = useCallback((ws: WebSocket) => {
    if (!keepAlive) return;
    
    // Clear any existing interval
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
    }
    
    // Send ping at the specified interval
    pingIntervalRef.current = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        const pingMessage = { 
          type: 'ping', 
          timestamp: Date.now() 
        };
        ws.send(JSON.stringify(pingMessage));
        debug('Sent ping', pingMessage);
      }
    }, pingInterval);
  }, [keepAlive, pingInterval]);

  // Handle incoming messages
  const handleMessage = useCallback((message: any) => {
    try {
      debug('Received message:', message);
      
      // Handle ping/pong
      if (message.type === 'pong') {
        debug('Received pong', { timestamp: message.timestamp });
        return;
      }
      
      // Handle auth response
      if (message.type === 'auth_response') {
        if (message.authenticated) {
          debug('WebSocket authentication successful');
          if (onConnect) onConnect();
        } else {
          const error = new Error(`Authentication failed: ${message.error || 'Unknown error'}`);
          debug('WebSocket authentication failed:', error);
          wsRef.current?.close(4001, 'Authentication failed');
          onError?.(error);
        }
        return;
      }
      
      // Update last message
      setLastMessage(message);
      
      // Call specific handler if registered
      const handler = messageHandlersRef.current.get(message.type);
      if (handler) {
        try {
          handler(message);
        } catch (err) {
          console.error(`Error in message handler for type '${message.type}':`, err);
        }
      }
      
      // Call global message handler
      if (onMessage) {
        onMessage(message);
      }
    } catch (error) {
      console.error('Error handling message:', error, message);
    }
  }, [onMessage, onConnect, onError]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!isMountedRef.current) return;
    
    try {
      const wsUrl = getWebSocketUrl(false, authToken);
      debug('Connecting to WebSocket:', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      
      // Setup ping/pong
      if (keepAlive) {
        setupPingPong(ws);
      }
      
      // Connection opened
      ws.onopen = () => {
        if (!isMountedRef.current) {
          ws.close();
          return;
        }
        
        debug('WebSocket connected, authenticating...');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        
        // If we have an auth token, send an auth message
        if (authToken) {
          const authMessage = {
            type: 'auth',
            token: authToken,
            timestamp: new Date().toISOString()
          };
          debug('Sending auth message:', authMessage);
          ws.send(JSON.stringify(authMessage));
        } else if (onConnect) {
          onConnect();
        }
      };
      
      // Message received
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error, event.data);
        }
      };
      
      // Handle errors
      ws.onerror = (event) => {
        const error = new Error('WebSocket error');
        debug('WebSocket error:', { 
          error: event,
          readyState: ws.readyState,
          url: wsUrl 
        });
        
        if (onError) {
          onError(error);
        }
        
        // Close the connection on error to trigger reconnection
        ws.close();
      };
      
      // Handle connection close
      ws.onclose = (event) => {
        if (!isMountedRef.current) return;
        
        debug('WebSocket disconnected:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
          url: wsUrl
        });
        
        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = undefined;
        }
        
        setIsConnected(false);
        wsRef.current = null;
        
        if (onDisconnect) {
          onDisconnect();
        }
        
        // Don't attempt to reconnect if we explicitly closed the connection
        if (event.code === 1000 || event.code === 1005) {
          debug('WebSocket closed normally, not reconnecting');
          return;
        }
        
        // Check if we've reached max reconnection attempts
        if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          const error = new Error(`Max reconnection attempts (${maxReconnectAttempts}) reached`);
          debug(error.message);
          if (onError) {
            onError(error);
          }
          return;
        }
        
        // Calculate delay with exponential backoff and jitter
        const baseDelay = Math.min(
          reconnectInterval * Math.pow(2, reconnectAttemptsRef.current),
          30000 // Max 30 seconds
        );
        const jitter = Math.random() * 1000; // Add up to 1s jitter
        const delay = Math.min(baseDelay + jitter, 30000);
        
        reconnectAttemptsRef.current += 1;
        
        debug(`Reconnecting in ${Math.round(delay)}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          if (!isMountedRef.current) return;
          debug(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
          connect();
        }, delay);
      };
      
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      if (onError && error instanceof Error) {
        onError(error);
      }
    }
  }, [
    onMessage, 
    onConnect, 
    onDisconnect, 
    onError, 
    reconnectInterval, 
    maxReconnectAttempts, 
    authToken, 
    keepAlive, 
    setupPingPong,
    handleMessage
  ]);

  // Send a message through the WebSocket
  const sendMessage = useCallback((type: string, data?: any): boolean => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket is not connected. Message not sent:', { type, ...data });
      return false;
    }
    
    try {
      const message = { 
        type, 
        ...data, 
        timestamp: new Date().toISOString() 
      };
      
      wsRef.current.send(JSON.stringify(message));
      debug('Sent message:', message);
      return true;
    } catch (error) {
      console.error('Error sending message:', error, { type, ...data });
      return false;
    }
  }, []);
  
  // Add a message handler for a specific message type
  const addMessageHandler = useCallback((type: string, handler: MessageHandler) => {
    messageHandlersRef.current.set(type, handler);
    debug(`Added handler for message type: ${type}`);
    
    // Return cleanup function
    return () => {
      messageHandlersRef.current.delete(type);
      debug(`Removed handler for message type: ${type}`);
    };
  }, []);
  
  // Remove a message handler
  const removeMessageHandler = useCallback((type: string) => {
    messageHandlersRef.current.delete(type);
    debug(`Removed handler for message type: ${type}`);
  }, []);
  
  // Clear all message handlers
  const clearMessageHandlers = useCallback(() => {
    messageHandlersRef.current.clear();
    debug('Cleared all message handlers');
  }, []);
  
  // Get the current WebSocket instance
  const getWebSocket = useCallback((): WebSocket | null => {
    return wsRef.current;
  }, []);

  // Reconnect to the WebSocket
  const reconnect = useCallback(() => {
    // Reset reconnection attempts
    reconnectAttemptsRef.current = 0;
    
    // Clear any pending reconnection
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = undefined;
    }
    
    // Close existing connection if any
    if (wsRef.current) {
      debug('Closing existing connection for reconnection');
      wsRef.current.close();
    } else {
      // If no existing connection, just connect
      debug('Initiating new connection');
      connect();
    }
  }, [connect]);

  // Initialize WebSocket connection on mount
  useEffect(() => {
    isMountedRef.current = true;
    
    // Initial connection
    connect();
    
    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
      
      // Clear reconnection timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = undefined;
      }
      
      // Clear ping interval
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = undefined;
      }
      
      // Close WebSocket connection
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      
      debug('WebSocket hook unmounted');
    };
  }, [connect]);

  // Return the WebSocket API
  return {
    isConnected,
    lastMessage,
    sendMessage,
    reconnect,
    addMessageHandler,
    removeMessageHandler,
    clearMessageHandlers,
    getWebSocket
  };
}
