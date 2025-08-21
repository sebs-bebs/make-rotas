# PRD Tasklist — Make Rotas (derived from docs/playbook.md)

Source of truth: `docs/playbook.md`. Follow Global Guardrails (minimal, reversible diffs; restate goal, affected files, ≤6‑bullet plan; post manual test checklist; ask ≤2 clarifying Qs when info is missing).

## Conventions & invariants (date/time)
- 24‑hour time; Monday week start; render all dates/times in the user’s local timezone.
- Day labels: Mon..Sun; weekday index Monday=0..Sunday=6.
- Week label format: YYYY‑MM‑DD for the week start; components display local ISO‑like dates (no TZ suffix).
- System time source: local system clock (no external time services).
- Timezone capture: `Intl.DateTimeFormat().resolvedOptions().timeZone` and `timezoneOffsetMinutes`.

## Immediate Next Step [NEXT]
- [x] Initialize Vite + React app using the latest official Vite docs.
  - Create project in this repo root.
  - Verify `npm run dev` boots and shows a placeholder page.

---

## Phase 1 — Foundation
- [x] Install routing and set up basic routes
  - Add `react-router-dom` (v6+).
  - Create `src/main.jsx` with `<BrowserRouter>` and import global styles.
  - Create `src/App.jsx` with `<Outlet />` and minimal layout shell.
  - Create routes: `src/routes/Rota.jsx`, `src/routes/Staff.jsx` (return simple placeholders).
  - Add route config: `/rota` and `/staff` (default redirect to `/rota`).

- [x] Add design tokens and base styles (no ad‑hoc styles)
  - Create `src/styles/tokens.css` with CSS vars (rem-based spacing, radii, font sizes).
  - Create `src/styles/global.css` (body font, focus outlines, basic table styles, `.chip`, `.capture-only`, `[data-exporting]` rules).
  - Import both in `src/main.jsx`.

---

## Phase 2 — App Shell
- [x] App state provider and date utilities (to support WeekHeader)
  - Create `src/state/AppStateProvider.jsx` exposing `{ currentDate, selectedWeekStart, setSelectedWeekStart, currentWeekday }`.
  - Wrap app in provider at the root (in `main.jsx` or `App.jsx`).
  - Create `src/utils/dateUtils.js`: `getWeekStart(date, mondayStart=true)`, `addWeeks(date, n)`, `formatWeekLabel(weekStart)`.

- [x] Global state variables and invariants (polish)
  - [ ] currentDate: Date from system local time (source of truth for “today”).
  - [ ] mondayWeekStart: boolean (default true) for Monday-based weeks.
  - [ ] currentWeekday: 0..6 index, Monday=0, derived from `currentDate` and `mondayWeekStart`.
  - [ ] selectedWeekStart: Date at local midnight for the week start; `setSelectedWeekStart()` mutates this.
  - [ ] timeZone/offset: capture `Intl.DateTimeFormat().resolvedOptions().timeZone` (string) and/or `timezoneOffsetMinutes`.
  - [ ] Helpers (recommended): `getDateForWeekday(weekStart, weekdayIndex)`, `formatDateISOLocal(date)`, reuse `formatWeekLabel(weekStart)`.
  - [ ] Display: Rota Table headers and Shift Dialog show dates relative to `selectedWeekStart` in local timezone; enforce 24h time.

- [x] WeekHeader and Tabs
  - Create `src/components/WeekHeader.jsx` showing "Week of YYYY-MM-DD" with Prev/Next/Today, wired to provider.
  - Create `src/components/AppTabs.jsx` with tabs: Rota, Staff; mobile-friendly; use router links.
  - Render Tabs + WeekHeader above route content in `App.jsx`.

---

## Phase 3 — Rota UI (static first)
- [x] Desktop grid
  - Create `src/components/RotaGrid.jsx`: table with Staff column, Mon–Sun, rightmost Weekly Total column. Sticky header and first column.
  - Mount on `/rota` for ≥768px viewports.

- [x] Mobile view
  - Create `src/components/RotaDayTabs.jsx` (Mon–Sun, swipeable/h-scroll).
  - Create `src/components/RotaDayList.jsx` (for selected day, staff rows with right-aligned total chip).
  - Mount on `/rota` for <768px viewports.

---

## Phase 4 — Staff (local state)
- [x] Create `src/components/StaffTable.jsx`
  - Form: `staffId` (required), `fullName` (required), `role` (optional), `location` (optional).
  - Table listing entries; per-row delete with confirm.
  - Wire to `/staff` route with in-memory state and validation.

---

## Phase 5 — Shift Dialog (local state)
- [x] Create `src/components/ShiftDialog.jsx`
  - Fields: `start` HH:mm, `end` HH:mm, `remarks` ≤120 chars.
  - Validation: start < end.
  - If cell occupied, prompt "Replace existing?" with old → new summary.
  - Save/Cancel/Remove buttons; update local grid state.

---

## Phase 6 — Weekly Totals (derived)
- [x] Time utilities
  - Create `src/utils/timeUtils.js`: `parseHHmm`, `diffMinutes(start, end)`, `minutesToLabel(Hh Mm)`.
- [ ] Compute totals
  - Recompute per staff after any change; update desktop totals column and mobile chips.

---

## Phase 7 — Persistence (when requested)
- [x] Firebase init (client-side only; no custom backend)
  - Create `src/services/firebaseClient.js` with env-based init; export `{ app, auth, db }`.
  - Anonymous sign-in on boot; store `uid` in context.
  - Add `.env.example` with `VITE_FIREBASE_*` keys.

- [ ] Firestore services
  - `src/services/staffService.js`: `listStaff(uid)`, `createStaff(uid, {...})`, `deleteStaff(uid, staffId)` using `staff/{staffId}` and `ownerUid`.
  - `src/services/shiftsService.js`: `listWeekShifts(uid, weekStart)`, `upsertShift(uid, {...})`, `deleteShiftByKey(uid, {...})` with canonical key `(staffId, weekStart, weekday)`.

- [ ] Wire UI → Firestore
  - Staff page: optimistic create/delete with rollback + toasts.
  - Rota: load week shifts on `selectedWeekStart`, map to cells, recompute totals.
  - ShiftDialog: persist save/remove; refresh week; toast on success/error.

---

## Phase 8 — Import / Export
- [ ] Import Wizard (`src/components/ImportWizard.jsx`)
  - 4 steps: Type/File → Map Columns → Preview+Errors → Summary.
  - CSV (PapaParse) and Excel (SheetJS) parsers in-browser.
  - Validations: staff.csv needs `staffId`, `fullName`. shifts.csv needs `staffId`, `weekday`, `startTime`, `endTime` with start < end. Flag unknown `staffId`.
  - Option: "Skip invalid rows". Batch writes in chunks.

- [ ] Export PNG (`src/components/ExportDialog.jsx`)
  - Wrap rota in `<div className="capture-only" ref={captureRef}>`.
  - On export: set `document.body.dataset.exporting="1"`; use `html-to-image` or `html2canvas`.
  - Include week label + timestamp inside capture node.

---

## Phase 9 — Responsiveness & A11y
- [ ] Sticky header/first column (desktop) and swipeable day tabs (mobile) with large hit targets.
- [ ] Modal a11y: `role="dialog"`, `aria-labelledby`, focus trap, Esc handling with confirm on unsaved changes.
- [ ] Keyboard nav: arrow keys move cell focus (desktop), Enter opens edit, Esc cancels.

---

## Phase 10 — Debug & Unhappy Paths
- [ ] DebugPanel (dev-only): generate 200 staff, fill demo week, clear week, toggle fake slow network, simulate write error; console guidance.
- [ ] Unhappy paths: virtualization for large lists (react-window), CSV chunking/dry-run, export-only capture, 24h time/Monday week start, memoized totals per week.

---

## Acceptance Checklist (quick run)
- [ ] Add/edit/remove shifts → replace prompt when expected → totals recalc.
- [ ] Import → mapping → preview errors → skip or import → data persists.
- [ ] Export → PNG shows rota only, with week label + timestamp.
- [ ] Responsive → desktop grid + mobile day tabs usable.
- [ ] A11y → visible focus outlines; modal behaves; screen reader cues.
- [ ] Local time + Monday week start + 24h time consistently applied across Rota Table and Shift Dialog.
- [ ] Unhappy paths → virtualization OK; big imports don’t freeze UI; export excludes chrome.
