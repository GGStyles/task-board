'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');

const PUBLIC = path.join(__dirname, 'public');
const PRIOS = ['low', 'med', 'high'];
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };

function createServer() {
  let tasks = [];
  let nextId = 1;

  const send = (res, code, body) => {
    res.writeHead(code, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
  };

  const readJson = (req) => new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => { data += c; if (data.length > 1e5) req.destroy(); });
    req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch (e) { reject(e); } });
  });

  function validate(b, partial) {
    if (!partial || 'title' in b) {
      if (typeof b.title !== 'string' || !b.title.trim() || b.title.length > 200) return 'title must be 1-200 characters';
    }
    if ('prio' in b && !PRIOS.includes(b.prio)) return 'prio must be low, med or high';
    if ('due' in b && b.due !== '' && !/^\d{4}-\d{2}-\d{2}$/.test(b.due)) return 'due must be YYYY-MM-DD';
    if ('note' in b && (typeof b.note !== 'string' || b.note.length > 5000)) return 'note must be a string up to 5000 characters';
    if ('done' in b && typeof b.done !== 'boolean') return 'done must be a boolean';
    return null;
  }

  return http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const m = url.pathname.match(/^\/api\/tasks(?:\/(\d+))?$/);

    if (url.pathname === '/api/health' && req.method === 'GET') return send(res, 200, { status: 'ok' });

    if (m) {
      const id = m[1] ? Number(m[1]) : null;
      try {
        if (!id && req.method === 'GET') return send(res, 200, tasks);
        if (!id && req.method === 'POST') {
          const b = await readJson(req);
          const err = validate(b, false);
          if (err) return send(res, 400, { error: err });
          const t = { id: nextId++, title: b.title.trim(), prio: b.prio || 'med', due: b.due || '', note: b.note || '', done: false };
          tasks.unshift(t);
          return send(res, 201, t);
        }
        const t = tasks.find((x) => x.id === id);
        if (id && !t) return send(res, 404, { error: 'task not found' });
        if (id && req.method === 'PATCH') {
          const b = await readJson(req);
          const err = validate(b, true);
          if (err) return send(res, 400, { error: err });
          ['title', 'prio', 'due', 'note', 'done'].forEach((k) => { if (k in b) t[k] = k === 'title' ? b[k].trim() : b[k]; });
          return send(res, 200, t);
        }
        if (id && req.method === 'DELETE') { tasks = tasks.filter((x) => x !== t); res.writeHead(204); return res.end(); }
        return send(res, 405, { error: 'method not allowed' });
      } catch (e) {
        return send(res, 400, { error: 'invalid JSON body' });
      }
    }

    // static files
    const rel = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
    const file = path.normalize(path.join(PUBLIC, rel));
    if (!file.startsWith(PUBLIC)) return send(res, 403, { error: 'forbidden' });
    fs.readFile(file, (err, buf) => {
      if (err) return send(res, 404, { error: 'not found' });
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
      res.end(buf);
    });
  });
}

if (require.main === module) {
  const port = process.env.PORT || 3000;
  createServer().listen(port, () => console.log('Task Board on port ' + port));
}
module.exports = { createServer };
