const API = {
  allIssues: "https://phi-lab-server.vercel.app/api/v1/lab/issues"
};

const state = {
  allIssues: [],
  activeTab: "all"
};

const elements = {
  loginPage: document.getElementById("loginPage"),
  appPage: document.getElementById("appPage"),
  loginForm: document.getElementById("loginForm"),
  username: document.getElementById("username"),
  password: document.getElementById("password"),
  loginError: document.getElementById("loginError"),

  totalCount: document.getElementById("totalCount"),
  openCount: document.getElementById("openCount"),
  closedCount: document.getElementById("closedCount"),
  issuesHeaderCount: document.getElementById("issuesHeaderCount"),
  sectionTitle: document.getElementById("sectionTitle"),
  sectionCount: document.getElementById("sectionCount"),
  loadingState: document.getElementById("loadingState"),
  issueGrid: document.getElementById("issueGrid"),
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
    fetchIssues();
    return;
  }

  elements.loginError.textContent = "Invalid credentials. Use admin / admin123";
  elements.loginError.classList.remove("hidden");
}

async function fetchIssues() {
  elements.loadingState.classList.remove("hidden");

  try {
    const response = await fetch(API.allIssues);
    const result = await response.json();
    state.allIssues = Array.isArray(result?.data) ? result.data : [];
    updateDashboardCounts();
    updateSectionHeader(state.allIssues.length);
  } catch (error) {
    console.error(error);
    state.allIssues = [];
    updateDashboardCounts();
    updateSectionHeader(0);
  } finally {
    elements.loadingState.classList.add("hidden");
  }
}

function updateDashboardCounts() {
  const openIssues = state.allIssues.filter((issue) => normalizeStatus(issue.status) === "open");
  const closedIssues = state.allIssues.filter((issue) => normalizeStatus(issue.status) === "closed");

  elements.totalCount.textContent = state.allIssues.length;
  elements.openCount.textContent = openIssues.length;
  elements.closedCount.textContent = closedIssues.length;
}

function updateSectionHeader(count) {
  elements.sectionTitle.textContent = "All Issues";
  elements.sectionCount.textContent = `${count} issues`;
  elements.issuesHeaderCount.textContent = `${count} Issues`;
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

function normalizeStatus(status) {
  return String(status || "").trim().toLowerCase();
}

init();