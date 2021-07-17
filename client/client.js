import { getDateString } from "./date-utils.js";
const { fromEvent } = rxjs;
const { map, filter, throttleTime } = rxjs.operators;
const { webSocket } = rxjs.webSocket;

const chat = document.querySelector("#chat");
const user = document.querySelector("#user");
const message = document.querySelector("#message");
const disconnect = document.querySelector("#disconnect");

const subject = webSocket({
  url: "ws://localhost:8081",
  openObserver: {
    next(openEvent) { console.log(openEvent); }
  },
  closeObserver: {
    next(closeEvent) { console.log(closeEvent); }
  }
});
const clicksInDisconnect = fromEvent(disconnect, "click");
const enterKeyups = fromEvent(message, "keyup")
  .pipe(filter(event => event.key === "Enter"));

function clearMessageInput() {
  message.value = "";
}

function clearEverything() {
  message.value = "";
  user.value = "";
  chat.value = "";
}

subject
  .pipe(
    map(event => `${event.date} ${event.user}: ${event.message}\n`)
  )
  .subscribe(
    msg => chat.value += msg,
    err => console.error(err)
  );

clicksInDisconnect
  .pipe(
    filter(() => user.value.trim().length > 0)
  )
  .subscribe(() => {
    subject.next({ date: getDateString(), user: user.value, message: "[disconnecting]" });
    subject.complete();
    clearEverything();
  });

enterKeyups
  .pipe(
    filter(() => user.value.trim().length > 0),
    filter(() => message.value.trim().length > 0),
    throttleTime(100)
  )
  .subscribe(() => {
    subject.next({ date: getDateString(), user: user.value, message: message.value });
    clearMessageInput();
  });

subject.next({ date: getDateString(), user: "newuser", message: "[connected]" });
