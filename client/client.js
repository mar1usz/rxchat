import { getDateString } from "./dateUtils.js";
const { webSocket } = rxjs.webSocket;
const { fromEvent } = rxjs;
const { map, filter, throttleTime } = rxjs.operators;
const chat = document.querySelector("#chat");
const user = document.querySelector("#user");
const message = document.querySelector("#message");
const disconnect = document.querySelector("#disconnect");

function clearEverything() {
  chat.innerHTML = "";
  user.value = "";
  message.value = "";
}

function clearMessageInput() {
  message.value = "";
}

const wsSubject = webSocket({
  url: "ws://localhost:8081",
  openObserver: {
    next(openEvent) { console.log(openEvent); }
  },
  closeObserver: {
    next(closeEvent) { console.log(closeEvent); }
  }
});

wsSubject
  .pipe(
    map(event => `${event.date} ${event.user}: ${event.message}\n`)
  )
  .subscribe(
    message => chat.innerHTML += message,
    err => console.error(err)
  );

wsSubject.next({ date: getDateString(), user: "newuser", message: "[connected]" });

fromEvent(message, "keyup")
  .pipe(
    filter(event => event.key === "Enter"),
    filter(() => user.value.trim().length > 0),
    filter(() => message.value.trim().length > 0),
    throttleTime(100)
  )
  .subscribe(() => {
    wsSubject.next({ date: getDateString(), user: user.value, message: message.value });
    clearMessageInput();
  });

fromEvent(disconnect, "click")
  .pipe(
    filter(() => user.value.trim().length > 0)
  )
  .subscribe(() => {
    wsSubject.next({ date: getDateString(), user: user.value, message: "[disconnected]" });
    wsSubject.complete();
    clearEverything();
  });
