const state = {
  activeTab: "all"
};

const elements = {
  loginPage: document.getElementById("loginPage"),
  appPage: document.getElementById("appPage"),
  loginForm: document.getElementById("loginForm"),
  username: document.getElementById("username"),
  password: document.getElementById("password"),
  loginError: document.getElementById("loginError"),
  tabButtons: document.querySelectorAll(".tab-btn")
};

function init() {
  bindEvents();
  updateTabButtons();
}

function bindEvents() {
  elements.loginForm.addEventListener("submit", handleLogin);

  elements.tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.activeTab = button.dataset.tab;
      updateTabButtons();
    });
  });
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

function updateTabButtons() {
  elements.tabButtons.forEach((button) => {
    const isActive = button.dataset.tab === state.activeTab;

    if (isActive) {
      button.className = "tab-btn rounded-md px-5 py-2.5 text-sm font-semibold transition bg-brand text-white shadow-sm";
    } else {
      button.className = "tab-btn rounded-md px-5 py-2.5 text-sm font-semibold transition bg-slate-100 text-slate-600 hover:bg-slate-200";
    }
  });
}

init();