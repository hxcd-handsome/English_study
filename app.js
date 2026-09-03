const initialTasks = [
  { id: 1, text: "英语学习：完成 1 个单元词汇与阅读练习", done: false },
  { id: 2, text: "基础巩固：复习数据库核心概念并完成 3 道练习题", done: false },
  { id: 3, text: "考研准备：制定本周复习计划，推进今日重点科目", done: false },
  { id: 4, text: "网页部署：检查页面配置并完成线上发布", done: false },
];

const storageKey = "warm-todo-list-v2";
let tasks = JSON.parse(localStorage.getItem(storageKey) || "null") || initialTasks;
let activeFilter = "all";

const $ = (selector) => document.querySelector(selector);
const list = $("#task-list");
const emptyState = $("#empty-state");
const template = $("#task-template");
const form = $("#add-form");
const input = $("#new-task");

function save() { localStorage.setItem(storageKey, JSON.stringify(tasks)); }

function render() {
  const visible = tasks.filter((task) => activeFilter === "all" || (activeFilter === "done" ? task.done : !task.done));
  list.innerHTML = "";
  visible.forEach((task) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.dataset.id = task.id;
    node.classList.toggle("done", task.done);
    const checkbox = node.querySelector(".task-toggle");
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label", `标记“${task.text}”${task.done ? "为待完成" : "为已完成"}`);
    node.querySelector(".task-label").textContent = task.text;
    list.append(node);
  });
  emptyState.hidden = visible.length !== 0;
  const done = tasks.filter((task) => task.done).length;
  const remaining = tasks.length - done;
  $("#all-count").textContent = tasks.length;
  $("#active-count").textContent = remaining;
  $("#done-count").textContent = done;
  $("#progress-text").textContent = remaining ? `${remaining} 项待完成` : "全部完成，做得好！";
  $("#clear-completed").disabled = done === 0;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  tasks.unshift({ id: Date.now(), text, done: false });
  input.value = "";
  activeFilter = "all";
  document.querySelectorAll(".filter").forEach((button) => button.classList.toggle("active", button.dataset.filter === "all"));
  save(); render();
});

list.addEventListener("change", (event) => {
  if (!event.target.matches(".task-toggle")) return;
  const task = tasks.find((item) => item.id === Number(event.target.closest(".task-item").dataset.id));
  task.done = event.target.checked;
  save(); render();
});

list.addEventListener("click", (event) => {
  const button = event.target.closest(".delete-button");
  if (!button) return;
  tasks = tasks.filter((task) => task.id !== Number(button.closest(".task-item").dataset.id));
  save(); render();
});

document.querySelectorAll(".filter").forEach((button) => button.addEventListener("click", () => {
  activeFilter = button.dataset.filter;
  document.querySelectorAll(".filter").forEach((item) => item.classList.toggle("active", item === button));
  render();
}));

$("#clear-completed").addEventListener("click", () => { tasks = tasks.filter((task) => !task.done); save(); render(); });

$("#current-date").textContent = new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", weekday: "long" }).format(new Date());
render();
