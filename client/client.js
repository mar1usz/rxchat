import { getDateString } from "./utils.js";
const { webSocket } = rxjs.webSocket;
const { fromEvent } = rxjs;
const { map, filter, throttleTime } = rxjs.operators;
const chat = document.querySelector("#chat");
const user = document.querySelector("#user");
const message = document.querySelector("#message");
const disconnect = document.querySelector("#disconnect");

const clearEverything = function () {
  chat.innerHTML = "";
  user.value = "";
  message.value = "";
};
const clearMessageInput = function () {
  message.value = "";
};

const wsSubject = webSocket({
  url: "ws://localhost:8081", // port: 8081
  openObserver: { // open event
    next(openEvent) { console.log(openEvent); }
  },
  closeObserver: {  // close event
    next(closeEvent) { console.log(closeEvent); }
  }
});
wsSubject
  .pipe(
    map(event => `${event.date} ${event.user}: ${event.message}\n`) // project new message from server
  )
  .subscribe( // attempt to make a connection
    message => chat.innerHTML += message, // handle new message from server
    err => console.error(err)
  );
wsSubject.next({ date: getDateString(), user: "newuser", message: "[connected]" }); // send message after connection

fromEvent(message, "keyup")
  .pipe(
    filter(event => event.key === "Enter"),
    filter(() => user.value.trim().length > 0),  // username cannot be empty
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
    wsSubject.complete(); // close connection
    clearEverything();
  });
