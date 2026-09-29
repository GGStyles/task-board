'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('../server');

let server, base;
test.before(async () => {
  server = createServer();
  await new Promise((r) => server.listen(0, r));
  base = 'http://127.0.0.1:' + server.address().port;
});
test.after(() => server.close());

const call = (method, p, body) => fetch(base + p, {
  method,
  headers: { 'Content-Type': 'application/json' },
  body: body === undefined ? undefined : (typeof body === 'string' ? body : JSON.stringify(body)),
});

test('GET /api/health returns ok', async () => {
  const r = await call('GET', '/api/health');
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { status: 'ok' });
});

test('POST /api/tasks creates a task with defaults', async () => {
  const r = await call('POST', '/api/tasks', { title: '  Confirm fuel delivery ' });
  assert.equal(r.status, 201);
  const t = await r.json();
  assert.equal(t.title, 'Confirm fuel delivery');
  assert.equal(t.prio, 'med');
  assert.equal(t.done, false);
});

test('POST /api/tasks rejects invalid input', async () => {
  for (const bad of [{}, { title: '' }, { title: 'x', prio: 'urgent' }, { title: 'x', due: '12/05/2026' }]) {
    const r = await call('POST', '/api/tasks', bad);
    assert.equal(r.status, 400);
    assert.ok((await r.json()).error);
  }
  assert.equal((await call('POST', '/api/tasks', '{not json')).status, 400);
});

test('GET /api/tasks lists created tasks', async () => {
  const r = await call('GET', '/api/tasks');
  assert.equal(r.status, 200);
  assert.ok(Array.isArray(await r.json()));
});

test('PATCH /api/tasks/:id updates note and done', async () => {
  const t = await (await call('POST', '/api/tasks', { title: 'Write report' })).json();
  const r = await call('PATCH', '/api/tasks/' + t.id, { note: 'Send by Friday', done: true });
  assert.equal(r.status, 200);
  const u = await r.json();
  assert.equal(u.note, 'Send by Friday');
  assert.equal(u.done, true);
  assert.equal((await call('PATCH', '/api/tasks/' + t.id, { done: 'yes' })).status, 400);
});

test('DELETE /api/tasks/:id removes the task', async () => {
  const t = await (await call('POST', '/api/tasks', { title: 'Temp' })).json();
  assert.equal((await call('DELETE', '/api/tasks/' + t.id)).status, 204);
  assert.equal((await call('DELETE', '/api/tasks/' + t.id)).status, 404);
});

test('unknown task id returns 404', async () => {
  assert.equal((await call('PATCH', '/api/tasks/99999', { done: true })).status, 404);
});

test('serves the app at / and blocks path traversal', async () => {
  const r = await fetch(base + '/');
  assert.equal(r.status, 200);
  assert.match(await r.text(), /Task Board/);
  const bad = await fetch(base + '/..%2fserver.js');
  assert.notEqual(bad.status, 200);
});
