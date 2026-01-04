import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface WebSocketMessage {
  type: string;
  data?: any;
  room?: string;
  timestamp: string;
}

export const useWebSocket = () => {
  const { user, session } = useAuth();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  const connect = () => {
    if (!user || socket?.readyState === WebSocket.OPEN) return;

    try {
      const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host.replace(':3000', ':54321')}/functions/v1/realtime-websocket`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          console.log('WebSocket message received:', message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setConnected(false);
        setSocket(null);
        
        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          if (user) {
            connect();
          }
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnected(false);
      };

      setSocket(ws);
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  };

  const disconnect = () => {
    if (socket) {
      socket.close();
      setSocket(null);
      setConnected(false);
    }
  };

  const sendMessage = (message: Omit<WebSocketMessage, 'timestamp'>) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        ...message,
        timestamp: new Date().toISOString()
      }));
    }
  };

  const joinRoom = (room: string) => {
    sendMessage({
      type: 'join_room',
      room
    });
  };

  const broadcastToRoom = (room: string, data: any) => {
    sendMessage({
      type: 'broadcast',
      room,
      data
    });
  };

  const notifyLeaderboardUpdate = (data: any) => {
    sendMessage({
      type: 'leaderboard_update',
      data
    });
  };

  const notifyAchievement = (data: any) => {
    sendMessage({
      type: 'user_achievement',
      data
    });
  };

  const notifyEcoAction = (data: any) => {
    sendMessage({
      type: 'eco_action_update',
      data
    });
  };

  const ping = () => {
    sendMessage({ type: 'ping' });
  };

  useEffect(() => {
    if (user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [user]);

  // Keep connection alive with periodic pings
  useEffect(() => {
    if (!connected) return;

    const interval = setInterval(() => {
      ping();
    }, 30000); // Ping every 30 seconds

    return () => clearInterval(interval);
  }, [connected]);

  return {
    connected,
    lastMessage,
    sendMessage,
    joinRoom,
    broadcastToRoom,
    notifyLeaderboardUpdate,
    notifyAchievement,
    notifyEcoAction,
    ping,
    connect,
    disconnect
  };
};
