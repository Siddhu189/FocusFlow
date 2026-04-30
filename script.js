let taskList = document.getElementById("taskList");

window.onload = function () {
loadTasks();
loadTheme();
showDate();
showQuote();
requestNotificationPermission();
startDeadlineChecker();
};

/* ---------------- QUOTES ---------------- */

function showQuote() {

let quotes = [
"Do your duty without attachment to results. – Krishna",
"Set your heart upon your work, never on reward. – Krishna",
"There is nothing lost in honest effort. – Krishna",
"A man becomes what he believes. – Krishna",
"Control the mind and you conquer life. – Krishna",
"Rise above laziness and act with courage. – Krishna"
];

let random = Math.floor(Math.random() * quotes.length);

document.getElementById("quote").innerText =
quotes[random];
}

/* ---------------- NOTIFICATIONS ---------------- */

function requestNotificationPermission() {

if ("Notification" in window) {

if (Notification.permission !== "granted") {
Notification.requestPermission();
}

}

}

function startDeadlineChecker() {

setInterval(checkDeadlines, 30000);

}

function checkDeadlines() {

let tasks = getTasks();

let now = new Date();

let current =
now.toLocaleTimeString([], {
hour: '2-digit',
minute: '2-digit'
});

tasks.forEach(task => {

if (!task.done && task.deadline === current) {

sendAlert(task.text);

}

});

}

function sendAlert(taskName) {

/* popup notification */
if ("Notification" in window &&
Notification.permission === "granted") {

new Notification("⏰ FocusFlow Reminder", {
body: "Time for: " + taskName,
icon:
"https://cdn-icons-png.flaticon.com/512/1827/1827392.png"
});

}

/* vibration */
if ("vibrate" in navigator) {
navigator.vibrate([400, 200, 400, 200, 400]);
}

/* sound */
let audio = new Audio(
"https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg"
);

audio.play();

/* backup popup */
alert("⏰ Reminder: " + taskName);

}

/* ---------------- TASK SYSTEM ---------------- */

function addTask() {

let input = document.getElementById("taskInput");

let text = input.value.trim();

if (text === "") return;

let deadline =
prompt("Enter deadline time (Example: 07:00 PM)");

if (!deadline) return;

let tasks = getTasks();

tasks.push({
text: text,
done: false,
deadline: deadline,
completedTime: "",
status: "Pending"
});

localStorage.setItem(
"tasks",
JSON.stringify(tasks)
);

input.value = "";

loadTasks();
}

function loadTasks() {

taskList.innerHTML = "";

let tasks = getTasks();

tasks.forEach((task, index) => {

let color = "white";

if (task.status === "early") color = "lime";
if (task.status === "late") color = "red";

let li = document.createElement("li");

li.innerHTML = `
<div>
<span onclick="toggleTask(${index})"
style="cursor:pointer;color:${color}"
class="${task.done ? 'done' : ''}">
${task.text}
</span>
<br>
⏰ ${task.deadline}
<br>
✅ ${task.completedTime || "--"}
<br>
📌 ${task.status}
</div>

<button class="delete-btn"
onclick="deleteTask(${index})">X</button>
`;

taskList.appendChild(li);

});

updateCompleted();
updateProgress();
generateReport();
}

/* ---------------- COMPLETE TASK ---------------- */

function toggleTask(index) {

let tasks = getTasks();

tasks[index].done = !tasks[index].done;

if (tasks[index].done) {

let now = new Date();

let current =
now.toLocaleTimeString([], {
hour: '2-digit',
minute: '2-digit'
});

tasks[index].completedTime = current;

/* rewards */
let coins =
parseInt(localStorage.getItem("coins")) || 0;

coins += 5;

localStorage.setItem("coins", coins);

/* score */
let completed =
parseInt(localStorage.getItem("completed")) || 0;

completed += 1;

localStorage.setItem("completed", completed);

/* status */
if (
convertTime(current) <=
convertTime(tasks[index].deadline)
) {
tasks[index].status = "early";
} else {
tasks[index].status = "late";
}

} else {

tasks[index].completedTime = "";
tasks[index].status = "Pending";

}

localStorage.setItem(
"tasks",
JSON.stringify(tasks)
);

loadTasks();
}

/* ---------------- TIME ---------------- */

function convertTime(timeStr) {

let [time, mod] = timeStr.split(" ");

let [h, m] = time.split(":");

h = parseInt(h);

if (mod === "PM" && h < 12) h += 12;
if (mod === "AM" && h === 12) h = 0;

return h * 60 + parseInt(m);
}

/* ---------------- DELETE ---------------- */

function deleteTask(index) {

let tasks = getTasks();

tasks.splice(index, 1);

localStorage.setItem(
"tasks",
JSON.stringify(tasks)
);

loadTasks();
}

function clearAll() {

localStorage.removeItem("tasks");

loadTasks();
}

/* ---------------- STORAGE ---------------- */

function getTasks() {

return JSON.parse(
localStorage.getItem("tasks")
) || [];

}

/* ---------------- UI ---------------- */

function updateCompleted() {

let tasks = getTasks();

let completed =
tasks.filter(t => t.done).length;

document.getElementById("streak").innerText =
"🔥 Completed: " + completed;
}

function updateProgress() {

let tasks = getTasks();

let completed =
tasks.filter(t => t.done).length;

let percent =
tasks.length === 0
? 0
: (completed / tasks.length) * 100;

document.getElementById("progress").style.width =
percent + "%";
}

function generateReport() {

let tasks = getTasks();

let early =
tasks.filter(t => t.status === "early").length;

let late =
tasks.filter(t => t.status === "late").length;

document.getElementById("report").innerText =
`📊 Early: ${early} | 🔴 Late: ${late}`;
}

/* ---------------- THEME ---------------- */

function toggleDarkMode() {

document.body.classList.toggle("dark");

localStorage.setItem(
"theme",
document.body.classList.contains("dark")
? "dark"
: "light"
);

}

function loadTheme() {

if (
localStorage.getItem("theme") === "dark"
) {
document.body.classList.add("dark");
}

}

/* ---------------- DATE ---------------- */

function showDate() {

let today = new Date();

document.getElementById("date").innerText =
today.toDateString();
}

/* ---------------- ENTER KEY ---------------- */

document
.getElementById("taskInput")
.addEventListener("keypress", function (e) {

if (e.key === "Enter") {
addTask();
}

});