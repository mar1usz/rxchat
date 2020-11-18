let WebSocket = require('ws');
let wss = new WebSocket.Server({ port: 8081 });

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN)
        client.send(data);
    }
  });
});
