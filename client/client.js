import { getDateString } from "./date-utils.js";
const { fromEvent } = rxjs;
const { map, filter, throttleTime } = rxjs.operators;
const { webSocket } = rxjs.webSocket;

const _chat = document.querySelector("#chat");
const _user = document.querySelector("#user");
const _message = document.querySelector("#message");
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

const entersFromMessageInput = fromEvent(_message, "keyup").pipe(filter(event => event.key === "Enter"));
const clicksInDisconnect = fromEvent(_disconnect, "click");

function clearMessageInput() {
  _message.value = "";
}

function clearEverything() {
  _message.value = "";
  _user.value = "";
  _chat.value = "";
}

function connect() {
  wsSubject
    .pipe(
      map(event => `${event.date} ${event.user}: ${event.message}\n`)
    )
    .subscribe(
      msg => _chat.value += msg,
      err => console.error(err)
    );
}

function disconnect() {
  wsSubject.complete();
}

function sendMessage({ date = getDateString(), user = _user.value, message = _message.value } = {}) {
  wsSubject.next({ date, user, message });
}

function subscribeToEnters() {
  entersFromMessageInput
    .pipe(
      filter(() => _user.value.trim().length > 0),
      filter(() => _message.value.trim().length > 0),
      throttleTime(100)
    )
    .subscribe(() => {
      sendMessage();
      clearMessageInput();
    });
}

function subscribeToClicks() {
  clicksInDisconnect
    .pipe(
      filter(() => _user.value.trim().length > 0)
    )
    .subscribe(() => {
      sendMessage({ message: "[disconnecting]" });
      disconnect();
      clearEverything();
    });
}

function initialize() {
  connect();
  subscribeToEnters();
  subscribeToClicks();
  sendMessage({ user: "newuser", message: "[connected]" });
}

initialize();
