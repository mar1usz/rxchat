import { getDateString } from "./json-utils.js";
const { fromEvent } = rxjs;
const { map, filter, throttleTime } = rxjs.operators;
const { webSocket } = rxjs.webSocket;

const URL = "ws://localhost:8081";
const NEW_USER = "newuser";
const CONNECTED_TEXT = "[connected]";
const DISCONNECTING_TEXT = "[disconnecting]";

const chat = document.querySelector("#chat");
const user = document.querySelector("#user");
const text = document.querySelector("#text");
const disconnectButton = document.querySelector("#disconnectButton");

const webSocketSubject = webSocket({
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

const entersFromText = fromEvent(text, "keyup").pipe(
  filter((event) => event.key === "Enter")
);
const clicksInDisconnectButton = fromEvent(disconnectButton, "click");

function initialize() {
  connect();
  subscribeToEnters();
  subscribeToClicks();
  sendMessage({ user: NEW_USER, text: CONNECTED_TEXT });
}

function connect() {
  webSocketSubject
    .pipe(map((event) => `${event.date} ${event.user}: ${event.text}\n`))
    .subscribe(
      (msg) => (_chat.value += msg),
      (err) => console.error(err)
    );
}

function subscribeToEnters() {
  entersFromText.pipe(throttleTime(100)).subscribe(() => {
    sendMessage();
    clearText();
  });
}

function subscribeToClicks() {
  clicksInDisconnectButton.subscribe(() => {
    sendMessage({ text: DISCONNECTING_TEXT });
    disconnect();
    clearEverything();
  });
}

function sendMessage({
  date = getDateString(),
  user = user.value,
  text = text.value,
} = {}) {
  webSocketSubject.next({ date, user, text });
}

function disconnect() {
  webSocketSubject.complete();
}

function clearText() {
  text.value = "";
}

function clearEverything() {
  chat.value = "";
  user.value = "";
  text.value = "";
}

initialize();
