# 📅 Campus Life Planner

**Theme:** Campus Life Planner (Theme 2)  
**Live URL:** https://yourusername.github.io/campus-life-planner/

---

## What it does

A simple app for students to track tasks and study time. You can add tasks with a title, due date, duration, and tag. The dashboard shows your stats and weekly progress.

---

## Features

- Add, edit, and delete tasks
- Sort by date, title, or duration
- Live regex search with match highlighting
- Stats dashboard with a weekly bar chart
- Duration target / cap with ARIA live messages
- Import and export data as JSON
- All data saved to localStorage (stays after page refresh)
- Minutes ↔ hours unit conversion in Settings
- Fully keyboard navigable
- Mobile-first responsive design (360px / 768px / 1024px)

---

## Regex Catalog

| Pattern | Purpose | Example |
|---|---|---|
| `/^\S(?:.*\S)?$/` | Title has no leading/trailing spaces | `" exam"` → error |
| `/^[1-9]\d*$/` | Duration is a positive whole number | `"0"` → error |
| `/^\d{4}-(0[1-9]\|1[0-2])-(0[1-9]\|[12]\d\|3[01])$/` | Date is YYYY-MM-DD | `"2025-13-01"` → error |
| `/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/` | Tag: letters, spaces, hyphens only | `"Week1"` → error |
| `/\b(\w+)\s+\1\b/i` | **Advanced:** catches duplicate words | `"the the"` → error |

---

## Keyboard Map

| Key | Action |
|---|---|
| Tab | Move between buttons and inputs |
| Enter / Space | Activate buttons |
| Arrow keys | Move between radio/select options |

All interactive elements have visible focus outlines.

---

## Accessibility Notes

- Semantic landmarks: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`
- All form inputs have `<label>` elements
- Skip-to-content link at top of page
- ARIA live regions: cap status messages, form status, search errors
- Color contrast meets WCAG AA
- Reduced motion respected via `@media (prefers-reduced-motion)`

---

## How to Run Tests

Open `tests.html` in your browser (via a local server or GitHub Pages):

```
http://localhost:5500/tests.html
```

Or with VS Code Live Server: right-click `tests.html` → Open with Live Server.

---

## File Structure

```
campus-life-planner/
├── index.html
├── tests.html
├── seed.json
├── README.md
├── styles/
│   └── main.css
└── scripts/
    ├── app.js         ← main controller
    ├── storage.js     ← localStorage helpers
    └── validators.js  ← regex rules + search helpers
```

---

## How to Load Seed Data

1. Open the app
2. Go to **Tasks** tab
3. Click **Import JSON**
4. Select `seed.json`

---

## Demo Video

[Watch demo](#) ← replace with your unlisted YouTube link
