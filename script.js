const STORAGE_KEY = 'janani-todo-tasks-v1';
const form = document.querySelector('#task-form');
const input = document.querySelector('#task-input');
const list = document.querySelector('#task-list');
const emptyState = document.querySelector('#empty-state');
const count = document.querySelector('#task-count');
const clearButton = document.querySelector('#clear-completed');
const filterButtons = [...document.querySelectorAll('[data-filter]')];

let tasks = loadTasks();
let currentFilter = 'all';

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved.filter(task =>
      task && typeof task.text === 'string' && typeof task.completed === 'boolean'
    ) : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function render() {
  list.replaceChildren();
  const visible = tasks.filter(task =>
    currentFilter === 'all' ||
    (currentFilter === 'active' && !task.completed) ||
    (currentFilter === 'completed' && task.completed)
  );

  visible.forEach(task => {
    const item = document.createElement('li');
    item.className = task.completed ? 'completed' : '';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', `Mark ${task.text} complete`);
    checkbox.addEventListener('change', () => {
      task.completed = checkbox.checked;
      saveTasks();
      render();
    });

    const label = document.createElement('span');
    label.className = 'task-text';
    label.textContent = task.text;

    const actions = document.createElement('div');
    actions.className = 'task-actions';
    const edit = document.createElement('button');
    edit.type = 'button';
    edit.className = 'edit';
    edit.textContent = 'Edit';
    edit.addEventListener('click', () => {
      const updated = window.prompt('Edit task', task.text);
      if (updated === null) return;
      const clean = updated.trim();
      if (clean) task.text = clean.slice(0, 120);
      saveTasks();
      render();
    });

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'delete';
    remove.textContent = 'Delete';
    remove.addEventListener('click', () => {
      tasks = tasks.filter(entry => entry.id !== task.id);
      saveTasks();
      render();
    });

    actions.append(edit, remove);
    item.append(checkbox, label, actions);
    list.append(item);
  });

  const remaining = tasks.filter(task => !task.completed).length;
  count.textContent = `${remaining} task${remaining === 1 ? '' : 's'} remaining`;
  emptyState.hidden = visible.length > 0;
  clearButton.disabled = !tasks.some(task => task.completed);
  filterButtons.forEach(button => {
    const selected = button.dataset.filter === currentFilter;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  tasks.unshift({ id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), text: text.slice(0, 120), completed: false });
  input.value = '';
  saveTasks();
  render();
  input.focus();
});

filterButtons.forEach(button => button.addEventListener('click', () => {
  currentFilter = button.dataset.filter;
  render();
}));

clearButton.addEventListener('click', () => {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  render();
});

render();
