const { webSocket } = rxjs.webSocket;
const { fromEvent } = rxjs;
const { map, filter, throttleTime } = rxjs.operators;

const subject = webSocket("ws://localhost:8081");
const chat = document.querySelector("#chat");
const user = document.querySelector("#user");
const message = document.querySelector("#message");
const disconnect = document.querySelector("#disconnect");
const getDate = () => new Date().toLocaleTimeString();

subject
  .pipe(
    map((event) => `${event.date} ${event.user}: ${event.message}\n`)
  )
  .subscribe(
    (message) => chat.innerHTML += message,
    () => subject.error({ code: 4000, reason: "[error]" }),
    () => {
      chat.innerHTML = "";
      user.value = "";
      message.value = "";
    }
  );

subject.next({ date: getDate(), user: "newuser", message: "[connected]" });

fromEvent(message, "keyup")
  .pipe(
    filter((event) => event.key === "Enter"),
    filter(() => `${user.value}`.trim().length > 0),
    filter(() => `${message.value}`.trim().length > 0),
    throttleTime(100)
  )
  .subscribe(() => {
    subject.next({ date: getDate(), user: `${user.value}`, message: `${message.value}` });
    message.value = "";
  });

fromEvent(disconnect, "click")
  .subscribe(() => {
    subject.next({ date: getDate(), user: `${user.value}`, message: "[disconnected]" });
    subject.complete();
  });
