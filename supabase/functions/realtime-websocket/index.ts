import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { headers } = req;
    const upgradeHeader = headers.get("upgrade") || "";

    if (upgradeHeader.toLowerCase() !== "websocket") {
      return new Response("Expected WebSocket connection", { status: 400 });
    }

    const { socket, response } = Deno.upgradeWebSocket(req);
    
    // Store connected clients
    const clients = new Set();
    
    socket.onopen = () => {
      console.log("WebSocket connection opened");
      clients.add(socket);
      
      // Send welcome message
      socket.send(JSON.stringify({
        type: 'connection',
        status: 'connected',
        timestamp: new Date().toISOString()
      }));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received message:", data);

        switch (data.type) {
          case 'ping':
            socket.send(JSON.stringify({
              type: 'pong',
              timestamp: new Date().toISOString()
            }));
            break;

          case 'join_room':
            // Join a specific room (e.g., leaderboard updates, notifications)
            socket.room = data.room;
            socket.send(JSON.stringify({
              type: 'room_joined',
              room: data.room,
              timestamp: new Date().toISOString()
            }));
            break;

          case 'broadcast':
            // Broadcast message to all clients in the same room
            clients.forEach(client => {
              if (client !== socket && client.room === socket.room && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: 'broadcast',
                  room: socket.room,
                  data: data.data,
                  timestamp: new Date().toISOString()
                }));
              }
            });
            break;

          case 'leaderboard_update':
            // Broadcast leaderboard updates to all clients in leaderboard room
            clients.forEach(client => {
              if (client.room === 'leaderboard' && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: 'leaderboard_updated',
                  data: data.data,
                  timestamp: new Date().toISOString()
                }));
              }
            });
            break;

          case 'user_achievement':
            // Broadcast achievement notifications
            clients.forEach(client => {
              if (client.room === 'achievements' && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: 'new_achievement',
                  data: data.data,
                  timestamp: new Date().toISOString()
                }));
              }
            });
            break;

          case 'eco_action_update':
            // Broadcast eco action updates for real-time feed
            clients.forEach(client => {
              if (client.room === 'eco_feed' && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: 'eco_action_added',
                  data: data.data,
                  timestamp: new Date().toISOString()
                }));
              }
            });
            break;

          default:
            socket.send(JSON.stringify({
              type: 'error',
              message: `Unknown message type: ${data.type}`,
              timestamp: new Date().toISOString()
            }));
        }
      } catch (error) {
        console.error("Error processing message:", error);
        socket.send(JSON.stringify({
          type: 'error',
          message: 'Failed to process message',
          timestamp: new Date().toISOString()
        }));
      }
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
      clients.delete(socket);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      clients.delete(socket);
    };

    return response;
  } catch (error) {
    console.error("Error in WebSocket handler:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});