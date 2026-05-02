// REGISTER
function registerUser() {
  let name = document.getElementById("regName").value;
  let mobile = document.getElementById("regMobile").value;
  let email = document.getElementById("regEmail").value;
  let pass = document.getElementById("regPass").value;
  let confirm = document.getElementById("regConfirm").value;

  if (!name || !mobile || !email || !pass || !confirm) {
    showPopup("❌ Fill all fields", "error");
    return;
  }

  if (pass !== confirm) {
    showPopup("❌ Passwords do not match", "error");
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || [];

  let exists = users.find(u => u.email === email);

  if (exists) {
    showPopup("⚠️ Email already registered", "error");
    return;
  }

  users.push({ name, mobile, email, password: pass });

  localStorage.setItem("users", JSON.stringify(users));

  showPopup(" Registration Successful!", "success");

  setTimeout(() => {
    window.location.href = "login.html";
  }, 1500);
}


// LOGIN
function loginUser() {
  let email = document.getElementById("loginEmail").value;
  let pass = document.getElementById("loginPass").value;

  let users = JSON.parse(localStorage.getItem("users")) || [];

  let user = users.find(u => u.email === email && u.password === pass);

  if (user) {
    localStorage.setItem("loggedInUser", JSON.stringify(user));
    showPopup("✅ Login Successful!", "success");

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1200);
  } else {
    showPopup("❌ Invalid Credentials", "error");
  }
}


// CHECK LOGIN
function checkLogin() {
  let user = localStorage.getItem("loggedInUser");

  if (!user) {
    window.location.href = "login.html";
  } else {
    let u = JSON.parse(user);
    let nameBox = document.getElementById("usernameDisplay");
    if (nameBox) {
      nameBox.innerText = "👤 " + u.name;
    }
  }
}


// LOGOUT
function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "login.html";
}


// 🎨 POPUP FUNCTION
function showPopup(msg, type) {
  let popup = document.createElement("div");
  popup.innerText = msg;

  popup.style.position = "fixed";
  popup.style.top = "20px";
  popup.style.right = "20px";
  popup.style.padding = "12px 20px";
  popup.style.borderRadius = "10px";
  popup.style.color = "white";
  popup.style.fontWeight = "bold";
  popup.style.zIndex = "999";

  popup.style.background = type === "success" ? "#22c55e" : "#ef4444";

  document.body.appendChild(popup);

  setTimeout(() => {
    popup.remove();
  }, 2000);
}