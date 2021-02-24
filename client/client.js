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
  openObserver: { // log open event
    next(openEvent) { console.log(openEvent); }
  },
  closeObserver: {  // log close event and clear everything
    next(closeEvent) { console.log(closeEvent); clearEverything(); }
  }
});

wsSubject
  .pipe(
    map(event => `${event.date} ${event.user}: ${event.message}\n`) // project new message from server
  )
  .subscribe( // attempt to make a socket connection
    message => chat.innerHTML += message, // handle new message from server
    err => console.error(err) // log error
  );

// send message after successful connection
wsSubject.next({ date: getDateString(), user: "newuser", message: "[connected]" });


// send message and clear message input on enter
// (mind the filters! username cannot be empty)
fromEvent(message, "keyup")
  .pipe(
    filter(event => event.key === "Enter"),
    filter(() => `${user.value}`.trim().length > 0),
    filter(() => `${message.value}`.trim().length > 0),
    throttleTime(100)
  )
  .subscribe(() => {
    wsSubject.next({ date: getDateString(), user: `${user.value}`, message: `${message.value}` });
    clearMessageInput();
  });

// send message and close connection on click
fromEvent(disconnect, "click")
  .pipe(
    filter(() => `${user.value}`.trim().length > 0)
  )
  .subscribe(() => {
    wsSubject.next({ date: getDateString(), user: `${user.value}`, message: "[disconnected]" });
    wsSubject.complete();
  });
