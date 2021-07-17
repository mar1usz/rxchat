import { getDateString } from "./json-utils.js";
import { isWhiteSpace } from "./string-utils.js";
const { fromEvent } = rxjs;
const { map, filter, throttleTime } = rxjs.operators;
const { webSocket } = rxjs.webSocket;

const _chat = document.querySelector("#chat");
const _user = document.querySelector("#user");
const _text = document.querySelector("#text");
const _disconnect = document.querySelector("#disconnect");

const _wsSubject = webSocket({
  url: "ws://localhost:8081",
  openObserver: {
    next(openEvent) { console.log(openEvent); }
  },
  closeObserver: {
    next(closeEvent) { console.log(closeEvent); }
  }
});
const _entersFromText = fromEvent(_text, "keyup")
  .pipe(filter(event => event.key === "Enter"));
const _clicksInDisconnect = fromEvent(_disconnect, "click");

function clearText() {
  _text.value = "";
}

function clearEverything() {
  _text.value = "";
  _user.value = "";
  _chat.value = "";
}

function connect() {
  _wsSubject
    .pipe(
      map(event => `${event.date} ${event.user}: ${event.text}\n`)
    )
    .subscribe(
      msg => _chat.value += msg,
      err => console.error(err)
    );
}

function disconnect() {
  _wsSubject.complete();
}

function sendMessage({ user = _user.value, text = _text.value } = {}) {
  _wsSubject.next({ date: getDateString(), user, text });
}

function subscribeToEnters() {
  _entersFromText
    .pipe(
      filter(() => !isWhiteSpace(_user.value)),
      filter(() => !isWhiteSpace(_text.value)),
      throttleTime(100)
    )
    .subscribe(() => {
      sendMessage();
      clearText();
    });
}

function subscribeToClicks() {
  _clicksInDisconnect
    .pipe(
      filter(() => !isWhiteSpace(_user.value))
    )
    .subscribe(() => {
      sendMessage({ text: "[disconnecting]" });
      disconnect();
      clearEverything();
    });
}

function initialize() {
  connect();
  subscribeToEnters();
  subscribeToClicks();
  sendMessage({ user: "newuser", text: "[connected]" });
}

initialize();
