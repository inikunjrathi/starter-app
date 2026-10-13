// Core loader: you normally don't need to edit this file. Edit config.js.

// Helpers available to every page
const auth = {
  user: () => JSON.parse(localStorage.getItem('user') || 'null'),
  login: u => { localStorage.setItem('user', JSON.stringify(u)); renderNav(); },
  logout: () => { localStorage.removeItem('user'); renderNav(); go(firstPage()); },
};
const go = page => location.hash === '#' + page ? loadPage() : (location.hash = '#' + page);
// api(url) = GET, api(url, data) = POST, api(url, data, 'PUT'), api(url, null, 'DELETE')
async function api(url, data, method = data ? 'POST' : 'GET') {
  const headers = { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (auth.user()?.token || '') };
  const res = await fetch(url, { method, headers, body: data ? JSON.stringify(data) : undefined });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Request failed');
  return json;
}
const label = name => CONFIG.labels?.[name] || name.charAt(0).toUpperCase() + name.slice(1).replace(/[-_]/g, ' ');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
const isProtected = page => CONFIG.requireLogin ? !CONFIG.authPages.includes(page) : CONFIG.protected.includes(page);

// CONFIG.pages entries are 'name' or a group like { Games: ['tictactoe', 'guess'] }
const allPages = () => CONFIG.pages.flatMap(p => typeof p === 'string' ? p : Object.values(p).flat());
const firstPage = () => allPages()[0];

function renderNav() {
  const user = auth.user();
  const ok = p => user || !isProtected(p);
  const link = (p, cls = 'nav-link') => `<li class="nav-item"><a class="${cls}" href="#${p}" data-page="${p}">${label(p)}</a></li>`;
  const build = groupHtml => CONFIG.pages.map(p => typeof p === 'string'
    ? (ok(p) ? link(p) : '')
    : Object.entries(p).map(([group, list]) => list.some(ok) ? groupHtml(group, list.filter(ok)) : '').join('')).join('');

  // in 'side' layout the topbar links still show on mobile, where the sidebar is hidden
  document.getElementById('topLinks').classList.toggle('d-md-none', CONFIG.layout === 'side');
  document.getElementById('topLinks').innerHTML = build((group, list) =>
    `<li class="nav-item dropdown"><a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">${group}</a>
     <ul class="dropdown-menu">${list.map(p => link(p, 'dropdown-item')).join('')}</ul></li>`);
  document.getElementById('sideLinks').innerHTML = build((group, list) =>
    `<li class="nav-item mt-3 mb-1 px-3 small text-uppercase text-body-secondary">${group}</li>` + list.map(p => link(p)).join(''));
  const themeBtn = CONFIG.themeToggle
    ? `<li class="nav-item"><a class="nav-link" href="#" onclick="toggleTheme();return false" title="Toggle theme"><i class="bi bi-circle-half"></i></a></li>` : '';
  document.getElementById('authLinks').innerHTML = themeBtn + (user
    ? `<li class="nav-item"><span class="nav-link">Hi, ${user.name.replace(/</g, '&lt;')}</span></li>
       <li class="nav-item"><a class="nav-link" href="#" onclick="auth.logout();return false">Logout</a></li>`
    : CONFIG.authPages.map(p => link(p, 'nav-link')).join(''));
  highlight();
}

function highlight() {
  const page = location.hash.slice(1) || firstPage();
  document.querySelectorAll('[data-page]').forEach(a => a.classList.toggle('active', a.dataset.page === page));
}

async function loadPage() {
  const page = location.hash.slice(1) || firstPage();
  const allowed = [...allPages(), ...CONFIG.authPages];
  const main = document.getElementById('content');
  if (!allowed.includes(page)) { main.innerHTML = '<h2>404 - Page not found</h2>'; return; }
  if (isProtected(page) && !auth.user()) { go('login'); return; }

  // pages with timers set window.onPageLeave = () => clearInterval(...) so they stop when you navigate away
  if (window.onPageLeave) { window.onPageLeave(); window.onPageLeave = null; }
  // remove Bootstrap popups left open by the previous page
  document.querySelectorAll('body > .tooltip, body > .popover, .modal-backdrop').forEach(el => el.remove());
  document.body.classList.remove('modal-open'); document.body.removeAttribute('style');
  const res = await fetch(`pages/${page}.html`, { cache: 'no-cache' });
  main.innerHTML = res.ok ? await res.text() : `<div class="alert alert-danger">pages/${page}.html not found</div>`;
  // innerHTML doesn't run <script> tags, so re-create them
  main.querySelectorAll('script').forEach(old => {
    const s = document.createElement('script');
    s.textContent = `(() => { ${old.textContent} })();`; // own scope per page
    old.replaceWith(s);
  });
  highlight();
}

// Form -> MongoDB -> table, for "enter these details and store them in the database" tasks.
// crudForm({ collection: 'books', fields: ['Book Name', { label: 'Price', type: 'number' }], form: '#f', table: '#t' })
// Field: 'Label' (text) or { label, name?, type?: text|number|email|date|tel|textarea, options?: [...], required?: true }
// form and table are optional CSS selectors; show either or both.
function crudForm({ collection, fields, form: formSel, table: tableSel, submitText = 'Save' }) {
  const url = `/api/data/${collection}`;
  const spec = fields.map(f => typeof f === 'string' ? { label: f } : f).map(f => ({
    type: 'text', required: true,
    name: f.label.replace(/[^a-z0-9]+(.)?/gi, (_, c) => c ? c.toUpperCase() : '').replace(/^./, c => c.toLowerCase()), // 'Book Name' -> bookName
    ...f,
  }));
  const form = formSel && document.querySelector(formSel);
  const table = tableSel && document.querySelector(tableSel);
  let editing = null;

  if (form) {
    form.innerHTML = spec.map(f => {
      const attrs = `class="${f.options ? 'form-select' : 'form-control'}" name="${f.name}" id="f-${f.name}" ${f.required ? 'required' : ''}`;
      const input = f.options ? `<select ${attrs}><option value="">Choose...</option>${f.options.map(o => `<option>${esc(o)}</option>`).join('')}</select>`
        : f.type === 'textarea' ? `<textarea ${attrs} rows="3"></textarea>`
        : `<input ${attrs} type="${f.type}" ${f.type === 'number' ? 'step="any"' : ''}>`;
      return `<div class="mb-3"><label class="form-label" for="f-${f.name}">${esc(f.label)}</label>${input}</div>`;
    }).join('') + `<button class="btn btn-primary">${esc(submitText)}</button>
      <button type="button" class="btn btn-link d-none" data-cancel>Cancel edit</button><div class="mt-2" data-msg></div>`;
    const msg = form.querySelector('[data-msg]'), cancel = form.querySelector('[data-cancel]');
    const reset = () => { editing = null; HTMLFormElement.prototype.reset.call(form); // works even if a field is named "reset"
      cancel.classList.add('d-none'); };
    cancel.onclick = reset;
    form.onsubmit = async e => {
      e.preventDefault();
      if (!form.reportValidity()) return; // never save a record with missing required fields
      const data = Object.fromEntries(spec.map(f => [f.name, f.type === 'number' ? +form.elements[f.name].value : form.elements[f.name].value]));
      try {
        await (editing ? api(`${url}/${editing}`, data, 'PUT') : api(url, data));
        msg.innerHTML = `<div class="alert alert-success py-2">${editing ? 'Updated' : 'Saved'}!</div>`;
        reset(); load();
      } catch (err) { msg.innerHTML = `<div class="alert alert-danger py-2">${esc(err.message)}</div>`; }
    };
    form._edit = row => { editing = row._id; spec.forEach(f => form.elements[f.name].value = row[f.name] ?? ''); cancel.classList.remove('d-none'); form.scrollIntoView?.(); };
  }

  async function load() {
    if (!table) return;
    let rows;
    try { rows = await api(url); } catch (err) { table.innerHTML = `<div class="alert alert-warning">${esc(err.message)}</div>`; return; }
    const me = auth.user()?.email;
    table.innerHTML = `<div class="table-responsive"><table class="table table-striped align-middle">
      <thead><tr>${spec.map(f => `<th>${esc(f.label)}</th>`).join('')}<th></th></tr></thead>
      <tbody>${rows.map(r => `<tr>${spec.map(f => `<td>${esc(r[f.name])}</td>`).join('')}<td class="text-end text-nowrap">${r.user === me ? `
        ${form ? `<button class="btn btn-sm btn-outline-primary" data-edit="${r._id}">Edit</button>` : ''}
        <button class="btn btn-sm btn-outline-danger" data-del="${r._id}">Delete</button>` : ''}</td></tr>`).join('')
        || `<tr><td colspan="${spec.length + 1}" class="text-body-secondary">No records yet</td></tr>`}</tbody></table></div>`;
    table.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => form._edit(rows.find(r => r._id === b.dataset.edit)));
    table.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => { await api(`${url}/${b.dataset.del}`, null, 'DELETE'); load(); });
  }
  load();
  return { reload: load };
}

document.title = CONFIG.title;
document.getElementById('brand').textContent = CONFIG.title;
document.getElementById('footer').textContent = `© ${new Date().getFullYear()} ${CONFIG.title}`;
document.documentElement.dataset.bsTheme = localStorage.getItem('theme') || CONFIG.theme;
function toggleTheme() {
  const t = document.documentElement.dataset.bsTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.bsTheme = t;
  localStorage.setItem('theme', t);
}
if (CONFIG.layout === 'top') document.getElementById('sidebar').classList.add('d-none');
renderNav();
window.addEventListener('hashchange', loadPage);
loadPage();
