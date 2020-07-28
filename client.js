const { webSocket } = rxjs.webSocket;
const { fromEvent } = rxjs;
const { map, filter, throttleTime } = rxjs.operators;

let subject = webSocket("ws://localhost:8081");
let chat = document.querySelector("#chat");
let user = document.querySelector("#user");
let message = document.querySelector("#message");
let disconnect = document.querySelector("#disconnect");
let getDate = () => new Date().toLocaleTimeString();

subject
  .pipe(
    map((event) => event.date + " " + event.user + ": " + event.message + "\n")
  )
  .subscribe(
    (message) => chat.innerHTML += message,
    () => subject.next({date: getDate(), user: `${user.value}`, message: "[error]"}),
    () => {
      chat.innerHTML = "";
      user.value = "";
      message.value = "";
    }
  );
subject.next({date: getDate(), user: "newuser", message: "[connected]"});

fromEvent(message, "keyup")
  .pipe(
    filter((event) => event.key === "Enter"),
    throttleTime(500)
  )
  .pipe(
    filter(() => `${user.value}`.length > 0),
    filter(() => `${message.value}`.trim().length > 0)
  )
  .subscribe(() => {
    subject.next({date: getDate(), user: `${user.value}`, message: `${message.value}`});
    message.value = "";
  });

fromEvent(disconnect, "click")
  .subscribe(() => {
    subject.next({date: getDate(), user: `${user.value}`, message: "[disconnected]"});
    subject.complete();
  });
