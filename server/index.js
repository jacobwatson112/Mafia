const express = require('express');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const clients = [];

wss.on('connection', (ws) => {
  ws.role = null;

  ws.on('message', (data) => {
    const msg = JSON.parse(data);

    if (msg.type === 'register') {
      ws.role = msg.role;
      console.log(`Client registered as ${ws.role}`);
      return;
    }

    clients.forEach(client => {
      if (
        client !== ws &&
        client.readyState === WebSocket.OPEN &&
        (!msg.targetRoles || msg.targetRoles.includes(client.role))
      ) {
        client.send(JSON.stringify(msg));
      }
    });
  });

  ws.on('close', () => {
    const idx = clients.indexOf(ws);
    if (idx > -1) clients.splice(idx, 1);
  });

  clients.push(ws);
});

server.listen(3000, () => {
  console.log('WebSocket server running at http://localhost:3000');
});
