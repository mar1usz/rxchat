let ws = new WebSocket("ws://localhost:8081");
let chat = document.querySelector("#chat");
let user = document.querySelector("#user");
let message = document.querySelector("#message");
let disconnect = document.querySelector("#disconnect");

ws.onopen = (event) => {
  let data = "newuser:[connected]" + "\n";
  ws.send(data);
};

ws.onmessage = (event) => {
  chat.innerHTML += event.data;
};

ws.onclose = (event) => {
  chat.innerHTML = "";
  user.value = "";
  message.value = "";
};

ws.onerror = (event) => {
  let data = `${user.value}:[error:${event}]` + "\n";
  ws.send(data);
};

message.addEventListener("keyup", event => {
  if (event.key === "Enter")
  {
    let data = `${user.value}:${message.value}` + "\n";
    ws.send(data);
    message.value = "";
  }
});

disconnect.addEventListener("click", () => {
  let data = `${user.value}:[disconnected]` + "\n";
  ws.send(data);
  ws.close();
});
