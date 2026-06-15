

import { loadTasks, saveTasks, loadSettings, saveSettings } from './storage.js';
import { validateTitle, validateDuration, validateDate, validateTag, compileRegex, highlight } from './validators.js';

// ── State ─────────────────────────────────────────────────────────
let tasks = loadTasks();
let settings = loadSettings();
let sortField = 'dueDate';
let sortAsc = true;
let editingId = null;

// Default settings
if (!settings.unit)      settings.unit = 'minutes';
if (!settings.weeklyCap) settings.weeklyCap = 0;

// ── Navigation ────────────────────────────────────────────────────
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.section;
    // Hide all sections
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    // Show selected
    document.getElementById(target).classList.add('active');
    btn.classList.add('active');

    // Refresh views when switching to them
    if (target === 'records') renderTable();
    if (target === 'dashboard') renderDashboard();
    if (target === 'settings') loadSettingsUI();
    if (target === 'add-form' && !editingId) resetForm();
  });
});

// ── Form Logic ────────────────────────────────────────────────────
document.getElementById('save-btn').addEventListener('click', saveTask);
document.getElementById('cancel-btn').addEventListener('click', () => {
  editingId = null;
  resetForm();
  switchTo('records');
});

function saveTask() {
  const title    = document.getElementById('f-title').value.trim();
  const dueDate  = document.getElementById('f-due').value;
  const duration = document.getElementById('f-duration').value;
  const tag      = document.getElementById('f-tag').value.trim();

  // Validate all fields
  const errors = {
    title:    validateTitle(title),
    due:      validateDate(dueDate),
    duration: validateDuration(duration),
    tag:      validateTag(tag),
  };

  // Show errors on the page
  document.getElementById('err-title').textContent    = errors.title;
  document.getElementById('err-due').textContent      = errors.due;
  document.getElementById('err-duration').textContent = errors.duration;
  document.getElementById('err-tag').textContent      = errors.tag;

  // Mark invalid fields
  toggleInvalid('f-title',    !!errors.title);
  toggleInvalid('f-due',      !!errors.due);
  toggleInvalid('f-duration', !!errors.duration);
  toggleInvalid('f-tag',      !!errors.tag);

  const hasError = Object.values(errors).some(e => e !== '');
  if (hasError) return;

  const now = new Date().toISOString();

  if (editingId) {
    // Update existing task
    tasks = tasks.map(t => {
      if (t.id !== editingId) return t;
      return { ...t, title, dueDate, duration: Number(duration), tag, updatedAt: now };
    });
    showStatus('form-status', 'Task updated!', 'success');
  } else {
    // Create new task
    const newTask = {
      id:        'task_' + Date.now(),
      title,
      dueDate,
      duration:  Number(duration),
      tag,
      createdAt: now,
      updatedAt: now,
    };
    tasks.push(newTask);
    showStatus('form-status', 'Task saved!', 'success');
  }

  saveTasks(tasks);
  editingId = null;
  resetForm();
}

function toggleInvalid(id, isInvalid) {
  const el = document.getElementById(id);
  if (isInvalid) el.classList.add('invalid');
  else el.classList.remove('invalid');
}

function resetForm() {
  document.getElementById('f-title').value    = '';
  document.getElementById('f-due').value      = '';
  document.getElementById('f-duration').value = '';
  document.getElementById('f-tag').value      = '';
  document.getElementById('edit-id').value    = '';
  document.getElementById('form-title').textContent = 'Add New Task';
  ['err-title','err-due','err-duration','err-tag'].forEach(id => {
    document.getElementById(id).textContent = '';
  });
  ['f-title','f-due','f-duration','f-tag'].forEach(id => {
    document.getElementById(id).classList.remove('invalid');
  });
  clearStatus('form-status');
}

// ── Table Rendering ───────────────────────────────────────────────
document.querySelectorAll('.sort-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const field = btn.dataset.sort;
    if (sortField === field) sortAsc = !sortAsc; // toggle direction
    else { sortField = field; sortAsc = true; }
    document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active-sort'));
    btn.classList.add('active-sort');
    renderTable();
  });
});

// Search
document.getElementById('search-input').addEventListener('input', renderTable);
document.getElementById('case-toggle').addEventListener('change', renderTable);

function renderTable() {
  const searchVal    = document.getElementById('search-input').value;
  const caseSensitive = document.getElementById('case-toggle').checked;
  const searchErrEl  = document.getElementById('search-error');
  const re           = compileRegex(searchVal, caseSensitive);

  // Show error if regex is invalid
  if (searchVal && !re) {
    searchErrEl.textContent = 'Invalid regex pattern.';
  } else {
    searchErrEl.textContent = '';
  }

  // Filter
  let list = [...tasks];
  if (re) {
    list = list.filter(t => re.test(t.title) || re.test(t.tag));
  }

  // Sort
  list.sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    if (sortField === 'duration') { valA = Number(valA); valB = Number(valB); }
    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const tbody  = document.getElementById('records-body');
  const emptyEl = document.getElementById('empty-msg');
  tbody.innerHTML = '';

  if (list.length === 0) {
    emptyEl.style.display = 'block';
    return;
  }
  emptyEl.style.display = 'none';

  list.forEach(task => {
    const tr = document.createElement('tr');
    const titleHtml = re ? highlight(task.title, re) : escapeHtml(task.title);
    const tagHtml   = re ? highlight(task.tag, re)   : escapeHtml(task.tag);

    const displayDuration = settings.unit === 'hours'
      ? (task.duration / 60).toFixed(1) + 'h'
      : task.duration + ' min';

    tr.innerHTML = `
      <td>${titleHtml}</td>
      <td>${task.dueDate}</td>
      <td>${displayDuration}</td>
      <td>${tagHtml}</td>
      <td>
        <button class="edit-btn" data-id="${task.id}" aria-label="Edit ${task.title}">Edit</button>
        <button class="delete-btn" data-id="${task.id}" aria-label="Delete ${task.title}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Attach edit/delete events
  tbody.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => startEdit(btn.dataset.id));
  });
  tbody.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteTask(btn.dataset.id));
  });
}

function startEdit(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  editingId = id;
  document.getElementById('f-title').value    = task.title;
  document.getElementById('f-due').value      = task.dueDate;
  document.getElementById('f-duration').value = task.duration;
  document.getElementById('f-tag').value      = task.tag;
  document.getElementById('edit-id').value    = id;
  document.getElementById('form-title').textContent = 'Edit Task';
  switchTo('add-form');
}

function deleteTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  if (!confirm(`Delete "${task.title}"?`)) return;
  tasks = tasks.filter(t => t.id !== id);
  saveTasks(tasks);
  renderTable();
  renderDashboard();
}

// ── Dashboard ─────────────────────────────────────────────────────
function renderDashboard() {
  const total = tasks.length;
  const totalMin = tasks.reduce((sum, t) => sum + t.duration, 0);
  const cap = Number(settings.weeklyCap) || 0;

  // Top tag
  const tagCount = {};
  tasks.forEach(t => { tagCount[t.tag] = (tagCount[t.tag] || 0) + 1; });
  const topTag = Object.keys(tagCount).sort((a,b) => tagCount[b] - tagCount[a])[0] || '—';

  // Last 7 days count
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const weekCount = tasks.filter(t => new Date(t.dueDate) >= sevenDaysAgo).length;

  document.getElementById('total-tasks').textContent = total;
  document.getElementById('total-duration').textContent =
    settings.unit === 'hours' ? (totalMin / 60).toFixed(1) + 'h' : totalMin + 'm';
  document.getElementById('top-tag').textContent = topTag;
  document.getElementById('week-count').textContent = weekCount;

  // Cap bar
  const capFill  = document.getElementById('cap-fill');
  const capLabel = document.getElementById('cap-label');
  const capMsg   = document.getElementById('cap-msg');

  if (cap > 0) {
    const pct = Math.min((totalMin / cap) * 100, 100);
    capFill.style.width = pct + '%';
    capLabel.textContent = `${totalMin} / ${cap} min`;
    if (totalMin > cap) {
      capFill.classList.add('over');
      capMsg.classList.add('over');
      capMsg.textContent = `Over target by ${totalMin - cap} min!`;
      capMsg.setAttribute('aria-live', 'assertive');
    } else {
      capFill.classList.remove('over');
      capMsg.classList.remove('over');
      capMsg.textContent = `${cap - totalMin} min remaining.`;
      capMsg.setAttribute('aria-live', 'polite');
    }
  } else {
    capFill.style.width = '0%';
    capLabel.textContent = 'Set a target in Settings';
    capMsg.textContent = '';
  }

  // Bar chart: tasks per day for last 7 days
  renderBarChart();
}

function renderBarChart() {
  const chartEl = document.getElementById('bar-chart');
  chartEl.innerHTML = '';
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  const maxCount = Math.max(...days.map(day =>
    tasks.filter(t => t.dueDate === day).length
  ), 1);

  days.forEach(day => {
    const count = tasks.filter(t => t.dueDate === day).length;
    const pct = (count / maxCount) * 80; // max 80px height
    const label = day.slice(5); // MM-DD
    const item = document.createElement('div');
    item.className = 'bar-item';
    item.innerHTML = `
      <span class="bar-value">${count}</span>
      <div class="bar-fill" style="height:${pct}px"></div>
      <span class="bar-label">${label}</span>
    `;
    chartEl.appendChild(item);
  });
}

// ── Settings ──────────────────────────────────────────────────────
function loadSettingsUI() {
  document.getElementById('unit-select').value = settings.unit || 'minutes';
  document.getElementById('weekly-cap').value  = settings.weeklyCap || '';
}

document.getElementById('save-settings').addEventListener('click', () => {
  settings.unit      = document.getElementById('unit-select').value;
  settings.weeklyCap = Number(document.getElementById('weekly-cap').value) || 0;
  saveSettings(settings);
  showStatus('settings-msg', 'Settings saved!', 'success');
});

// ── Import / Export ───────────────────────────────────────────────
document.getElementById('export-btn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = 'campus-tasks.json';
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('import-file').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const imported = JSON.parse(ev.target.result);
      // Basic validation: must be an array with required fields
      if (!Array.isArray(imported)) throw new Error('Not an array');
      const valid = imported.every(t =>
        t.id && t.title && t.dueDate && t.duration !== undefined && t.tag
      );
      if (!valid) throw new Error('Missing fields');
      tasks = imported;
      saveTasks(tasks);
      renderTable();
      renderDashboard();
      alert(`Imported ${tasks.length} tasks successfully!`);
    } catch (err) {
      alert('Import failed: ' + err.message + '. Please check the JSON file.');
    }
  };
  reader.readAsText(file);
  e.target.value = ''; // reset so same file can be imported again
});

// ── Helpers ───────────────────────────────────────────────────────
function switchTo(sectionId) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');
  document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');
}

function showStatus(id, msg, type) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.className = 'form-status ' + type;
  setTimeout(() => { el.textContent = ''; el.className = 'form-status'; }, 3000);
}

function clearStatus(id) {
  const el = document.getElementById(id);
  el.textContent = '';
  el.className = 'form-status';
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

// ── Initial render ────────────────────────────────────────────────
renderDashboard();
renderTable();
