import { getDateString } from "./json-utilities.js";
const { fromEvent } = rxjs;
const { map, filter, throttleTime } = rxjs.operators;
const { webSocket } = rxjs.webSocket;

const chatTextArea = document.querySelector("#chat");
const userInput = document.querySelector("#user");
const textInput = document.querySelector("#text");
const disconnectButton = document.querySelector("#disconnect");

const webSocketSubject = webSocket({
  url: "ws://localhost:8081",
  openObserver: {
    next(openEvent) {
      console.log(openEvent);
    },
  },
  closeObserver: {
    next(closeEvent) {
      console.log(closeEvent);
    },
  },
});
const entersFromText = fromEvent(textInput, "keyup").pipe(
  filter((event) => event.key === "Enter")
);
const clicksInDisconnect = fromEvent(disconnectButton, "click");

webSocketSubject
  .pipe(map((event) => `${event.date} ${event.user}: ${event.text}\n`))
  .subscribe(
    (msg) => (chatTextArea.value += msg),
    (err) => console.error(err)
  );

entersFromText.pipe(throttleTime(100)).subscribe(() => {
  sendMessage();
  clearText();
});

clicksInDisconnect.subscribe(() => {
  disconnect();
  clearEverything();
});

function sendMessage() {
  webSocketSubject.next({
    date: getDateString(),
    user: userInput.value,
    text: textInput.value
  });
}

function disconnect() {
  webSocketSubject.complete();
}

function clearText() {
  textInput.value = "";
}

function clearEverything() {
  chatTextArea.value = "";
  userInput.value = "";
  textInput.value = "";
}
