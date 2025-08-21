
# Make Rotas — Front‑End Playbook (Vite + React + Firebase)

> Commands shown are examples. Always follow the **latest official docs** linked below.

## Quick links — check these first
- **Vite Getting Started**: https://vite.dev/guide/
- **Vite Env Vars** (`VITE_`, `import.meta.env`): https://vite.dev/guide/env-and-mode
- **Firebase Web Setup (modular SDK)**: https://firebase.google.com/docs/web/setup
- **Firebase Anonymous Auth (Web)**: https://firebase.google.com/docs/auth/web/anonymous-auth
- **Firestore Security Rules (basics)**: https://firebase.google.com/docs/firestore/security/get-started
- **Firestore Rules Syntax/Conditions**: https://firebase.google.com/docs/firestore/security/rules-structure
- **Firestore Quotas/Limits**: https://firebase.google.com/docs/firestore/quotas
- **PapaParse (CSV)**: https://www.papaparse.com/docs
- **SheetJS / xlsx (Excel)**: https://docs.sheetjs.com/
- **react-window (virtualization)**: https://react-window.vercel.app/
- **html-to-image**: https://www.npmjs.com/package/html-to-image
- **html2canvas**: https://html2canvas.hertzen.com/

---

## 0) Global guardrails (prepend to every Windsurf task)
```text
You are a precise, surgical code editor.
Before coding: restate my goal, list affected files, and outline your plan in ≤6 bullets.
When coding: only change the files you name; keep edits minimal and reversible.
Do not remove existing features unless I ask.
After coding: give a short manual test checklist.

If info is missing, ask up to 2 clarifying questions max, then proceed with sensible defaults.
```

---

## 1) Project scaffold (Vite + React)
Use Vite’s Getting Started page for the latest create command. Example:
```bash
npm create vite@latest make-rotas -- --template react
cd make-rotas
npm install
npm run dev
```
Suggested file tree:
```
src/
  main.jsx
  App.jsx
  routes/
    Rota.jsx
    Staff.jsx
  components/
    AppTabs.jsx
    WeekHeader.jsx
    RotaGrid.jsx          # desktop
    RotaDayTabs.jsx       # mobile tabs
    RotaDayList.jsx       # mobile list
    ShiftDialog.jsx
    StaffTable.jsx
    ImportWizard.jsx
    ExportDialog.jsx
    DebugPanel.jsx        # dev-only
  state/
    AppStateProvider.jsx
  utils/
    dateUtils.js
    timeUtils.js
  services/
    firebaseClient.js
    staffService.js
    shiftsService.js
```

**Prompt — “Scaffold Vite + React”**
```
Goal: Create a Vite + React app with a clean src/ structure that matches our Step 3 design.

Deliver:
- Commands to scaffold (from Vite docs, not hardcoded).
- File tree above with component placeholders.
- Minimal CSS with rem-based spacing.

DoD:
- `npm run dev` boots.
- Routes render placeholder UIs for Rota and Staff.
```

---

## 2) Design tokens & base styles
**Prompt — “Add base styles/tokens”**
```
Goal: Add minimal, consistent styles with rem spacing and accessible defaults.

Deliver:
- src/styles/tokens.css: root CSS vars (0.25rem spacing steps, radii, font sizes in rem).
- src/styles/global.css: body fonts, focus outlines, minimal table styles, a .chip class,
  a `.capture-only` container, and [data-exporting] rules to hide UI chrome during export.
- Wire styles in main.jsx.

DoD:
- Default pages pick up tokens.
- Visible focus outline on all interactive elements.
```

---

## 3) App shell: tabs + week header
**Prompt — “Implement AppTabs + WeekHeader and wire routes”**
```
Goal: Tabbed navigation (Rota/Staff) plus week header (Prev/Next/Today).

Deliver:
- components/AppTabs.jsx: [Rota] [Staff] tabs; mobile-friendly.
- components/WeekHeader.jsx: "Week of YYYY-MM-DD", Prev/Next, Today.
- Update App.jsx/layout to render tabs + header above route content.

DoD:
- Switching tabs keeps app state intact.
- Buttons are keyboard accessible.
```

---

## 4) App state & date utilities
**Prompt — “AppStateProvider + date utils”**
```
Goal: Provide currentDate, selectedWeekStart, currentWeekday; helpers to move weeks.

Deliver:
- state/AppStateProvider.jsx: context { currentDate, selectedWeekStart, setSelectedWeekStart, currentWeekday }.
- utils/dateUtils.js: getWeekStart(date, mondayStart=true), addWeeks(date, n), formatWeekLabel(weekStart).
- Wire Provider at root.

DoD:
- WeekHeader buttons update selectedWeekStart and label.
- “Today” aligns to the correct week.
```

---

## 5) Weekly Rota UI (static first)
**Prompt — “Build static RotaGrid (desktop) + RotaDayTabs/List (mobile)”**
```
Goal: Render weekly rota surfaces without data wiring.

Deliver:
- RotaGrid.jsx: table with Staff column, Mon–Sun, rightmost "Weekly Total".
- RotaDayTabs.jsx: swipeable day tabs (Mon–Sun).
- RotaDayList.jsx: for selected day, list staff rows with right-aligned chip [Hh Mm weekly total].
- Sticky header (desktop), sticky first column; rem spacing.

DoD:
- Desktop ≥768px: 7-column grid + totals column.
- Mobile <768px: day tabs and list.
```

---

## 6) Staff List (basic CRUD UI, local state)
**Prompt — “StaffTable with add/remove (local state)”**
```
Goal: Implement Staff page with local state (before Firebase).

Deliver:
- StaffTable.jsx: form (staffId, fullName required; role, location optional); table listing; delete per row (confirm).

DoD:
- Add/remove rows in-memory; required field validation.
- Styles match tokens.
```

---

## 7) Shift Dialog (local state) + one‑shift‑per‑day rule
**Prompt — “ShiftDialog with validation and replace prompt (local)”**
```
Goal: Cell editing UX using local state to simulate behavior.

Deliver:
- ShiftDialog.jsx: Start(HH:mm), End(HH:mm), Remarks(≤120 chars), Save/Cancel/Remove.
- Validation: start < end.
- If saving into a cell that already has a shift, show “Replace existing?” with old→new summary.

DoD:
- Editing updates the view; remove clears the cell.
- Replace prompt appears when applicable.
```

---

## 8) Weekly totals (derived)
**Prompt — “Compute weekly totals client-side”**
```
Goal: Derive weeklyMinutesByStaff from current grid data.

Deliver:
- utils/timeUtils.js: parseHHmm, diffMinutes(start, end), minutesToLabel(Hh Mm).
- In Rota components, recompute totals after any change; desktop totals column & mobile chips update.

DoD:
- Manual spot-checks match expected sums.
```

---

## 9) Firebase init (Auth + Firestore)
Use Firebase Web docs for latest install/init. Keep env vars prefixed with `VITE_` and read via `import.meta.env`.

**Prompt — “Initialize Firebase client & anonymous auth”**
```
Goal: Set up Firebase app with env vars and sign in anonymously on boot.

Deliver:
- services/firebaseClient.js: init with env vars; export { app, auth, db }.
- Sign-in logic in a hook/provider; store uid in context.
- .env.example with Vite-style env names (VITE_FIREBASE_*).

DoD:
- App signs in silently and exposes uid.
```

---

## 10) Firestore services (match contracts)
**Prompt — “Implement staffService and shiftsService”**
```
Goal: CRUD wrappers that map to our Step 3 contracts.

Deliver:
- services/staffService.js:
  listStaff(uid), createStaff(uid, {staffId, fullName, role, location}), deleteStaff(uid, staffId)
- services/shiftsService.js:
  listWeekShifts(uid, weekStart),
  upsertShift(uid, {staffId, weekStart, weekday, startTime, endTime, remarks}),
  deleteShiftByKey(uid, {staffId, weekStart, weekday})

Use collections: staff/{staffId}, shifts/{autoId}.
Include ownerUid on creates.
When upserting, first query doc by (staffId, weekStart, weekday). If found, replace.

DoD:
- Functions return sensible values or throw Errors.
```

---

## 11) Wire Staff → Firestore
**Prompt — “Connect StaffTable to staffService”**
```
Goal: Replace local state with Firestore for the Staff page.

Deliver:
- Read list on mount; render rows.
- On create: optimistic add → rollback on error with toast.
- On delete: confirm → optimistic removal → rollback on error.

DoD:
- Staff create/delete persist and refresh without page reload.
```

---

## 12) Wire Rota → Firestore + totals
**Prompt — “Connect rota data to Firestore”**
```
Goal: Load week shifts and compute totals.

Deliver:
- On selectedWeekStart, call listWeekShifts(uid, weekStart).
- Map results to cells; compute weeklyMinutesByStaff; render totals.
- Loading/empty states and toasts on errors.

DoD:
- Week navigation refetches and re-renders correctly.
```

---

## 13) Shift Dialog → Firestore
**Prompt — “Persist ShiftDialog actions through shiftsService”**
```
Goal: Replace local edits with Firestore operations.

Deliver:
- On Save: call upsertShift(); if replacing, show confirm first.
- On Remove: call deleteShiftByKey().
- Refresh week data and totals; toast "Saved".

DoD:
- Edits persist; totals update on success.
```

---

## 14) Import Wizard (CSV/Excel)
Use PapaParse / SheetJS docs for the latest APIs.

**Prompt — “ImportWizard: upload → map → preview → import summary”**
```
Goal: Import staff.csv and shifts.csv with validations.

Deliver:
- ImportWizard.jsx: 4 steps (Type/File → Map Columns → Preview+Errors → Summary).
- Parser in browser. Validations:
  staff.csv requires staffId, fullName.
  shifts.csv requires staffId, weekday (Mon..Sun), startTime(HH:mm), endTime(HH:mm); start < end.
  Unknown staffId flagged when importing shifts.
- "Skip invalid rows" option.
- Batch writes in chunks to respect Firestore quotas/limits.
- After import: refresh views and totals.

DoD:
- Summary shows Imported N / Skipped M.
```

---

## 15) Export PNG (capture only the rota)
**Prompt — “ExportDialog: capture only the rota container”**
```
Goal: Export current rota view as PNG without unwanted UI.

Deliver:
- Wrap rota content in <div className="capture-only" ref={captureRef}>.
- On export: set document.body.dataset.exporting="1"; CSS hides non-essential UI during capture.
- Use html-to-image or html2canvas; include week label and timestamp inside the capture node.

DoD:
- PNG shows just the rota; crisp text (scale by devicePixelRatio).
```

---

## 16) Responsive & accessibility polish
**Prompt — “Polish responsiveness and a11y”**
```
Goal: Day tabs usable by swipe; sticky headers; accessible modals and controls.

Deliver:
- Sticky header row and first column on desktop.
- Horizontal scroll/swipe for day tabs on mobile; large hit targets.
- Modal: role="dialog", aria-labelledby, focus trap, Esc closes with confirm if unsaved.
- Keyboard nav: arrows move cell focus (desktop), Enter opens edit, Esc cancels.

DoD:
- Quick a11y pass; visible focus outlines; screen reader labels.
```

---

## 17) Debug Panel (dev‑only) & scenarios
**Prompt — “Add DebugPanel and scenarios”**
```
Goal: Simulate heavy data and failures.

Deliver:
- DebugPanel.jsx (dev-only): create 200 staff, fill demo week, clear week, toggle fake slow network,
  simulate Firestore write error.
- Console warnings for each scenario and how to recover.

DoD:
- I can trigger each scenario and see the app respond.
```

---

## 18) Unhappy paths (what can go wrong + mitigations)
- **Too many staff (slow/jank)** → Virtualize rows (react-window), paginate Staff table, add "jump to staff" search.
- **Export includes UI chrome** → Capture only `.capture-only`; hide tabs/menus during capture via `[data-exporting]` CSS; scale by devicePixelRatio.
- **Large/messy CSVs** → Chunk parse/writes; preview errors; “Skip invalid rows”; dry‑run option; block or auto-create missing staffIds (toggle).
- **Time & locale pitfalls** → Force 24‑hour; Monday week start; unit tests for date utils.
- **Second‑shift collision** → Canonical key (staffId|weekStart|weekday); explicit “Replace existing?” confirm.
- **Accessibility gaps** → Focus trap, aria labels, keyboard nav.
- **Anonymous auth quirks** → Persist session; show uid; banner on permission error; JSON backup/export.
- **Safari/Firefox export quirks** → Avoid fixed-position in capture node; fallback renderer; document known issues.
- **Totals performance** → Memoize by week; update only affected staffId on single edit.

---

## Acceptance checklist (quick run)
- Add/edit/remove shifts → replace prompt when expected → totals recalc.
- Import → mapping → preview errors → skip or import → data persists.
- Export → PNG shows rota only, with week label + timestamp.
- Responsive → desktop grid + mobile day tabs usable.
- A11y → focus outlines visible; modal behaves; screen reader cues.
- Unhappy paths → virtualization OK; big imports don’t freeze UI; export excludes chrome.
