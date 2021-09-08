import { getDateString } from "./json-utilities.js";
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
const _disconnectButton = document.querySelector("#disconnectButton");

const _subject = webSocket({
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
const _clicksInDisconnectButton = fromEvent(_disconnectButton, "click");

_subject
  .pipe(map((event) => `${event.date} ${event.user}: ${event.text}\n`))
  .subscribe(
    (msg) => (_chat.value += msg),
    (err) => console.error(err)
  );

_entersFromText.pipe(throttleTime(100)).subscribe(() => {
  sendMessage();
  clearText();
});

_clicksInDisconnectButton.subscribe(() => {
  sendMessage({ text: DISCONNECTING_TEXT });
  disconnect();
  clearEverything();
});

sendMessage({ user: NEW_USER, text: CONNECTED_TEXT });

function sendMessage({
  date = getDateString(),
  user = _user.value,
  text = _text.value,
} = {}) {
  _subject.next({ date, user, text });
}

function disconnect() {
  _subject.complete();
}

function clearText() {
  _text.value = "";
}

function clearEverything() {
  _chat.value = "";
  _user.value = "";
  _text.value = "";
}
