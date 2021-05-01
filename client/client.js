import { getDateString } from "./date-utils.js";
const { fromEvent } = rxjs;
const { map, filter, throttleTime } = rxjs.operators;
const { webSocket } = rxjs.webSocket;
const chat = document.querySelector("#chat");
const user = document.querySelector("#user");
const message = document.querySelector("#message");
const disconnect = document.querySelector("#disconnect");

function clearMessageInput() {
  message.value = "";
}

function clearEverything() {
  message.value = "";
  user.value = "";
  chat.value = "";
}

const subject = webSocket({
  url: "ws://localhost:8081",
  openObserver: {
    next(openEvent) { console.log(openEvent); }
  },
  closeObserver: {
    next(closeEvent) { console.log(closeEvent); }
  }
});

subject
  .pipe(
    map(event => `${event.date} ${event.user}: ${event.message}\n`)
  )
  .subscribe(
    message => chat.value += message,
    err => console.error(err)
  );

subject.next({ date: getDateString(), user: "newuser", message: "[connected]" });

fromEvent(message, "keyup")
  .pipe(
    filter(event => event.key === "Enter"),
    filter(() => user.value.trim().length > 0),
    filter(() => message.value.trim().length > 0),
    throttleTime(100)
  )
  .subscribe(() => {
    subject.next({ date: getDateString(), user: user.value, message: message.value });
    clearMessageInput();
  });

fromEvent(disconnect, "click")
  .pipe(
    filter(() => user.value.trim().length > 0)
  )
  .subscribe(() => {
    subject.next({ date: getDateString(), user: user.value, message: "[disconnecting]" });
    subject.complete();
    clearEverything();
  });
