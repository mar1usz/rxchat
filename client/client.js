import { getDateString } from "./json-utils.js";
const { fromEvent } = rxjs;
const { map, filter, throttleTime } = rxjs.operators;
const { webSocket } = rxjs.webSocket;

const URL = "ws://localhost:8081";
const NEW_USER = "newuser";
const CONNECTED_TEXT = "[connected]";
const DISCONNECTING_TEXT = "[disconnecting]";

const _chat = document.querySelector("#chat");
const _user = document.querySelector("#user");
const _text = document.querySelector("#text");
const _disconnect = document.querySelector("#disconnect");

const _wsSubject = webSocket({
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
const _entersFromText = fromEvent(_text, "keyup").pipe(
  filter((event) => event.key === "Enter")
);
const _clicksInDisconnect = fromEvent(_disconnect, "click");

function initialize() {
  connect();
  subscribeToEnters();
  subscribeToClicks();
  sendMessage({ user: NEW_USER, text: CONNECTED_TEXT });
}

function connect() {
  _wsSubject
    .pipe(map((event) => `${event.date} ${event.user}: ${event.text}\n`))
    .subscribe(
      (msg) => (_chat.value += msg),
      (err) => console.error(err)
    );
}

function sendMessage({
  date = getDateString(),
  user = _user.value,
  text = _text.value,
} = {}) {
  _wsSubject.next({ date, user, text });
}

function disconnect() {
  _wsSubject.complete();
}

function subscribeToEnters() {
  _entersFromText.pipe(throttleTime(100)).subscribe(() => {
    sendMessage();
    clearText();
  });
}

function subscribeToClicks() {
  _clicksInDisconnect.subscribe(() => {
    sendMessage({ text: DISCONNECTING_TEXT });
    disconnect();
    clearEverything();
  });
}

function clearText() {
  _text.value = "";
}

function clearEverything() {
  _text.value = "";
  _user.value = "";
  _chat.value = "";
}

initialize();
