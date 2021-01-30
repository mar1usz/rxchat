const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8081 });

wss.on('connection', (ws, request) => {
  // log connection request
  console.log(request.rawHeaders);

  // broadcast from WebSocket client
  // to all connected WebSocket clients,
  // including itself
  ws.on('message', data => {
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN)
        client.send(data);
    }
    console.log(data);  // also: log message
  });

  // log close event
  ws.on('close', (code, reason) => {
    console.log({ code: code, reason: reason });
  });

  // log error
  ws.on('error', err => {
    console.error(err);
  });
});
