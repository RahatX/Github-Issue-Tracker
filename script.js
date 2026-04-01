const API = {
  allIssues: "https://phi-lab-server.vercel.app/api/v1/lab/issues"
};

const state = {
  allIssues: [],
  visibleIssues: [],
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
  emptyState: document.getElementById("emptyState"),
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
      applyFilters();
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
    applyFilters();
  } catch (error) {
    console.error(error);
    state.allIssues = [];
    updateDashboardCounts();
    applyFilters();
  } finally {
    elements.loadingState.classList.add("hidden");
  }
}

function applyFilters() {
  let filtered = [...state.allIssues];

  if (state.activeTab !== "all") {
    filtered = filtered.filter((issue) => normalizeStatus(issue.status) === state.activeTab);
  }

  state.visibleIssues = filtered;
  updateSectionHeader(filtered.length);
  renderIssues(filtered);
}

function updateDashboardCounts() {
  const openIssues = state.allIssues.filter((issue) => normalizeStatus(issue.status) === "open");
  const closedIssues = state.allIssues.filter((issue) => normalizeStatus(issue.status) === "closed");

  elements.totalCount.textContent = state.allIssues.length;
  elements.openCount.textContent = openIssues.length;
  elements.closedCount.textContent = closedIssues.length;
}

function updateSectionHeader(count) {
  const titles = {
    all: "All Issues",
    open: "Open Issues",
    closed: "Closed Issues"
  };

  elements.sectionTitle.textContent = titles[state.activeTab];
  elements.sectionCount.textContent = `${count} issues`;
  elements.issuesHeaderCount.textContent = `${count} Issues`;
}

function renderIssues(issues) {
  elements.issueGrid.innerHTML = "";

  if (!issues.length) {
    elements.emptyState.classList.remove("hidden");
    return;
  }

  elements.emptyState.classList.add("hidden");

  issues.forEach((issue) => {
    const isOpen = normalizeStatus(issue.status) === "open";
    const card = document.createElement("article");

    card.className =
      "group cursor-pointer overflow-hidden rounded-2xl border bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-md " +
      (isOpen ? "border-emerald-200" : "border-violet-200");

    const topBorder = isOpen ? "bg-emerald-500" : "bg-violet-500";
    const iconWrap = isOpen ? "bg-emerald-100 text-emerald-500" : "bg-violet-100 text-violet-500";
    const priorityClass = getPriorityBadgeClass(issue.priority);

    card.innerHTML = `
      <div class="h-1 w-full ${topBorder}"></div>
      <div class="p-6">
        <div class="flex items-start justify-between gap-4">
          <div class="flex h-9 w-9 items-center justify-center rounded-full ${iconWrap}">
            ${
              isOpen
                ? `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="8" stroke-width="2" stroke-dasharray="4 3"></circle></svg>`
                : `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="8" stroke-width="2"></circle><path d="M9 12l2 2 4-4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`
            }
          </div>

          <span class="rounded-full px-5 py-1.5 text-[13px] font-semibold uppercase tracking-wide ${priorityClass}">
            ${escapeHTML(issue.priority || "Unknown")}
          </span>
        </div>

        <h4 class="mt-5 text-[21px] font-semibold leading-[1.25] text-slate-800">
          ${escapeHTML(issue.title || "Untitled Issue")}
        </h4>

        <p class="mt-4 text-[15px] leading-8 text-slate-500">
          ${truncateText(issue.description || "No description available.", 95)}
        </p>

        <div class="mt-5 flex flex-wrap gap-2">
          ${renderOutlinedLabels(issue.labels)}
        </div>
      </div>

      <div class="border-t border-slate-200 px-6 py-5">
        <p class="text-[15px] text-slate-500">#${escapeHTML(issue.id)} by ${escapeHTML(issue.author || "Unknown")}</p>
        <p class="mt-2 text-[15px] text-slate-500">${formatDate(issue.createdAt)}</p>
      </div>
    `;

    elements.issueGrid.appendChild(card);
  });
}

function renderOutlinedLabels(labels) {
  const safeLabels = Array.isArray(labels) && labels.length ? labels : ["general"];

  return safeLabels
    .map((label) => `<span class="rounded-full border border-slate-300 px-3 py-1 text-[13px] font-medium text-slate-500">${escapeHTML(label)}</span>`)
    .join("");
}

function getPriorityBadgeClass(priority) {
  const value = String(priority || "").toLowerCase();

  if (value === "high") return "bg-rose-100 text-rose-500";
  if (value === "medium") return "bg-amber-100 text-amber-500";
  if (value === "low") return "bg-slate-200 text-slate-400";
  return "bg-slate-100 text-slate-500";
}

function normalizeStatus(status) {
  return String(status || "").trim().toLowerCase();
}

function formatDate(value) {
  if (!value) return "Unknown date";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric"
  });
}

function truncateText(text, length) {
  const safeText = String(text || "");
  if (safeText.length <= length) return escapeHTML(safeText);
  return `${escapeHTML(safeText.slice(0, length))}...`;
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
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