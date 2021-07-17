import { getDateString } from "./json-utils.js";
import { isWhiteSpace } from "./string-utils.js";
import { v4 as uuidv4 } from "https://jspm.dev/uuid";
const { fromEvent } = rxjs;
const { map, filter, throttleTime } = rxjs.operators;
const { webSocket } = rxjs.webSocket;

const CONNECTED_TEXT = "[connected]";
const DISCONNECTING_TEXT = "[disconnecting]";

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

function setInitialUser() {
  _user.value = uuidv4().substring(0, 8);
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

function sendMessage(text = _text.value) {
  _wsSubject.next({ date: getDateString(), user: _user.value, text });
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
      sendMessage(DISCONNECTING_TEXT);
      disconnect();
      clearEverything();
    });
}

function initialize() {
  setInitialUser();
  connect();
  subscribeToEnters();
  subscribeToClicks();
  sendMessage(CONNECTED_TEXT);
}

initialize();
