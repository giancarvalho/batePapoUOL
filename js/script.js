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
  if (username !== "" && username !== null) {
    sendUser(username);
  } else {
    alertMessage();
    setTimeout(alertMessage, 4000);
  }
}

// send username to api
function sendUser(username) {
  let promise = axios.post(URL_PARTICIPANTS, { name: username });

  promise.catch(userNotSent);
  promise.then(initializeChat);
}

function userNotSent(error) {
  if (error.response.status === 400) {
    alertMessage();
    setTimeout(alertMessage, 4000);
  } else {
    handleError(error);
  }
}

// activates message username is not valid
function alertMessage() {
  const message = document.querySelector(".input-field p");

  message.classList.toggle("active");
}

// sends username to server
function keepUserConnected() {
  let promise = axios.post(URL_STATUS, { name: username });

  promise.catch(handleError);
}

// get message details from current user
function sendMessage() {
  selectedUser = confirmUser(selectedUser);

  if (selectedUser !== false) {
    const inputField = document.querySelector(".bottom-bar input");
    userMessage.from = username;
    userMessage.text = inputField.value;
    userMessage.to = selectedUser;

    let promise = axios.post(URL_MESSAGES, userMessage);
    inputField.value = null;

    promise.then(messageSent);
    promise.catch(handleError);
  } else {
    selectedUser = "Todos";
  }
}

// confirms is user is still online and returns false otherwise
function confirmUser(user) {
  const selected = document.querySelector(".contact .selected .name");

  if (selected === null) {
    alertUserOffline(user);
    setDefault();
    return false;
  } else {
    return selected.innerHTML;
  }
}

function alertUserOffline(user) {
  alert(`Mensagem não enviada. O usuário ${user} está offline.`);

  return false;
}

function messageSent(promise) {
  if (promise.status === 200) {
    getMessages();
  }
}

// reloads the page in case of unknown errors
function handleError(error) {
  alert(
    `Ocorreu um erro: status ${error.response.status}. A página será recarregada.`
  );
  location.reload();
}

// gets messages from server
function getMessages() {
  let promise = axios.get(URL_MESSAGES);

  promise.then(renderMessages);
  promise.catch(handleError);
}

// render messages scripts only if new messages are available
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

function existNewMessages(messages) {
  message = messages.slice(-1);

  return lastMessage !== message;
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

// scrolls to last message
function scrollToLast() {
  let lastItem = document.querySelector(".chat-box li:nth-last-child(1)");

  lastItem.scrollIntoView({
    block: "start",
    inline: "nearest",
  });
}

// get participants from server api
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
      usersList.innerHTML += `<li class="participant selected" onclick="selectElement(this)">
        <span>
          <ion-icon name="person-circle"></ion-icon><p class="name">${newParticipants[i].name}</p>
        </span>
        <ion-icon name="checkmark-outline"></ion-icon>
      </li>`;
    } else {
      usersList.innerHTML += `<li class="participant" onclick="selectElement(this)">
        <span>
          <ion-icon name="person-circle"></ion-icon> <p class="name">${newParticipants[i].name}</p>
        </span>
        <ion-icon name="checkmark-outline"></ion-icon>
      </li>`;
    }
  }
}

// selects recipient name and type of message
function selectElement(element) {
  let previousSelected;

  if (isParticipant(element)) {
    previousSelected = document.querySelector(".contact .selected");
    selectedUser = element.querySelector(".name").innerHTML;
  } else {
    previousSelected = document.querySelector(".visibility-settings .selected");
    userMessage.type = element.value;
  }

  if (previousSelected !== element && previousSelected !== null) {
    previousSelected.classList.remove("selected");
  }

  element.classList.add("selected");
  showRecipient();
}

function isParticipant(element) {
  return element.classList.contains("participant");
}

// modifies text with message recipient
function showRecipient() {
  const element = document.querySelector(".recipient");

  if (userMessage.type === "private_message") {
    element.innerHTML = `Enviando para <p>${selectedUser}</p> (reservadamente)`;
  } else if (selectedUser === null || selectedUser === "") {
    element.innerHTML = `Enviando para Todos`;
  } else {
    element.innerHTML = `Enviando para <p>${selectedUser}</p>`;
  }
}

// hides join chat modal
function hideJoinModal() {
  const modal = document.querySelector(".join-modal");

  modal.classList.add("hidden");
}

// toggles side menu
function toggleMenu() {
  const sideMenu = document.querySelector(".side-menu");
  const overlay = document.querySelector(".overlay");

  sideMenu.classList.toggle("active");
  overlay.classList.toggle("active");
}

function sendWithEnter() {
  const sendButton = document.querySelector(".bottom-bar button");
  const inputField = document.querySelector(".bottom-bar input");

  inputField.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      sendButton.click();
    }
  });
}

// set default type and recipient
function setDefault() {
  const defaultContact = document.querySelector(".contact .default");
  const defaultType = document.querySelector(".visibility-settings .default");

  selectElement(defaultType);
  selectElement(defaultContact);
}

// makes sure the messages are up to date and user is online
function requestInterval() {
  setInterval(getMessages, 3000);
  setInterval(keepUserConnected, 5000);
}

function initializeChat() {
  setDefault();
  getMessages();
  sendWithEnter();
  requestInterval();
  hideJoinModal();
}
