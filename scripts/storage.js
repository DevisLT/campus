// storage.js — save and load data from localStorage

const KEY = 'campus:tasks';
const SETTINGS_KEY = 'campus:settings';

// Load all tasks. Returns an array.
export function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

// Save all tasks
export function saveTasks(tasks) {
  localStorage.setItem(KEY, JSON.stringify(tasks));
}

// Load settings object
export function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
  } catch {
    return {};
  }
}

// Save settings object
export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
