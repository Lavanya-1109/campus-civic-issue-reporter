# Civic Issue Reporter — Frontend (UnivPulse)

Static HTML/CSS/Tailwind pages, plus one small React app for login/signup
(`react/`), all wired to the real Flask backend (see `backend/README.md`
in that project's zip).

## Running it

1. **Start the backend first** — see `backend/README.md`. It needs to be
   reachable at `http://localhost:5000` (or update `API_BASE` in both
   `assets/api.js` and `react/src/main.jsx` if you run it elsewhere).

2. **Serve this whole `front-end/` folder as one static site** — the
   pages fetch each other and the API by relative/absolute URL, which
   needs `http://`, not `file://`. From inside `front-end/`:

   ```bash
   python3 -m http.server 8080
   # or: npx serve .
   ```

   Then open `http://localhost:8080/react/dist/index.html` — that's the
   login page, and the one true entry point now (see "Two login
   implementations" below).

3. Sign up as a student or faculty member (administrator/super-admin
   accounts are seeded directly in the database — see
   `database/sql/seed.sql` — not self-service), and you'll land on the
   matching dashboard automatically.

## If you edit the React login app

`react/dist/` is a **built** copy of `react/src/main.jsx` — editing
`src/` alone won't change what the browser loads. Rebuild after any
change:

```bash
cd react
npm install   # first time only
npm run build
```

`vite.config.js` sets `base: './'` so the built asset paths stay
relative — don't remove that, or the login page 404s on its own JS/CSS
the moment it's served from anywhere but the domain root (this bit us
during testing: Vite's default is root-absolute paths).

## Two login implementations — only one is real

`react/` is the login/signup UI that's actually wired to the backend.
`login/login.html` and `login/sign_up.html` are the original plain-HTML
versions; they now just redirect to `react/dist/index.html` so old links
don't 404. There's no functional plain-HTML login anymore — don't add
new features to `login/*.html`, they won't run.

## Department names

The department **short codes** this frontend used to hardcode
(`electrical`, `plumbing`, `hvac`, `av-it`, `civil`) are gone. Every
department dropdown and filter now loads the real list from
`GET /api/departments` — full names, real UUIDs, and there are 6 of them
(no `hvac` or `av-it`), matching `database/sql/seed.sql` exactly.

## What changed from the original static mockup

- All four dashboards (`student_faculty`, `department_admin`,
  `super_admin`, `reports`) render real issues from the API instead of
  four hand-written `<article>` cards — see `assets/shared.js`'s
  `renderIssueCard`/`initIssuesFeed`.
- The admin "Manage Status" side panel (with a resolution-note field) is
  gone — the database has no column to save a resolution note to, so
  keeping that control would have saved nothing. Status is now an inline
  dropdown on each card, offering only the one legal next step
  (`reported → ongoing → finished`), matching what the backend actually
  enforces.
- The dev-only role switcher (`localStorage`-simulated role/department)
  is gone. Role and department now come from a real JWT issued at
  login, and every dashboard redirects to the login page if that token
  is missing, expired, or wrong-role for that page (`requireAuth` in
  `assets/api.js`).
- Notifications are a real (polled, no websockets) feature now — click
  the bell icon on any dashboard.
