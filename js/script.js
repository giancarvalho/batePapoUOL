const messageList = document.querySelector(".chat-box > ul");

function toggleMenu() {
  const sideMenu = document.querySelector(".side-menu");
  const overlay = document.querySelector(".overlay");

  sideMenu.classList.toggle("active");
  overlay.classList.toggle("active");
}

function selectElement(element) {
  const previousSelected = document.querySelector(".contact .active");

  if (previousSelected !== element && previousSelected !== null) {
    previousSelected.classList.remove("active");
  }
  element.classList.add("active");
}

function getMessages() {
  let promise = axios.get(
    "https://mock-api.bootcamp.respondeai.com.br/api/v2/uol/messages"
  );

  promise.then(renderMessages);
  promise.catch(alertError);
}

function renderMessages(response) {
  const messages = response.data;

  for (let i = 0; messages.length > i; i++) {
    if (messages[i].type === "status") {
      renderStatus(messages[i]);
    } else if (messages[i].type === "private_message") {
      renderPrivateMessage(messages[i]);
    } else {
      renderMessage(messages[i]);
    }
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

function alertError(error) {
  console.log(error);
}
