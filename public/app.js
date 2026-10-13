// Core loader: you normally don't need to edit this file. Edit config.js.

// Helpers available to every page
const auth = {
  user: () => JSON.parse(localStorage.getItem('user') || 'null'),
  login: u => { localStorage.setItem('user', JSON.stringify(u)); renderNav(); },
  logout: () => { localStorage.removeItem('user'); renderNav(); location.hash = '#home'; },
};
// api(url) = GET, api(url, data) = POST, api(url, data, 'PUT'), api(url, null, 'DELETE')
async function api(url, data, method = data ? 'POST' : 'GET') {
  const headers = { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (auth.user()?.token || '') };
  const res = await fetch(url, { method, headers, body: data ? JSON.stringify(data) : undefined });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Request failed');
  return json;
}
const label = name => name.charAt(0).toUpperCase() + name.slice(1).replace(/[-_]/g, ' ');

// CONFIG.pages entries are 'name' or a group like { Games: ['tictactoe', 'guess'] }
const allPages = () => CONFIG.pages.flatMap(p => typeof p === 'string' ? p : Object.values(p).flat());
const firstPage = () => allPages()[0];

function renderNav() {
  const user = auth.user();
  const ok = p => user || !CONFIG.protected.includes(p);
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
  if (CONFIG.protected.includes(page) && !auth.user()) { location.hash = '#login'; return; }

  // pages with timers set window.onPageLeave = () => clearInterval(...) so they stop when you navigate away
  if (window.onPageLeave) { window.onPageLeave(); window.onPageLeave = null; }
  // remove Bootstrap popups left open by the previous page
  document.querySelectorAll('body > .tooltip, body > .popover, .modal-backdrop').forEach(el => el.remove());
  document.body.classList.remove('modal-open'); document.body.removeAttribute('style');
  const res = await fetch(`pages/${page}.html`);
  main.innerHTML = res.ok ? await res.text() : `<div class="alert alert-danger">pages/${page}.html not found</div>`;
  // innerHTML doesn't run <script> tags, so re-create them
  main.querySelectorAll('script').forEach(old => {
    const s = document.createElement('script');
    s.textContent = `(() => { ${old.textContent} })();`; // own scope per page
    old.replaceWith(s);
  });
  highlight();
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
