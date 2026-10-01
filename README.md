# Task Board

A lightweight to-do list application with per-task notes, priorities and due dates, backed by a small dependency-free Node.js server and a tested JSON API.

**Live demo:** https://task-board-3f7e.onrender.com/

> The demo runs on a free hosting plan, so the first load after a period of inactivity can take up to a minute.

## Features

- Add, complete and delete tasks
- **Notes** on every task, saved automatically as you type
- Priority levels (High, Medium, Low) with color-coded task edges
- Due dates with overdue highlighting
- Progress bar showing overall completion
- Search across task titles and notes
- All / Active / Done filters and a one-click "Clear done"
- Light and dark themes, keyboard-friendly and responsive down to mobile widths
- Tasks persist in the browser between visits

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | Vanilla HTML, CSS and JavaScript in a single file (`public/index.html`) |
| Backend | Node.js 20+ using only the built-in `http` module |
| Tests | Node's built-in test runner (`node:test`) |
| Hosting | Render |

There are no runtime or development dependencies.

## Getting started

Requirements: Node.js 20 or newer.

```bash
git clone https://github.com/GGStyles/task-board.git
cd task-board
npm start
```

Then open http://localhost:3000. Set the `PORT` environment variable to use a different port.

## API

All endpoints exchange JSON. Data is held in memory and resets when the server restarts.

| Method | Endpoint | Description | Success | Errors |
|---|---|---|---|---|
| GET | `/api/health` | Health check | 200 | none |
| GET | `/api/tasks` | List all tasks | 200 | none |
| POST | `/api/tasks` | Create a task | 201 | 400 |
| PATCH | `/api/tasks/:id` | Update a task | 200 | 400, 404 |
| DELETE | `/api/tasks/:id` | Delete a task | 204 | 404 |

Task object:

```json
{
  "id": 1,
  "title": "Confirm fuel delivery",
  "prio": "high",
  "due": "2026-10-05",
  "note": "Call the depot before noon",
  "done": false
}
```

Validation rules: `title` is required (1 to 200 characters), `prio` must be `low`, `med` or `high`, `due` must be empty or `YYYY-MM-DD`, `note` is at most 5000 characters, and `done` must be a boolean.

Example:

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Review weekly report","prio":"high","due":"2026-10-05"}'
```

## Testing

```bash
npm test
```

The suite in `test/api.test.js` runs the server on a random port and covers the health check, task creation with defaults, input validation failures, listing, updating, deleting, unknown ids and path traversal protection.

## Project structure

```
task-board/
├── AGENTS.md          Rules and instructions for AI coding agents
├── package.json
├── server.js          Static file server and JSON API
├── public/
│   └── index.html     The application UI
└── test/
    └── api.test.js    API tests
```

## Working with AI coding agents

This project was built with AI assistance. `AGENTS.md` defines the conventions agents must follow, including mandatory testing and validation rules, code style, safety constraints and workflow. Read it before contributing with an agent.

## Deployment

The app runs on any host that supports Node.js (Render, Railway, Fly.io).

- Build command: none
- Start command: `npm start`
- Health check path: `/api/health`

## Roadmap

- Connect the interface to the API so tasks sync across devices
- Add a database for permanent storage
- Categories and recurring tasks
- Export to CSV

## License

No license has been specified yet. Add a `LICENSE` file (for example MIT) to define how others may use this code.
