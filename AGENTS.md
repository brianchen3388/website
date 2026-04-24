# Agent Guide

## Project Overview

**Kurrent** is a lightweight, client-side single-page application (SPA) built with plain HTML, CSS, and vanilla JavaScript. It serves as a personal study companion website featuring a home page, contributor bios, and a client-side todo app.

- **Entry point:** `index.html`
- **Technology stack:** HTML5, CSS3, vanilla JavaScript (ES6+)
- **External dependencies:**
  - Supabase JS client v2 (`https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`)
  - Google Fonts — Inter (`https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap`)
- **Build system:** None — this is a static site
- **Package manager:** None — no `package.json`, `pyproject.toml`, or equivalent exists
- **Server requirement:** Any static file server (e.g., `npx serve`, `python -m http.server`, VS Code Live Server). Opening `index.html` directly via `file://` may cause `fetch()` CORS errors when loading page fragments.

## Project Structure

```
website/
├── index.html          # Shell page with nav, footer, and <div id="app">
├── style.css           # Global stylesheet with CSS custom properties
├── favicon.svg         # Site favicon (Indigo wave SVG)
├── js/
│   ├── router.js       # Client-side routing engine
│   ├── api.js          # Supabase API abstraction layer (auth + CRUD)
│   ├── todo.js         # Todo app logic and localStorage persistence
│   └── pomodoro.js     # Pomodoro timer logic and state management
├── pages/              # HTML fragments dynamically loaded into #app
│   ├── home.html       # Toolkit hub / landing page
│   ├── bio.html
│   ├── todo.html       # Todo list app
│   ├── pomodoro.html   # Pomodoro timer app
│   └── bio/
│       ├── auston.html
│       └── brian.html
└── README.md
```

## Routing Architecture

Routing is handled entirely in `js/router.js`:

- **History API** is used for clean URLs (`/home`, `/bio`, `/bio/auston`).
- **Hash fallback** is supported: if a hash route is detected (e.g., `/#/bio`), it is normalized and rewritten to a path route via `history.replaceState`.
- **Page loading:** `fetch(/pages/{route}.html)` injects the response text into `#app` using `innerHTML`.
- **Active nav state:** The `.active` class is toggled on `.nav-links a` elements whose `data-route` matches the current top-level route.
- **Page titles:** A hardcoded `titleMap` object in `router.js` maps routes to document titles.
- **Nested route grouping:** Routes starting with `bio/` are grouped under the `bio` nav item (e.g., `/bio/auston` highlights the Contributors link).

### Route-to-file mapping

| URL Path       | File Loaded                | Nav Active | Page Title                |
|----------------|----------------------------|------------|---------------------------|
| `/` or `/home` | `pages/home.html`          | `home`     | Kurrent                   |
| `/bio`         | `pages/bio.html`           | `bio`      | Contributors - Kurrent    |
| `/bio/auston`  | `pages/bio/auston.html`    | `bio`      | Auston He - Kurrent       |
| `/bio/brian`   | `pages/bio/brian.html`     | `bio`      | Brian Chen - Kurrent      |
| `/todo`        | `pages/todo.html`          | `todo`     | Todo App - Kurrent        |
| `/pomodoro`    | `pages/pomodoro.html`      | `pomodoro` | Pomodoro - Kurrent        |

All navigation anchors must include `data-route="{route}"` for the router to intercept clicks and handle them via `history.pushState`.

## JavaScript Modules

### `js/router.js`

- Contains the full routing engine (`getCurrentRoute`, `loadPage`, `showPage`, `updateRoute`, `handleRouteClick`).
- Delegates to `initTodoApp()` and `initPomodoro()` when entering those routes.
- Calls `cleanupPomodoro()` when leaving the pomodoro route to stop the timer interval.

### `js/todo.js`

- Contains the **Todo App** implementation (`initTodoApp`, `renderTodos`, `addTodo`, `toggleTodo`, `deleteTodo`).
- Todo data is persisted to **`localStorage`** under the key `kurrent_todos`.
- Exposes `window.toggleTodo` and `window.deleteTodo` for inline `onclick` handlers in dynamically injected HTML.

### `js/pomodoro.js`

- Contains the **Pomodoro Timer** implementation (`initPomodoro`, `startPomodoro`, `pausePomodoro`, `resetPomodoro`, `renderPomodoro`).
- Pomodoro state is kept in memory; the timer uses absolute `endTime` so it stays accurate even if the user navigates away and returns.
- Exposes `window.initPomodoro` and `window.cleanupPomodoro` for the router to call.

### `js/api.js`

- Defines an `ApiClient` class wrapping the Supabase JS client.
- Provides auth methods (`signUp`, `signIn`, `signOut`, `getUser`, `isAuthenticated`, `getToken`).
- Provides generic CRUD methods (`list`, `get`, `create`, `update`, `remove`).
- The Supabase client is created as a singleton attached to `window.__supabaseClient` to prevent redeclaration errors.
- A global `window.api` instance is exposed.
- **Note:** The todo app currently uses `localStorage`, not the Supabase backend. The API layer is pre-wired but not yet integrated into the todo feature.

## Code Style & Conventions

- **Indentation:** 4 spaces (observed in HTML, CSS, and JS).
- **CSS class naming:** Uses kebab-case (e.g., `.contributor-card`, `.todo-input-area`, `.bio-page-header`).
- **CSS variables:** Defined in `:root` under a "KURRENT DESIGN SYSTEM" banner. Colors use semantic names (`--primary`, `--text-secondary`, `--bg-card`, etc.).
- **Route normalization:** Routes are stripped of leading and trailing slashes in `normalizeRoute()`.
- **Error handling:** If `fetch()` fails or returns non-OK, a generic 404 message is rendered into `#app`.
- **Comments:** Section headers use banner-style comments (`// =====` or `/* ===== */`).
- **No linting or formatting tools** are configured; maintain visual consistency with existing files.

## Adding a New Page

1. Create a new HTML fragment under `pages/` (e.g., `pages/newpage.html`).
2. Add the route-to-title mapping in `js/router.js` inside `titleMap`.
3. Add a nav link in `index.html` with `href="/newpage"` and `data-route="newpage"`.
4. If the route is nested under an existing section (like `bio/`), ensure `setActiveNav()` logic in `router.js` groups it under the parent nav item.

## Testing

There is **no automated test suite**. Manual testing checklist:

1. Serve the project from a local static server (not `file://`).
2. Verify each nav link loads the correct page fragment without a full reload.
3. Verify browser Back/Forward buttons work correctly.
4. Verify direct URL access (e.g., refreshing `/bio/auston`) serves `index.html` and the router loads the correct fragment. *(Note: this requires server-side rewrite/fallback configuration on most static hosts.)*
5. Verify page titles update correctly per route.
6. Verify the todo app: adding, completing, deleting tasks, and persisting across reloads.

## Deployment

No deployment configuration is present in the repository. Because this is a static SPA, the only runtime requirement is that the host serves `index.html` for all unrecognized paths (so deep links like `/bio/auston` work on refresh). Suitable platforms include:

- GitHub Pages (with a `404.html` copy of `index.html` or equivalent workaround)
- Netlify / Vercel (configure SPA rewrite rules)
- Any static hosting with fallback rules

## Security Considerations

- `innerHTML` is used to inject fetched page content. Do not fetch or render untrusted / user-supplied HTML.
- Supabase project URL and anon key are embedded in plain text in `js/api.js`. This is standard for client-side Supabase usage, but Row Level Security (RLS) should be configured on the Supabase side to protect data.
- No authentication flow is currently active in the UI, but the auth API is pre-wired and ready for future use.
- No authorization or sensitive data handling is present beyond the embedded Supabase credentials.

## Contributors

- Auston He
- Brian Chen
