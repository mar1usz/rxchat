import { getDateString } from "./date-utils.js";
import { isWhiteSpace } from "./string-utils.js";
const { fromEvent } = rxjs;
const { map, filter, throttleTime } = rxjs.operators;
const { webSocket } = rxjs.webSocket;

const _chat = document.querySelector("#chat");
const _user = document.querySelector("#user");
const _text = document.querySelector("#text");
const _disconnect = document.querySelector("#disconnect");

const wsSubject = webSocket({
  url: "ws://localhost:8081",
  openObserver: {
    next(openEvent) { console.log(openEvent); }
  },
  closeObserver: {
    next(closeEvent) { console.log(closeEvent); }
  }
});
const entersFromTextInput = fromEvent(_text, "keyup")
  .pipe(filter(event => event.key === "Enter"));
const clicksInDisconnect = fromEvent(_disconnect, "click");

function clearTextInput() {
  _text.value = "";
}

function clearEverything() {
  _text.value = "";
  _user.value = "";
  _chat.value = "";
}

function connect() {
  wsSubject
    .pipe(
      map(event => `${event.date} ${event.user}: ${event.text}\n`)
    )
    .subscribe(
      msg => _chat.value += msg,
      err => console.error(err)
    );
}

function disconnect() {
  wsSubject.complete();
}

function sendMessage({ date = getDateString(), user = _user.value, text = _text.value } = {}) {
  wsSubject.next({ date, user, text });
}

function subscribeToEnters() {
  entersFromTextInput
    .pipe(
      filter(() => !isWhiteSpace(_user.value)),
      filter(() => !isWhiteSpace(_text.value)),
      throttleTime(100)
    )
    .subscribe(() => {
      sendMessage();
      clearTextInput();
    });
}

function subscribeToClicks() {
  clicksInDisconnect
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
