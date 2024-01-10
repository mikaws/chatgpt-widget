import { invoke } from "@tauri-apps/api/tauri";
import { appWindow } from "@tauri-apps/api/window";

async function setWindowSize(width: number, height: number) {
  width = width < MIN_WINDOW_WIDTH ? MIN_WINDOW_WIDTH : width;
  height = height < MIN_WINDOW_HEIGHT ? MIN_WINDOW_HEIGHT : height;
  await invoke("set_window_size", { width, height });
}

async function getWindowSize() {
  return (await invoke("get_window_size")) as { width: number; height: number };
}

const MIN_WINDOW_HEIGHT = 50;
const MIN_WINDOW_WIDTH = 150;
const DEFAULT_WINDOW_WIDTH = 500;
const MAX_TEXTAREA_HEIGHT = 500;

async function startListeners() {
  await listenTextarea();
  await listenFormSubmit();
  await listenLogo();
  listenExitButton();
}

async function listenTextarea() {
  const textarea = document.getElementById(
    "prompt-textarea"
  ) as HTMLTextAreaElement;
  textarea.addEventListener("input", async () => {
    // maybe is needed a debounce logic here, because if the user is pasting a large input consecutively
    // it can freeze the screen (tauri is changing the ui with delay)
    await autoScaleHeightBasedOnInput(textarea);
  });
}

async function autoScaleHeightBasedOnInput(e: HTMLElement) {
  const textAreaHeight = e.scrollHeight;
  e.style.height = "auto";
  e.style.height = `${e.scrollHeight}px`;
  if (textAreaHeight > MAX_TEXTAREA_HEIGHT) {
    e.style.overflowY = "auto";
    return;
  }
  e.style.overflow = "hidden";
  const windowSize = await getWindowSize();
  if (windowSize.height === textAreaHeight) {
    return;
  }
  await adjustWindowSize();
}

async function listenFormSubmit() {
  const form = document.getElementById("chat-form") as HTMLElement;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    showMessagesContainer();
    const textarea = document.getElementById(
      "prompt-textarea"
    ) as HTMLTextAreaElement;
    addMessageInChat("user", textarea.value);
    // await changeChatHeight();
    const chatResData = await fetchChatCompletion(textarea.value);
    addMessageInChat("assistant", chatResData.content);
    await adjustWindowSize();
    textarea.value = "";
  });
}

function showMessagesContainer() {
  const messagesContainer = document.getElementById("messages") as HTMLElement;
  messagesContainer.hidden = false;
}

function addMessageInChat(type: string, content: string) {
  const messagesContainer = document.getElementById("messages") as HTMLElement;
  const message = document.createElement("div");
  message.classList.add("message", type);
  message.textContent = content;
  messagesContainer.appendChild(message);
}

async function fetchChatCompletion(content: string) {
  // needs real implementation
  getUserId();
  getChatId();
  return {
    chatId: "uuid",
    content: "Test response",
    userId: "uuid",
  };
}

function getUserId() {}

function getChatId() {}

async function listenLogo() {
  const logo = document.getElementById("chatgpt-logo") as HTMLElement;
  await openChat(logo);
}

async function openChat(element: HTMLElement) {
  const prompt = document.querySelector(".prompt") as HTMLElement;
  const dragger = document.querySelector(".dragger") as HTMLElement;
  element.addEventListener("click", () => {
    element.hidden = true;
    prompt.style.display = "flex";
    let newWindowWidth = MIN_WINDOW_WIDTH;
    const interval = setInterval(async () => {
      if (newWindowWidth < DEFAULT_WINDOW_WIDTH) {
        await setWindowSize(newWindowWidth, getUIHeight());
        newWindowWidth += 50;
      } else {
        clearInterval(interval);
        await setWindowSize(DEFAULT_WINDOW_WIDTH, getUIHeight());
        dragger.hidden = false;
      }
    }, 10);
  });
}

function listenExitButton() {
  // const exitButton = document.getElementById("exit-button") as HTMLElement;
  // exitButton.addEventListener("click", () => {
  //   // appWindow.close();
  // });
}

function getUIHeight(): number {
  const prompt = document.querySelector(".prompt") as HTMLDivElement;
  const messages = document.querySelector(
    ".messages-container"
  ) as HTMLDivElement;
  return prompt.scrollHeight + messages.scrollHeight
}

async function adjustWindowSize() {
  const windowSize = await getWindowSize();
  setWindowSize(windowSize.width, getUIHeight());
}

startListeners();
