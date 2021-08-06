const URL_PARTICIPANTS =
  "https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/participants";
const URL_MESSAGES =
  "https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/messages";
const URL_STATUS =
  "https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/status";
const messageList = document.querySelector(".chat-box > ul");
let username;
const userMessage = {};
let lastMessage = "";

getUsername();

// gets and validates username
function getUsername() {
  username = prompt("Qual o seu nome?");

  // send to server user
  if (username !== "" && username !== null) {
    sendUser(username);
    getMessages();
    requestInterval();
  } else {
    getUsername();
  }
}

// send username to api
function sendUser(username) {
  let promise = axios.post(URL_PARTICIPANTS, { name: username });

  promise.catch(handleError);
}

function handleError(error) {
  if (error.response.status === 400) {
    alert("Nome nao disponivel");
    getUsername();
  }
}

// get messages from server
function getMessages() {
  let promise = axios.get(URL_MESSAGES);

  promise.then(renderMessages);
  //promise.catch(handleError);
}

// get message details from current user, not yet working
function sendMessage() {
  userMessage.from = username;
  userMessage.to = document.querySelector(".contact .selected").innerText;
  userMessage.text = document.querySelector(".bottom-bar input").value;
  userMessage.type = document.querySelector(".visibility .selected").innerText;

  let promise = axios.post(URL_MESSAGES, userMessage);
}

// makes sure the messages are up to date and user is online, sendUser is the wrong function
function requestInterval(username) {
  setInterval(getMessages, 3000);
  //setInterval(sendUser, 3000, username);
}

function existNewMessages(messages) {
  message = messages.slice(-1);

  return lastMessage !== message;
}

function scrollToLast() {
  let lastItem = document.querySelector(".chat-box li:nth-last-child(1)");

  lastItem.scrollIntoView({
    behavior: "smooth",
    block: "start",
    inline: "nearest",
  });
}

function sortbyTime(response) {
  let messages = response.data.sort(function (a, b) {
    return a.time.localeCompare(b.time);
  });

  return messages;
}

// render messages scripts
function renderMessages(response) {
  let messages = response.data;
  console.log(messages);

  if (existNewMessages(messages)) {
    messageList.innerHTML = "";
    for (let i = 0; messages.length > i; i++) {
      lastMessage = messages[i];
      if (messages[i].type === "status") {
        renderStatus(messages[i]);
      } else if (messages[i].type === "private_message") {
        renderPrivateMessage(messages[i]);
      } else {
        renderMessage(messages[i]);
      }
    }
    scrollToLast();
  }
}

function renderStatus(status) {
  messageList.innerHTML += `            <li class="status">
  <p>
    <span class="time">(${status.time})</span
    ><span class="bold">${status.from}</span> ${status.text}
  </p>
</li>`;
}

function renderPrivateMessage(message) {
  messageList.innerHTML += `            <li class="${message.type}">
  <p>
    <span class="time">(${message.time})</span>
    <span class="bold">${message.from}</span> reservadamente para
    <span class="bold">${message.to}</span>: ${message.text}
  </p>
</li>`;
}

function renderMessage(message) {
  messageList.innerHTML += `            <li class="${message.type}">
  <p>
    <span class="time">(${message.time})</span>
    <span class="bold">${message.from}</span> para
    <span class="bold">${message.to}</span>: ${message.text}
  </p>
</li>`;
}

// animation page

function toggleMenu() {
  const sideMenu = document.querySelector(".side-menu");
  const overlay = document.querySelector(".overlay");

  sideMenu.classList.toggle("active");
  overlay.classList.toggle("active");
}

function selectElement(element) {
  const previousSelected = document.querySelector(".contact .selected");

  if (previousSelected !== element && previousSelected !== null) {
    previousSelected.classList.remove("selected");
  }
  element.classList.add("selected");
}
