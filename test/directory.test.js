const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const cds = require('@sap/cds');
let server, base;

before(async () => {
  cds.env.requires.db = { kind: 'sqlite', credentials: { url: ':memory:' } };
  cds.env.requires.auth = { kind: 'dummy' };
  server = await cds.server({ port: 0, in_memory: true });
  if (!server.listening) await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
  await cds.db?.disconnect();
});
const api = '/api/directory/Employees';
const sample = { firstName: ' Test ', lastName: 'Employee', email: 'TEST@example.com', department: 'Engineering', jobTitle: 'Developer', status: 'Active' };
async function write(path, method, data) {
  return fetch(base + path, { method, headers: { 'Content-Type': 'application/json' }, body: data ? JSON.stringify(data) : undefined });
}
test('UI and OData metadata are served', async () => {
  assert.equal((await fetch(base)).status, 200);
  assert.equal((await fetch(base + '/api/directory/$metadata')).status, 200);
});
test('employee create, read, update, filter, and delete', async () => {
  const created = await write(api, 'POST', sample);
  assert.equal(created.status, 201);
  const employee = await created.json();
  assert.equal(employee.firstName, 'Test');
  assert.equal(employee.email, 'test@example.com');
  const key = `${api}(${employee.ID})`;
  assert.equal((await fetch(base + key)).status, 200);
  assert.equal((await write(key, 'PATCH', { status: 'On Leave' })).status, 200);
  const filtered = await (await fetch(base + api + '?$filter=email%20eq%20%27test%40example.com%27')).json();
  assert.equal(filtered.value.length, 1);
  assert.equal(filtered.value[0].status, 'On Leave');
  assert.equal((await write(key, 'DELETE')).status, 204);
  assert.equal((await fetch(base + key)).status, 404);
});
test('invalid email, blank name, missing required field and invalid status are rejected', async () => {
  for (const patch of [{ email: 'invalid' }, { firstName: '  ' }, { jobTitle: null }, { status: 'Unknown' }]) {
    assert.equal((await write(api, 'POST', { ...sample, ...patch })).status, 400);
  }
});
