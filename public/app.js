// Core loader: you normally don't need to edit this file. Edit config.js.

// Helpers available to every page
const auth = {
  user: () => JSON.parse(localStorage.getItem('user') || 'null'),
  login: u => { localStorage.setItem('user', JSON.stringify(u)); renderNav(); },
  logout: () => { localStorage.removeItem('user'); renderNav(); go(firstPage()); },
};
const go = page => current() === page ? loadPage() : (location.hash = '#' + encodeURI(page));
// api(url) = GET, api(url, data) = POST, api(url, data, 'PUT'), api(url, null, 'DELETE')
async function api(url, data, method = data ? 'POST' : 'GET') {
  const headers = { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (auth.user()?.token || '') };
  const res = await fetch(url, { method, headers, body: data ? JSON.stringify(data) : undefined });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Request failed');
  return json;
}
// Menu entries can carry parameters: 'menu?cat=Starters' opens pages/menu.html, which reads pageParams().cat
const current = () => decodeURIComponent(location.hash.slice(1)) || firstPage();
const pageOf = entry => entry.split('?')[0];
const pageParams = () => Object.fromEntries(new URLSearchParams(current().split('?')[1] || ''));
const label = name => CONFIG.labels?.[name]
  || (name.includes('?') ? [...new URLSearchParams(name.split('?')[1]).values()].pop() // 'menu?cat=Starters' -> 'Starters'
  : name.charAt(0).toUpperCase() + name.slice(1).replace(/[-_]/g, ' '));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
const isProtected = page => CONFIG.requireLogin ? !CONFIG.authPages.includes(page) : CONFIG.protected.includes(page);

// CONFIG.pages entries are 'name' or a group like { Games: ['tictactoe', 'guess'] }
const allPages = () => CONFIG.pages.flatMap(p => typeof p === 'string' ? p : Object.values(p).flat());
const firstPage = () => allPages()[0];

function renderNav() {
  const user = auth.user();
  const ok = p => user || !isProtected(pageOf(p));
  const link = (p, cls = 'nav-link') => `<li class="nav-item"><a class="${cls}" href="#${encodeURI(p)}" data-page="${esc(p)}">${esc(label(p))}</a></li>`;
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
  document.querySelectorAll('[data-page]').forEach(a => a.classList.toggle('active', a.dataset.page === current()));
}

async function loadPage() {
  const page = pageOf(current());
  const allowed = [...allPages().map(pageOf), ...CONFIG.authPages];
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
// Field: 'Label' (text) or { label, name?, type?: text|number|email|date|time|tel|textarea, options?: [...],
//   required?: true, min?, max?, pattern?, placeholder? }
// fields can be left out if CONFIG.forms[collection] lists them. form and table are optional CSS selectors.
// search: true adds a search box above the table.
// validate: data => 'error message' (or nothing if OK), for checks like dates in the right order.
function crudForm({ collection, fields = CONFIG.forms?.[collection], form: formSel, table: tableSel, submitText = 'Save', search = false, validate }) {
  if (!fields) throw new Error(`crudForm: no fields for "${collection}" (pass fields or add CONFIG.forms.${collection})`);
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
      const extra = ['min', 'max', 'pattern', 'placeholder'].map(k => f[k] != null ? `${k}="${esc(f[k])}"` : '').join(' ');
      const attrs = `class="${f.options ? 'form-select' : 'form-control'}" name="${f.name}" id="f-${f.name}" ${f.required ? 'required' : ''} ${extra}`;
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
      const problem = validate?.(data);
      if (problem) { msg.innerHTML = `<div class="alert alert-danger py-2">${esc(problem)}</div>`; return; }
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
    const q = table.querySelector('[data-search]')?.value || '';
    table.innerHTML = (search ? `<input class="form-control mb-3" data-search placeholder="Search..." style="max-width:400px">` : '') + `<div class="table-responsive"><table class="table table-striped align-middle">
      <thead><tr>${spec.map(f => `<th>${esc(f.label)}</th>`).join('')}<th></th></tr></thead>
      <tbody>${rows.map(r => `<tr>${spec.map(f => `<td>${esc(r[f.name])}</td>`).join('')}<td class="text-end text-nowrap">${r.mine ? `
        ${form ? `<button class="btn btn-sm btn-outline-primary" data-edit="${esc(r._id)}">Edit</button>` : ''}
        <button class="btn btn-sm btn-outline-danger" data-del="${esc(r._id)}">Delete</button>` : ''}</td></tr>`).join('')
        || `<tr><td colspan="${spec.length + 1}" class="text-body-secondary">No records yet</td></tr>`}</tbody></table></div>`;
    table.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => form._edit(rows.find(r => r._id === b.dataset.edit)));
    const box = table.querySelector('[data-search]');
    if (box) {
      const filter = () => table.querySelectorAll('tbody tr').forEach(tr => tr.hidden = !tr.textContent.toLowerCase().includes(box.value.toLowerCase()));
      box.value = q; box.oninput = filter; filter();
    }
    table.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => { await api(`${url}/${b.dataset.del}`, null, 'DELETE'); load(); });
  }
  load();
  return { reload: load };
}

// carousel('#banner', ['images/a.jpg', { src: 'images/b.jpg', title: 'Sale', text: '50% off' }])
function carousel(sel, slides, interval = 3000) {
  const el = document.querySelector(sel);
  const id = 'carousel-' + Math.random().toString(36).slice(2);
  slides = slides.map(s => typeof s === 'string' ? { src: s } : s);
  el.innerHTML = `<div id="${id}" class="carousel slide">
    <div class="carousel-indicators">${slides.map((_, i) => `<button data-bs-target="#${id}" data-bs-slide-to="${i}" class="${i ? '' : 'active'}"></button>`).join('')}</div>
    <div class="carousel-inner rounded">${slides.map((s, i) => `<div class="carousel-item ${i ? '' : 'active'}">
      <img src="${esc(s.src)}" class="d-block w-100" alt="${esc(s.title)}">
      ${s.title || s.text ? `<div class="carousel-caption"><h5>${esc(s.title)}</h5><p>${esc(s.text)}</p></div>` : ''}</div>`).join('')}</div>
    <button class="carousel-control-prev" data-bs-target="#${id}" data-bs-slide="prev"><span class="carousel-control-prev-icon"></span></button>
    <button class="carousel-control-next" data-bs-target="#${id}" data-bs-slide="next"><span class="carousel-control-next-icon"></span></button>
  </div>`;
  bootstrap.Carousel.getOrCreateInstance('#' + id, { interval }).cycle();
}

// cards('#doctors', [{ title: 'Dr. Rao', text: 'Cardiologist', img: 'images/x.jpg', icon: 'heart-pulse', footer: 'Mon-Fri' }])
function cards(sel, items, cols = 'col-sm-6 col-lg-4') {
  document.querySelector(sel).innerHTML = `<div class="row g-3">${items.map(c => `<div class="${cols}"><div class="card h-100">
    ${c.img ? `<img src="${esc(c.img)}" class="card-img-top" alt="">` : ''}
    <div class="card-body">${c.icon ? `<i class="bi bi-${esc(c.icon)} fs-2 text-primary"></i>` : ''}
      <h5 class="card-title mt-1">${esc(c.title)}</h5><p class="card-text">${esc(c.text)}</p></div>
    ${c.footer ? `<div class="card-footer text-body-secondary small">${esc(c.footer)}</div>` : ''}
  </div></div>`).join('')}</div>`;
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
