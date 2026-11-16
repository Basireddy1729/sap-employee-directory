const API = '/api/directory/Employees';
const $ = selector => document.querySelector(selector);
let employees = [], editingId = null, deletingId = null;
const fields = ['firstName', 'lastName', 'email', 'department', 'jobTitle', 'location', 'startDate', 'status'];

async function request(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (options.method && !['GET', 'HEAD'].includes(options.method)) {
    const tokenResponse = await fetch('/api/directory/', { headers: { 'X-CSRF-Token': 'Fetch' } });
    const token = tokenResponse.headers.get('x-csrf-token');
    if (token) headers['X-CSRF-Token'] = token;
  }
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error?.message || `Request failed (${response.status})`);
  }
  return response.status === 204 ? null : response.json();
}

async function load() {
  let url = `${API}?$orderby=firstName,lastName`;
  const loaded = [];
  do {
    const result = await request(url);
    loaded.push(...result.value);
    const next = result['@odata.nextLink'];
    url = next ? new URL(next, new URL(url, location.origin)).href : null;
  } while (url);
  employees = loaded;
  $('#total').textContent = employees.length;
  $('#active').textContent = employees.filter(e => e.status === 'Active').length;
  const departments = [...new Set(employees.map(e => e.department))].sort();
  $('#departments').textContent = departments.length;
  const previous = $('#department').value;
  $('#department').replaceChildren(new Option('All departments', ''), ...departments.map(d => new Option(d, d)));
  $('#department').value = departments.includes(previous) ? previous : '';
  render();
}

function element(tag, text, className) {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  return node;
}

function render() {
  const query = $('#search').value.trim().toLowerCase();
  const visible = employees.filter(e => (!$('#department').value || e.department === $('#department').value) &&
    [e.firstName, e.lastName, e.email, e.jobTitle, e.department, e.location].join(' ').toLowerCase().includes(query));
  $('#count').textContent = `${visible.length} of ${employees.length} employees`;
  $('#empty').hidden = visible.length > 0;
  $('#employees').replaceChildren(...visible.map(employee => {
    const row = document.createElement('tr');
    const person = element('div', '', 'person');
    person.append(element('span', employee.firstName[0] + employee.lastName[0], 'avatar'));
    const identity = element('div', '');
    identity.append(element('strong', `${employee.firstName} ${employee.lastName}`), element('span', employee.email, 'detail'));
    person.append(identity);
    const name = element('td', ''); name.append(person);
    const role = element('td', employee.department); role.append(element('span', employee.jobTitle, 'detail'));
    const status = element('td', ''); status.append(element('span', employee.status, `badge${employee.status === 'On Leave' ? ' leave' : ''}`));
    const actions = element('td', ''); const buttons = element('div', '', 'row-actions');
    for (const [label, handler] of [['Edit', () => openEditor(employee)], ['Delete', () => openDelete(employee)]]) {
      const button = element('button', label);
      button.setAttribute('aria-label', `${label} ${employee.firstName} ${employee.lastName}`);
      button.addEventListener('click', handler); buttons.append(button);
    }
    actions.append(buttons); row.append(name, role, element('td', employee.location || '—'), status, actions);
    return row;
  }));
}

function openEditor(employee = null) {
  editingId = employee?.ID || null;
  $('#employee-form').reset();
  $('#dialog-title').textContent = employee ? 'Edit employee' : 'Add employee';
  $('#form-error').textContent = '';
  if (employee) for (const field of fields) $('#employee-form').elements[field].value = employee[field] || '';
  $('#editor').showModal();
}

$('#employee-form').addEventListener('submit', async event => {
  event.preventDefault();
  $('#save').disabled = true;
  $('#form-error').textContent = '';
  const data = Object.fromEntries(fields.map(key => [key, $('#employee-form').elements[key].value.trim()]));
  data.startDate ||= null;
  try {
    await request(editingId ? `${API}(${editingId})` : API, { method: editingId ? 'PATCH' : 'POST', body: JSON.stringify(data) });
    $('#editor').close();
    $('#message').textContent = 'Employee saved.';
    await load().catch(error => { $('#message').textContent = `Saved, but refresh failed: ${error.message}. Reload the page.`; });
  } catch (error) { $('#form-error').textContent = error.message; }
  finally { $('#save').disabled = false; }
});

function openDelete(employee) {
  deletingId = employee.ID;
  $('#delete-description').textContent = `Remove ${employee.firstName} ${employee.lastName} from the directory?`;
  $('#delete-error').textContent = '';
  $('#delete-dialog').showModal();
}
$('#confirm-delete').addEventListener('click', async () => {
  $('#confirm-delete').disabled = true;
  try {
    await request(`${API}(${deletingId})`, { method: 'DELETE' });
    $('#delete-dialog').close();
    $('#message').textContent = 'Employee deleted.';
    await load().catch(error => { $('#message').textContent = `Deleted, but refresh failed: ${error.message}. Reload the page.`; });
  } catch (error) { $('#delete-error').textContent = error.message; }
  finally { $('#confirm-delete').disabled = false; }
});
$('#keep').addEventListener('click', () => $('#delete-dialog').close());
$('#add').addEventListener('click', () => openEditor());
for (const id of ['close', 'cancel']) $(`#${id}`).addEventListener('click', () => $('#editor').close());
$('#search').addEventListener('input', render);
$('#department').addEventListener('change', render);
load().catch(error => { $('#message').textContent = `Could not load employees: ${error.message}. Check that the backend is running, then reload.`; $('#count').textContent = 'Connection unavailable'; });
