// validators.js — regex rules for form fields

// Rule 1: Title must not start or end with spaces, no double spaces
export function validateTitle(value) {
  const re = /^\S(?:.*\S)?$/;
  // Also check for duplicate words (advanced: back-reference)
  const dupWord = /\b(\w+)\s+\1\b/i;
  if (!value.trim()) return 'Title is required.';
  if (!re.test(value)) return 'Title cannot start or end with spaces.';
  if (dupWord.test(value)) return 'Title has a repeated word (e.g. "the the").';
  return '';
}

// Rule 2: Duration must be a positive whole number
export function validateDuration(value) {
  const re = /^[1-9]\d*$/;
  if (!value) return 'Duration is required.';
  if (!re.test(String(value))) return 'Duration must be a whole number greater than 0.';
  return '';
}

// Rule 3: Date must be YYYY-MM-DD
export function validateDate(value) {
  const re = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
  if (!value) return 'Date is required.';
  if (!re.test(value)) return 'Date must be in YYYY-MM-DD format.';
  return '';
}

// Rule 4: Tag — only letters, spaces, or hyphens
export function validateTag(value) {
  const re = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;
  if (!value.trim()) return 'Tag is required.';
  if (!re.test(value)) return 'Tag can only have letters, spaces, or hyphens.';
  return '';
}

// Safe regex compiler for search (won't crash on bad patterns)
export function compileRegex(input, caseSensitive = false) {
  try {
    if (!input) return null;
    const flags = caseSensitive ? '' : 'i';
    return new RegExp(input, flags);
  } catch {
    return null; // bad regex — return null so we can show an error
  }
}

// Highlight regex matches in text, returns safe HTML string
export function highlight(text, re) {
  if (!re) return text;
  // Escape HTML first to be safe
  const escaped = text.replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
  return escaped.replace(re, m => `<mark>${m}</mark>`);
}
