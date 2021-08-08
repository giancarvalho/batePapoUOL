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
let selectedUser;

// gets and validates username
function getUsername() {
  username = document.querySelector(".input-field input").value;
  // send to server user
  if (username !== "" && username !== null) {
    initializeChat(username);
  } else {
    alertMessage();
    setTimeout(alertMessage, 4000);
  }
}

function alertMessage() {
  const message = document.querySelector(".input-field p");

  message.classList.toggle("active");
}

function initializeChat(username) {
  sendUser(username);
  setDefault();
  getMessages();
  sendWithEnter();
  requestInterval();
  hideJoinModal();
}
// send username to api
function sendUser(username) {
  let promise = axios.post(URL_PARTICIPANTS, { name: username });

  promise.catch(handleError);
}

function keepUserConnected() {
  let promise = axios.post(URL_STATUS, { name: username });

  promise.catch(handleError);
}

function handleError(error) {
  if (error.response.status === 400) {
    alertMessage();
    setTimeout(alertMessage, 4000);
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
  const inputField = document.querySelector(".bottom-bar input");
  userMessage.from = username;
  userMessage.to = confirmUser();
  userMessage.text = inputField.value;

  console.log(userMessage);
  axios.post(URL_MESSAGES, userMessage);
  inputField.value = null;
  getMessages();
}

function confirmUser() {
  if (selectedUser === null || selectedUser === "") {
    return "Todos";
  } else {
    return selectedUser;
  }
}
// makes sure the messages are up to date and user is online, sendUser is the wrong function
function requestInterval() {
  setInterval(getMessages, 3000);
  setInterval(keepUserConnected, 5000);
}

function existNewMessages(messages) {
  message = messages.slice(-1);

  return lastMessage !== message;
}

function scrollToLast() {
  let lastItem = document.querySelector(".chat-box li:nth-last-child(1)");

  lastItem.scrollIntoView({
    block: "start",
    inline: "nearest",
  });
}

// render messages scripts
function renderMessages(response) {
  let messages = response.data;

  if (existNewMessages(messages)) {
    getParticipants();
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
  if (message.to === username || message.from === username) {
    messageList.innerHTML += `            <li class="${message.type}">
  <p>
    <span class="time">(${message.time})</span>
    <span class="bold">${message.from}</span> reservadamente para
    <span class="bold">${message.to}</span>: ${message.text}
  </p>
</li>`;
  }
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

function getParticipants() {
  let promise = axios.get(URL_PARTICIPANTS);

  promise.then(renderParticipants);
}

function renderParticipants(response) {
  let newParticipants = response.data;
  const usersList = document.querySelector(".contact .users");

  usersList.innerHTML = "";
  for (let i = 0; newParticipants.length > i; i++) {
    if (newParticipants[i].name === selectedUser) {
      usersList.innerHTML += `<li class="selected" 'onclick="selectUser(this)">
        <span>
          <ion-icon name="person-circle"></ion-icon>${newParticipants[i].name}
        </span>
        <ion-icon name="checkmark-outline"></ion-icon>
      </li>`;
    } else {
      usersList.innerHTML += `<li onclick="selectUser(this)">
        <span>
          <ion-icon name="person-circle"></ion-icon>${newParticipants[i].name}
        </span>
        <ion-icon name="checkmark-outline"></ion-icon>
      </li>`;
    }
  }
}

// animation page

function toggleMenu() {
  const sideMenu = document.querySelector(".side-menu");
  const overlay = document.querySelector(".overlay");

  sideMenu.classList.toggle("active");
  overlay.classList.toggle("active");
}

function selectUser(element) {
  const previousSelected = document.querySelector(".contact .selected");

  if (previousSelected !== element && previousSelected !== null) {
    previousSelected.classList.remove("selected");
  }

  element.classList.add("selected");
  selectedUser = element.innerText;
  showRecipient();
}

function setDefault() {
  const defaultContact = document.querySelector(".contact .default");
  const defaultType = document.querySelector(".visibility-settings .default");

  selectType(defaultType);
  selectUser(defaultContact);
}

function selectType(element) {
  const previousSelected = document.querySelector(
    ".visibility-settings .selected"
  );

  if (previousSelected !== element && previousSelected !== null) {
    previousSelected.classList.remove("selected");
  }

  element.classList.add("selected");
  userMessage.type = element.value;
  showRecipient();
}

function hideJoinModal() {
  const modal = document.querySelector(".join-modal");

  modal.classList.add("hidden");
}

function showRecipient() {
  const element = document.querySelector(".recipient");

  if (userMessage.type === "private_message") {
    element.innerHTML = `Enviando para ${selectedUser} (reservadamente)`;
  } else if (selectedUser === null || selectedUser === "") {
    element.innerHTML = `Enviando para Todos`;
  } else {
    element.innerHTML = `Enviando para ${selectedUser}`;
  }
}

function sendWithEnter() {
  const sendButton = document.querySelector(".bottom-bar button");
  const inputField = document.querySelector(".bottom-bar input");

  inputField.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      sendButton.click();
    }
  });
}
