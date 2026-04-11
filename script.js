let form = document.getElementById("form");
let list = document.getElementById("list");

let medicines = JSON.parse(localStorage.getItem("medicines")) || [];

// 🔔 Notification Permission
if (Notification.permission !== "granted") {
  Notification.requestPermission();
}

// 📋 Display Medicines
function display() {
  list.innerHTML = "";

  medicines.forEach((med, index) => {
    let li = document.createElement("li");

    li.innerHTML = `
      ${med.name} (${med.date} ${med.time})
      <button onclick="deleteMed(${index})">❌</button>
    `;

    list.appendChild(li);
  });
}

// ➕ Add Medicine
form.addEventListener("submit", (e) => {
  e.preventDefault();

  let name = document.getElementById("name").value;
  let date = document.getElementById("date").value;
  let time = document.getElementById("time").value;
  let dose = document.getElementById("dose").value;

  medicines.push({
    name: name,
    date: date,
    time: time,
    dose: dose,
    notified: false
  });

  localStorage.setItem("medicines", JSON.stringify(medicines));

  display();
  form.reset();
});

// ❌ Delete Medicine
function deleteMed(index) {
  medicines.splice(index, 1);
  localStorage.setItem("medicines", JSON.stringify(medicines));
  display();
}

// ⏰ Alarm System (Date + Time)
setInterval(() => {
  let now = new Date();

  let currentDate = now.toISOString().split("T")[0]; // YYYY-MM-DD
  let currentTime = now.toTimeString().slice(0, 5); // HH:MM

  medicines.forEach((med) => {

    if (
      med.date === currentDate &&
      med.time === currentTime &&
      !med.notified
    ) {

      // 🔥 Alert Popup
      alert(`⏰ Time to take ${med.name} (${med.dose})`);

      // 🔔 Browser Notification
      if (Notification.permission === "granted") {
        new Notification("Medicine Reminder", {
          body: `Take ${med.name} (${med.dose})`
        });
      }

      med.notified = true;
    }

  });

  localStorage.setItem("medicines", JSON.stringify(medicines));

}, 1000); 
setInterval(() => {
  medicines.forEach((med) => {
    med.notified = false;
  });

  localStorage.setItem("medicines", JSON.stringify(medicines));
}, 24 * 60 * 60 * 1000);

// 🚀 Initial Load
display();
