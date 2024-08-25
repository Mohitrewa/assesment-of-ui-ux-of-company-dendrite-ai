const WebSocket = require('ws');
const url = require('url');

const server = new WebSocket.Server({ port: 8080 });

// Object to track connections per user
let userConnections = {};

server.on('connection', (ws, req) => {
  // Parse the user ID from the query string
  const queryParams = url.parse(req.url, true).query;
  const userId = queryParams.userUID;

  if (!userId) {
    ws.close(1008, 'User ID is required');
    return;
  }

  console.log(`New client connected with User ID: ${userId}`);

  // Initialize the user's connections array if it doesn't exist
  if (!userConnections[userId]) {
    userConnections[userId] = [];
  }

  // Add the current connection to the user's connections
  userConnections[userId].push(ws);

  // Handle incoming messages
  ws.on('message', (message) => {
    console.log(`Received message from User ID ${userId}:`, message);

    try {
      const data = JSON.parse(message);

      if (data.type === 'mousemove') {
        console.log(`User ${userId} moved mouse: x=${data.x}, y=${data.y}`);
      } else {
        console.log(`Unknown message type from User ID ${userId}:`, data);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }

    // Broadcast the message to all connections of this user
    userConnections[userId].forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  // Handle connection close
  ws.on('close', () => {
    console.log(`Client with User ID ${userId} disconnected`);
    userConnections[userId] = userConnections[userId].filter(client => client !== ws);

    // Clean up if the user has no more connections
    if (userConnections[userId].length === 0) {
      delete userConnections[userId];
    }
  });

  // Handle connection errors
  ws.on('error', (error) => {
    console.error(`WebSocket error for User ID ${userId}:`, error);
  });
});

// Log active users every 10 seconds
setInterval(() => {
  console.log('Active user connections:', Object.keys(userConnections).map(userId => ({
    userId,
    connections: userConnections[userId].length,
  })));
}, 10000);

console.log('WebSocket server is running on ws://localhost:8080');
