import { getDateString } from "./json-utilities.js";
const { fromEvent } = rxjs;
const { map, filter, throttleTime } = rxjs.operators;
const { webSocket } = rxjs.webSocket;

const URL = "ws://localhost:8081";
const NEW_USER = "newuser";
const CONNECTED_TEXT = "[connected]";
const DISCONNECTING_TEXT = "[disconnecting]";

const chatEl = document.querySelector("#chat");
const userEl = document.querySelector("#user");
const textEl = document.querySelector("#text");
const disconnectEl = document.querySelector("#disconnect");

const ws = webSocket({
  url: URL,
  openObserver: {
    next(openEvent) {
      console.log(openEvent);
    },
  },
  closeObserver: {
    next(closeEvent) {
      console.log(closeEvent);
    },
  },
});
const entersFromText = fromEvent(textEl, "keyup").pipe(
  filter((event) => event.key === "Enter")
);
const clicksInDisconnect = fromEvent(disconnectEl, "click");

ws
  .pipe(map((event) => `${event.date} ${event.user}: ${event.text}\n`))
  .subscribe(
    (msg) => (chatEl.value += msg),
    (err) => console.error(err)
  );

entersFromText.pipe(throttleTime(100)).subscribe(() => {
  sendMessage();
  clearText();
});

clicksInDisconnect.subscribe(() => {
  sendMessage({ text: DISCONNECTING_TEXT });
  disconnect();
  clearEverything();
});

sendMessage({ user: NEW_USER, text: CONNECTED_TEXT });

function sendMessage({
  date = getDateString(),
  user = userEl.value,
  text = textEl.value,
} = {}) {
  ws.next({ date, user, text });
}

function disconnect() {
  ws.complete();
}

function clearText() {
  textEl.value = "";
}

function clearEverything() {
  chatEl.value = "";
  userEl.value = "";
  textEl.value = "";
}
