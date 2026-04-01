const elements = {
  loginPage: document.getElementById("loginPage"),
  appPage: document.getElementById("appPage"),
  loginForm: document.getElementById("loginForm"),
  username: document.getElementById("username"),
  password: document.getElementById("password"),
  loginError: document.getElementById("loginError")
};

function init() {
  bindEvents();
}

function bindEvents() {
  elements.loginForm.addEventListener("submit", handleLogin);
}

function handleLogin(event) {
  event.preventDefault();

  const username = elements.username.value.trim();
  const password = elements.password.value.trim();

  if (username === "admin" && password === "admin123") {
    elements.loginPage.classList.add("hidden");
    elements.appPage.classList.remove("hidden");
    elements.loginError.classList.add("hidden");
    return;
  }

  elements.loginError.textContent = "Invalid credentials. Use admin / admin123";
  elements.loginError.classList.remove("hidden");
}

init();