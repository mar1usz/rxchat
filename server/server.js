const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8081 });

function initialize() {
  wss.on('connection', (ws, request) => {
    onConnection(request);

    ws.on('message', (data) => {
      onMessage(data);
    });

    ws.on('close', (code, reason) => {
      onClose(code, reason);
    });

    ws.on('error', (err) => {
      onClientError(err);
    });
  });

  wss.on('error', (err) => {
    onServerError(err);
  });
}

function onConnection(request) {
  console.log(request.rawHeaders);
}

function onMessage(data) {
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
  console.log(data);
}

function onClose(code, reason) {
  console.log({ code, reason });
}

function onClientError(err) {
  console.error(err);
}

function onServerError(err) {
  console.error(err);
}

initialize();
