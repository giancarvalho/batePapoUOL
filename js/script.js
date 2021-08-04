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
