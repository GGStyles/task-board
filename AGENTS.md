# AGENTS.md

Instructions for AI coding agents working in this repository. Follow them in order of priority: Safety, Testing, Code style, Workflow.

## Project overview
- Task Board: a to-do app with notes, priorities, due dates, search and filters.
- Frontend: a single file, `public/index.html` (vanilla HTML, CSS, JS, no build step).
- Backend: `server.js`, a dependency-free Node.js (>=20) HTTP server. It serves `public/` and exposes a JSON API with in-memory storage.
- Tests: `test/api.test.js`, using the built-in `node:test` runner.

## Commands
- Install: none needed (no dependencies).
- Run locally: `npm start` (listens on `$PORT`, default 3000).
- Test: `npm test`

## API contract
| Method | Path | Success | Errors |
|---|---|---|---|
| GET | `/api/health` | 200 `{status:"ok"}` | none |
| GET | `/api/tasks` | 200 array | none |
| POST | `/api/tasks` | 201 task | 400 invalid body |
| PATCH | `/api/tasks/:id` | 200 task | 400 invalid body, 404 unknown id |
| DELETE | `/api/tasks/:id` | 204 | 404 unknown id |

Task shape: `{ id:number, title:string(1-200), prio:"low"|"med"|"high", due:""|"YYYY-MM-DD", note:string(<=5000), done:boolean }`

## Testing and validation rules (mandatory)
1. Run `npm test` before proposing any change. Do not claim a change works unless tests pass.
2. Every new or changed API endpoint needs tests in `test/api.test.js` covering: the success case, each validation failure (400), and the missing-resource case (404) where relevant.
3. Never weaken, skip or delete a test to make it pass. If a test is wrong, explain why and fix it in a separate, clearly described change.
4. Validate all request input on the server: types, lengths, enums and date format. Return JSON `{error: "<message>"}` with the correct status code.
5. Bug fixes start with a failing test that reproduces the bug.
6. After UI changes, check manually or with a script: add task, complete, delete, add note, reload and confirm persistence, filter and search, keyboard-only use, narrow (mobile) width, dark mode.
7. Keep tests deterministic: no fixed ports (use port 0), no network calls to outside hosts, no reliance on test order.

## Code style
- Vanilla JS only in `public/index.html`. No frameworks or CDN scripts unless the maintainer asks.
- Escape all user text before inserting it into HTML (`esc()` helper). Never use `innerHTML` with unescaped input.
- Wrap `localStorage` reads and writes in `try/catch`.
- Keep colors as CSS variables and support both light and dark themes.
- Keep accessibility intact: labels on inputs and buttons, visible focus, semantic controls.
- Prefer small, focused functions. Do not add dependencies without asking.

## Safety rules
- Never commit secrets, tokens or `.env` files.
- Do not add analytics, tracking or outbound network requests.
- Do not read files outside this repository or change its structure without a stated reason.
- Keep static file serving restricted to `public/` (path traversal is tested; keep that test).

## Workflow
1. Read this file and the relevant code before editing.
2. Make the smallest change that solves the task.
3. Run `npm test`. Report the result honestly, including failures.
4. Summarize what changed, which files were touched, and anything left unverified.
5. Use short imperative commit messages, for example `Add due-date validation to POST /api/tasks`.

## Deployment
- Hosts that run Node (Render, Railway, Fly.io): build command none, start command `npm start`, health check path `/api/health`.
- Data is in memory and resets on restart. Adding a database is a separate, explicit task.
