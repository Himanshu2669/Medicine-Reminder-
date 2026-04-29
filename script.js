/* ═══════════════════════════════════════════════
   AUTH LOGIC
═══════════════════════════════════════════════ */

function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function getCurrentUser() {
  return localStorage.getItem("currentUser") || null;
}

function setCurrentUser(username) {
  localStorage.setItem("currentUser", username);
}

function showSignup(e) {
  if (e) e.preventDefault();
  document.getElementById("login-box").style.display = "none";
  document.getElementById("signup-box").style.display = "flex";
  document.getElementById("signup-error").textContent = "";
}

function showLogin(e) {
  if (e) e.preventDefault();
  document.getElementById("signup-box").style.display = "none";
  document.getElementById("login-box").style.display = "flex";
  document.getElementById("login-error").textContent = "";
}

function signup() {
  const username = document.getElementById("signup-username").value.trim();
  const password = document.getElementById("signup-password").value;
  const confirm  = document.getElementById("signup-confirm").value;
  const errEl    = document.getElementById("signup-error");

  if (!username || !password) { errEl.textContent = "Please fill in all fields."; return; }
  if (password.length < 8)    { errEl.textContent = "Password must be at least 8 characters."; return; }
  if (password !== confirm)   { errEl.textContent = "Passwords do not match."; return; }

  const users = getUsers();
  if (users.find(u => u.username === username)) {
    errEl.textContent = "Username already taken. Try another.";
    return;
  }

  users.push({ username, password });
  saveUsers(users);
  setCurrentUser(username);
  launchApp();
  showToast("Account created! Welcome, " + username + " 🎉");
}

function login() {
  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value;
  const errEl    = document.getElementById("login-error");

  if (!username || !password) { errEl.textContent = "Please fill in all fields."; return; }

  const users = getUsers();
  const user  = users.find(u => u.username === username && u.password === password);

  if (!user) {
    errEl.textContent = "Invalid username or password.";
    return;
  }

  setCurrentUser(username);
  launchApp();
  showToast("Welcome back, " + username + "! 👋");
}

function logout() {
  localStorage.removeItem("currentUser");
  document.getElementById("main-app").style.display = "none";
  document.getElementById("auth-section").style.display = "flex";
  showLogin();
  clearInterval(reminderInterval);
}

function launchApp() {
  const username = getCurrentUser();
  document.getElementById("auth-section").style.display = "none";
  document.getElementById("main-app").style.display = "block";
  document.getElementById("nav-username").textContent = username;

  medicines = loadMedicines();
  display();
  startReminderTimer();

  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }
}

/* ═══════════════════════════════════════════════
   MEDICINE STORAGE (per-user)
═══════════════════════════════════════════════ */

function storageKey() {
  return "medicines_" + getCurrentUser();
}

function loadMedicines() {
  return JSON.parse(localStorage.getItem(storageKey())) || [];
}

function saveMedicines() {
  localStorage.setItem(storageKey(), JSON.stringify(medicines));
}

let medicines = [];

/* ═══════════════════════════════════════════════
   DISPLAY
═══════════════════════════════════════════════ */

function display() {
  const list = document.getElementById("list");
  list.innerHTML = "";

  medicines.forEach((med, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>
        <strong>${med.name}</strong>
        <small style="opacity:0.7; margin-left:8px;">${med.date} ${med.time}${med.dose ? " · " + med.dose : ""}</small>
      </span>
      <button onclick="deleteMed(${index})">❌</button>
    `;
    list.appendChild(li);
  });
}

/* ═══════════════════════════════════════════════
   ADD MEDICINE
═══════════════════════════════════════════════ */

document.getElementById("form").addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  const dose = document.getElementById("dose").value.trim();

  medicines.push({ name, date, time, dose, notified: false });
  saveMedicines();
  display();
  e.target.reset();
  showToast("Reminder added for " + name + " ✅");
});

/* ═══════════════════════════════════════════════
   DELETE MEDICINE
═══════════════════════════════════════════════ */

function deleteMed(index) {
  medicines.splice(index, 1);
  saveMedicines();
  display();
}

/* ═══════════════════════════════════════════════
   ALARM SOUND (Web Audio API)
═══════════════════════════════════════════════ */

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playAlarmSound() {
  try {
    const ctx = getAudioContext();

    function beep(freq, startTime, duration) {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.5, ctx.currentTime + startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);
      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration + 0.05);
    }

    beep(880, 0.0, 0.3);
    beep(880, 0.4, 0.3);
    beep(1047, 0.8, 0.5);
  } catch (err) {
    // Audio not supported – fail silently
  }
}

/* ═══════════════════════════════════════════════
   ALARM MODAL
═══════════════════════════════════════════════ */

function showAlarm(med) {
  document.getElementById("alarm-title").textContent = "Time to take " + med.name + "!";
  document.getElementById("alarm-body").textContent  =
    (med.dose ? "Dose: " + med.dose + "\n" : "") +
    "Scheduled: " + med.date + " at " + med.time;
  document.getElementById("alarm-modal").style.display = "flex";
  playAlarmSound();

  if (Notification.permission === "granted") {
    new Notification("Medicine Reminder", {
      body: "Time to take " + med.name + (med.dose ? " (" + med.dose + ")" : "")
    });
  }
}

function dismissAlarm() {
  document.getElementById("alarm-modal").style.display = "none";
}

/* ═══════════════════════════════════════════════
   REMINDER TIMER
═══════════════════════════════════════════════ */

let reminderInterval = null;

function getLastResetDate() {
  return localStorage.getItem("lastResetDate") || new Date().toISOString().split("T")[0];
}

function setLastResetDate(date) {
  localStorage.setItem("lastResetDate", date);
}

function startReminderTimer() {
  if (reminderInterval) clearInterval(reminderInterval);

  reminderInterval = setInterval(() => {
    const now         = new Date();
    const currentDate = now.toISOString().split("T")[0];   // YYYY-MM-DD
    const currentTime = now.toTimeString().slice(0, 5);    // HH:MM

    // Reset notified flags at midnight each new day
    if (currentDate !== getLastResetDate()) {
      setLastResetDate(currentDate);
      medicines.forEach(med => { med.notified = false; });
      saveMedicines();
    }

    medicines.forEach(med => {
      if (med.date === currentDate && med.time === currentTime && !med.notified) {
        med.notified = true;
        saveMedicines();
        showAlarm(med);
      }
    });
  }, 1000);
}

/* ═══════════════════════════════════════════════
   TOAST HELPER
═══════════════════════════════════════════════ */

let toastTimer = null;

function showToast(msg, isError) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className   = "toast show" + (isError ? " error" : "");

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.className = "toast"; }, 3000);
}

/* ═══════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════ */

(function init() {
  if (getCurrentUser()) {
    launchApp();
  }
})();

