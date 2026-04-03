let form = document.getElementById("form");
let list = document.getElementById("list");

let medicines = JSON.parse(localStorage.getItem("medicines")) || [];

function display() {
  list.innerHTML = "";
  medicines.forEach((med, index) => {
    let li = document.createElement("li");
    li.innerHTML = `
      ${med.name} (${med.time})
      <button onclick="deleteMed(${index})">❌</button>
    `;
    list.appendChild(li);
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  let name = document.getElementById("name").value;
  let time = document.getElementById("time").value;
  let dose = document.getElementById("dose").value;

  medicines.push({ name, time, dose });

  localStorage.setItem("medicines", JSON.stringify(medicines));

  display();
  form.reset();
});

function deleteMed(index) {
  medicines.splice(index, 1);
  localStorage.setItem("medicines", JSON.stringify(medicines));
  display();
}


setInterval(() => {
  let now = new Date();
  let current = now.getHours() + ":" + now.getMinutes();

  medicines.forEach((med) => {
    if (med.time === current) {
      alert("⏰ Time to take " + med.name);
    }
  });
}, 60000);

display();