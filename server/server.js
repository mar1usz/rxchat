const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8081 });

wss.on('connection', (ws, request) => {
  console.log(request.rawHeaders);

  ws.on('message', data => {
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN)
        client.send(data);
    }
    console.log(data);
  });

  ws.on('close', (code, reason) => {
    console.log({ code: code, reason: reason });
  });

  ws.on('error', err => {
    console.error(err);
  });
});

wss.on('error', (err) => {
  console.error(err);
});
