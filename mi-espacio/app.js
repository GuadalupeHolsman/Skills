// Mi Espacio — finanzas, laburo y personal. Sin build: módulo ES plano.

const LS_DATA = 'miespacio:data';
const LS_CLOUD = 'miespacio:cloud';
const SUPABASE_URL = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';
const TABLE = 'espacio_data';

const EXPENSE_CATS = ['Comida', 'Súper', 'Transporte', 'Casa', 'Servicios', 'Salud', 'Salidas', 'Ropa', 'Suscripciones', 'Educación', 'Otros'];
const INCOME_CATS = ['Sueldo', 'Freelance', 'Ventas', 'Otros'];
const AREAS = { work: 'Laburo', personal: 'Personal' };
const PRIO = { alta: 'Alta', media: 'Media', baja: 'Baja' };
const PRIO_ORDER = { alta: 0, media: 1, baja: 2 };

// ---------- utilidades ----------
const $ = (s, el = document) => el.querySelector(s);
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
const pad = n => String(n).padStart(2, '0');
const dstr = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseDate = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const today = () => dstr(new Date());
const addDays = (s, n) => { const d = parseDate(s); d.setDate(d.getDate() + n); return dstr(d); };
const daysBetween = (a, b) => Math.round((parseDate(b) - parseDate(a)) / 864e5);
const thisMonth = () => today().slice(0, 7);
const shiftMonth = (mk, n) => { const [y, m] = mk.split('-').map(Number); const d = new Date(y, m - 1 + n, 1); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; };
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const monthName = (mk, short) => { const [y, m] = mk.split('-').map(Number); return new Date(y, m - 1, 1).toLocaleDateString('es-AR', short ? { month: 'short' } : { month: 'long', year: 'numeric' }); };
const prettyDay = s => cap(parseDate(s).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }));
const shortDay = s => parseDate(s).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (n, cur = 'ARS') => new Intl.NumberFormat('es-AR', { style: 'currency', currency: cur, maximumFractionDigits: cur === 'USD' ? 2 : 0 }).format(n || 0);
const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove('show'), 2400);
}

// ---------- datos ----------
const DEFAULT_SETTINGS = {
  name: '', rate: 1000,
  notif: { summary: true, tasks: true, bills: true, evening: true },
  summaryHour: 9, taskHour: 18, eveningHour: 21, billDaysBefore: 3,
  updatedAt: 0
};

function blank() {
  return { tx: [], budgets: [], bills: [], tasks: [], settings: structuredClone(DEFAULT_SETTINGS) };
}

function normalize(s) {
  const b = blank();
  if (!s || typeof s !== 'object') return b;
  return {
    tx: Array.isArray(s.tx) ? s.tx : [],
    budgets: Array.isArray(s.budgets) ? s.budgets : [],
    bills: Array.isArray(s.bills) ? s.bills : [],
    tasks: Array.isArray(s.tasks) ? s.tasks : [],
    settings: { ...b.settings, ...(s.settings || {}), notif: { ...b.settings.notif, ...(s.settings?.notif || {}) } }
  };
}

function load() {
  try { return normalize(JSON.parse(localStorage.getItem(LS_DATA))); } catch { return blank(); }
}

let state = load();

function persistLocal() {
  try { localStorage.setItem(LS_DATA, JSON.stringify(state)); } catch { /* sin espacio o modo privado */ }
}

function save() {
  persistLocal();
  Reminders.refresh();
  Sync.queue();
}

const live = list => list.filter(x => !x.deleted);

function upsert(coll, item) {
  item.updatedAt = Date.now();
  const i = state[coll].findIndex(x => x.id === item.id);
  if (i >= 0) state[coll][i] = item; else state[coll].push(item);
  save();
}

function remove(coll, id) {
  const x = state[coll].find(x => x.id === id);
  if (x) { x.deleted = true; x.updatedAt = Date.now(); save(); }
}

function setSettings(patch) {
  Object.assign(state.settings, patch, { updatedAt: Date.now() });
  save();
}

// Combina dos copias (local y nube) ítem por ítem: gana la edición más reciente.
function mergeList(a = [], b = []) {
  const m = new Map();
  for (const x of [...a, ...b]) {
    const y = m.get(x.id);
    if (!y || (x.updatedAt || 0) > (y.updatedAt || 0)) m.set(x.id, x);
  }
  return [...m.values()];
}

function merge(a, b) {
  return {
    tx: mergeList(a.tx, b.tx),
    budgets: mergeList(a.budgets, b.budgets),
    bills: mergeList(a.bills, b.bills),
    tasks: mergeList(a.tasks, b.tasks),
    settings: (b.settings.updatedAt || 0) > (a.settings.updatedAt || 0) ? b.settings : a.settings
  };
}

// ---------- finanzas ----------
const toARS = (amount, cur) => (cur === 'USD' ? amount * (+state.settings.rate || 0) : amount);
const monthTx = mk => live(state.tx).filter(t => t.date.startsWith(mk));

function totals(mk) {
  let inc = 0, exp = 0;
  for (const t of monthTx(mk)) {
    const v = toARS(+t.amount, t.currency);
    if (t.type === 'income') inc += v; else exp += v;
  }
  return { inc, exp, bal: inc - exp };
}

function byCategory(mk) {
  const m = {};
  for (const t of monthTx(mk)) if (t.type === 'expense') m[t.category] = (m[t.category] || 0) + toARS(+t.amount, t.currency);
  return Object.entries(m).sort((a, b) => b[1] - a[1]);
}

function billDue(b, mk) {
  const [y, m] = mk.split('-').map(Number);
  const dim = new Date(y, m, 0).getDate();
  return `${mk}-${pad(Math.min(+b.day, dim))}`;
}

// Pagos sin marcar de este mes (incluye vencidos) y del próximo, dentro de `days` días.
function upcomingBills(days, from = today()) {
  const lim = addDays(from, days);
  const mk = from.slice(0, 7);
  const out = [];
  for (const b of live(state.bills)) {
    for (const k of [mk, shiftMonth(mk, 1)]) {
      if (b.paid?.includes(k)) continue;
      const due = billDue(b, k);
      if (due <= lim && (k === mk || due >= from)) out.push({ ...b, due, month: k });
    }
  }
  return out.sort((a, b) => a.due.localeCompare(b.due));
}

function categories(type) {
  const base = type === 'income' ? INCOME_CATS : EXPENSE_CATS;
  const used = live(state.tx).filter(t => t.type === type).map(t => t.category);
  return [...new Set([...base, ...used, ...(type === 'expense' ? live(state.budgets).map(b => b.category) : [])])];
}

// ---------- tareas ----------
function sortTasks(list) {
  return list.sort((a, b) =>
    (a.due || '9999').localeCompare(b.due || '9999') ||
    (PRIO_ORDER[a.priority] ?? 1) - (PRIO_ORDER[b.priority] ?? 1) ||
    (a.createdAt || 0) - (b.createdAt || 0));
}

function groupTasks(list) {
  const t = today(), tm = addDays(t, 1);
  const g = { overdue: [], today: [], tomorrow: [], later: [], nodate: [], done: [] };
  for (const x of list) {
    if (x.status === 'done') g.done.push(x);
    else if (!x.due) g.nodate.push(x);
    else if (x.due < t) g.overdue.push(x);
    else if (x.due === t) g.today.push(x);
    else if (x.due === tm) g.tomorrow.push(x);
    else g.later.push(x);
  }
  for (const k in g) sortTasks(g[k]);
  g.done.sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0));
  return g;
}

const pendingTasks = area => live(state.tasks).filter(t => t.status !== 'done' && (!area || t.area === area));

function dueLabel(due) {
  if (!due) return '';
  const d = daysBetween(today(), due);
  if (d < 0) return `<span class="tag late">Vencida · ${shortDay(due)}</span>`;
  if (d === 0) return '<span class="tag soon">Hoy</span>';
  if (d === 1) return '<span class="tag">Mañana</span>';
  return `<span class="tag">${shortDay(due)}</span>`;
}

// ---------- vistas ----------
let view = location.hash.slice(1) || 'home';
const ui = { month: thisMonth(), filter: { work: 'pending', personal: 'pending' }, otpEmail: '' };
let charts = [];

function destroyCharts() { charts.forEach(c => c.destroy()); charts = []; }

function render() {
  if (!VIEWS[view]) view = 'home';
  document.querySelectorAll('.nav [data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  destroyCharts();
  $('#view').innerHTML = VIEWS[view]();
  AFTER[view]?.();
  Sync.badge();
}

function go(v) {
  view = v;
  history.replaceState(null, '', '#' + v);
  render();
  window.scrollTo(0, 0);
}

function taskRow(t, showArea) {
  const done = t.status === 'done';
  return `<div class="row click ${done ? 'done' : ''}" data-action="editTask" data-id="${t.id}">
    <button class="check ${done ? 'on' : ''}" data-action="toggleTask" data-id="${t.id}" aria-label="${done ? 'Marcar pendiente' : 'Marcar hecha'}">✓</button>
    <span class="prio ${esc(t.priority || 'media')}" title="Prioridad ${esc(PRIO[t.priority] || 'Media')}"></span>
    <div class="main">
      <div class="title">${esc(t.title)}</div>
      <div class="meta">
        ${showArea ? `<span class="tag ${t.area}">${AREAS[t.area]}</span>` : ''}
        ${t.status === 'doing' ? '<span class="tag doing">En curso</span>' : ''}
        ${done ? '' : dueLabel(t.due)}
        ${t.notes ? '<span title="Tiene notas">📝</span>' : ''}
      </div>
    </div>
  </div>`;
}

function billRow(b) {
  const d = daysBetween(today(), b.due);
  const status = d < 0 ? `<span class="tag late">Vencido hace ${-d} d</span>`
    : d === 0 ? '<span class="tag soon">Vence hoy</span>'
    : d <= state.settings.billDaysBefore ? `<span class="tag soon">En ${d} d</span>`
    : `<span class="tag">${shortDay(b.due)}</span>`;
  return `<div class="row">
    <div class="main"><div class="title">${esc(b.name)}</div><div class="meta">${status}<span>${esc(b.category || '')}</span></div></div>
    <span class="amount">${fmt(+b.amount, b.currency)}</span>
    <button class="btn sm" data-action="payBill" data-id="${b.id}" data-month="${b.month}">Pagado</button>
  </div>`;
}

function notifBanner() {
  if (!('Notification' in window) || Notification.permission !== 'default') return '';
  if (!Object.values(state.settings.notif).some(Boolean)) return '';
  return `<div class="banner"><span>🔔 Activá las notificaciones para recibir el resumen diario y los avisos de vencimientos.</span>
    <button class="btn primary sm" data-action="askNotif">Activar</button></div>`;
}

const VIEWS = {
  home() {
    const mk = thisMonth();
    const tt = totals(mk);
    const budgets = live(state.budgets);
    const budgetTotal = budgets.reduce((s, b) => s + +b.amount, 0);
    const spentCat = Object.fromEntries(byCategory(mk));
    const budgetSpent = budgets.reduce((s, b) => s + (spentCat[b.category] || 0), 0);
    const todayList = [...pendingTasks()].filter(t => t.due && t.due <= today());
    const bills = upcomingBills(10);
    const name = state.settings.name ? `, ${esc(state.settings.name)}` : '';
    const hour = new Date().getHours();
    const hello = hour < 13 ? 'Buen día' : hour < 20 ? 'Buenas tardes' : 'Buenas noches';
    const countToday = a => pendingTasks(a).filter(t => t.due && t.due <= today()).length;
    return `
      <header class="page-head">
        <div><p class="eyebrow">${prettyDay(today())}</p><h1>${hello}${name}</h1></div>
        <div class="head-actions">
          <button class="btn" data-action="newTx" data-type="expense">＋ Gasto</button>
          <button class="btn" data-action="newTask" data-area="work">＋ Laburo</button>
          <button class="btn" data-action="newTask" data-area="personal">＋ Personal</button>
        </div>
      </header>
      ${notifBanner()}
      <section class="cards">
        <div class="card link" data-action="go" data-view="money">
          <div class="label">Balance de ${monthName(mk, true)}</div>
          <div class="value ${tt.bal < 0 ? 'neg' : ''}">${fmt(tt.bal)}</div>
          <div class="sub"><span class="pos">↑ ${fmt(tt.inc)}</span> · <span class="neg">↓ ${fmt(tt.exp)}</span></div>
        </div>
        <div class="card link" data-action="go" data-view="money">
          <div class="label">Presupuesto del mes</div>
          ${budgetTotal ? `<div class="value ${budgetSpent > budgetTotal ? 'neg' : ''}">${Math.round(budgetSpent / budgetTotal * 100)}%</div><div class="sub">${fmt(budgetSpent)} de ${fmt(budgetTotal)}</div>`
            : '<div class="value">—</div><div class="sub">Todavía sin presupuesto</div>'}
        </div>
        <div class="card link" data-action="go" data-view="work">
          <div class="label">💼 Laburo para hoy</div>
          <div class="value">${countToday('work')}</div>
          <div class="sub">${pendingTasks('work').length} pendientes en total</div>
        </div>
        <div class="card link" data-action="go" data-view="personal">
          <div class="label">🌱 Personal para hoy</div>
          <div class="value">${countToday('personal')}</div>
          <div class="sub">${pendingTasks('personal').length} pendientes en total</div>
        </div>
      </section>
      <div class="grid2">
        <section class="panel">
          <div class="panel-head"><h2>Para hoy</h2></div>
          <div class="list">${sortTasks(todayList).map(t => taskRow(t, true)).join('') || '<div class="empty">Nada pendiente para hoy 🎉</div>'}</div>
        </section>
        <section class="panel">
          <div class="panel-head"><h2>Próximos pagos</h2><button class="btn ghost sm" data-action="newBill">＋ Gasto fijo</button></div>
          <div class="list">${bills.map(billRow).join('') || '<div class="empty">Sin vencimientos en los próximos 10 días</div>'}</div>
        </section>
        <section class="panel">
          <div class="panel-head"><h2>Gastos por categoría · ${monthName(mk, true)}</h2></div>
          <div class="chart-box"><canvas id="ch-cat"></canvas></div>
        </section>
        <section class="panel">
          <div class="panel-head"><h2>Tareas hechas · últimas 8 semanas</h2></div>
          <div class="chart-box"><canvas id="ch-done"></canvas></div>
        </section>
      </div>`;
  },

  money() {
    const mk = ui.month;
    const tt = totals(mk);
    const spent = Object.fromEntries(byCategory(mk));
    const budgets = live(state.budgets).sort((a, b) => a.category.localeCompare(b.category));
    const bills = live(state.bills).sort((a, b) => +a.day - +b.day);
    const txs = monthTx(mk).sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || 0) - (a.createdAt || 0));
    let lastDay = '';
    const txHtml = txs.map(t => {
      const head = t.date !== lastDay ? `<div class="day-head">${prettyDay(t.date)}</div>` : '';
      lastDay = t.date;
      const sign = t.type === 'income' ? '+' : '−';
      return `${head}<div class="row click" data-action="editTx" data-id="${t.id}">
        <div class="main"><div class="title">${esc(t.note || t.category)}</div><div class="meta"><span class="tag">${esc(t.category)}</span>${t.currency === 'USD' ? `<span>≈ ${fmt(toARS(+t.amount, 'USD'))}</span>` : ''}</div></div>
        <span class="amount ${t.type === 'income' ? 'pos' : 'neg'}">${sign} ${fmt(+t.amount, t.currency)}</span>
      </div>`;
    }).join('');
    return `
      <header class="page-head">
        <div><p class="eyebrow">Finanzas</p><h1>Mi plata</h1></div>
        <div class="head-actions">
          <div class="month-switch">
            <button class="icon-btn" data-action="month" data-d="-1" aria-label="Mes anterior">‹</button>
            <span>${cap(monthName(mk))}</span>
            <button class="icon-btn" data-action="month" data-d="1" aria-label="Mes siguiente">›</button>
          </div>
          <button class="btn primary" data-action="newTx" data-type="expense">＋ Movimiento</button>
        </div>
      </header>
      <section class="cards">
        <div class="card"><div class="label">Ingresos</div><div class="value pos">${fmt(tt.inc)}</div></div>
        <div class="card"><div class="label">Gastos</div><div class="value neg">${fmt(tt.exp)}</div></div>
        <div class="card"><div class="label">Balance</div><div class="value ${tt.bal < 0 ? 'neg' : ''}">${fmt(tt.bal)}</div></div>
        <div class="card link" data-action="editRate"><div class="label">Dólar (manual)</div><div class="value">${fmt(+state.settings.rate)}</div><div class="sub">Tocá para actualizar</div></div>
      </section>
      <div class="grid2">
        <section class="panel">
          <div class="panel-head"><h2>Gastos por categoría</h2></div>
          <div class="chart-box"><canvas id="ch-cat"></canvas></div>
        </section>
        <section class="panel">
          <div class="panel-head"><h2>Últimos 6 meses</h2></div>
          <div class="chart-box"><canvas id="ch-months"></canvas></div>
        </section>
        <section class="panel">
          <div class="panel-head"><h2>Presupuestos</h2><button class="btn ghost sm" data-action="newBudget">＋ Presupuesto</button></div>
          ${budgets.map(b => {
            const s = spent[b.category] || 0;
            const p = b.amount > 0 ? s / b.amount * 100 : 0;
            return `<div class="budget row click" data-action="editBudget" data-id="${b.id}" style="display:block">
              <div class="top"><strong>${esc(b.category)}</strong><span class="${p > 100 ? 'neg' : 'muted'}">${fmt(s)} / ${fmt(+b.amount)}</span></div>
              <div class="bar"><i class="${p > 100 ? 'over' : p >= 80 ? 'warn' : ''}" style="width:${Math.min(p, 100)}%"></i></div>
            </div>`;
          }).join('') || '<div class="empty">Poné un tope por categoría y te aviso si te pasás.</div>'}
        </section>
        <section class="panel">
          <div class="panel-head"><h2>Gastos fijos</h2><button class="btn ghost sm" data-action="newBill">＋ Gasto fijo</button></div>
          <div class="list">${bills.map(b => {
            const paid = b.paid?.includes(mk);
            const due = billDue(b, mk);
            const d = daysBetween(today(), due);
            const st = paid ? '<span class="tag ok">Pagado</span>'
              : d < 0 ? '<span class="tag late">Vencido</span>'
              : d <= state.settings.billDaysBefore ? `<span class="tag soon">Vence ${d === 0 ? 'hoy' : `en ${d} d`}</span>`
              : `<span class="tag">Día ${b.day}</span>`;
            return `<div class="row click" data-action="editBill" data-id="${b.id}">
              <div class="main"><div class="title">${esc(b.name)}</div><div class="meta">${st}<span>${esc(b.category || '')}</span></div></div>
              <span class="amount">${fmt(+b.amount, b.currency)}</span>
              <button class="btn sm ${paid ? 'ghost' : ''}" data-action="${paid ? 'unpayBill' : 'payBill'}" data-id="${b.id}" data-month="${mk}">${paid ? 'Deshacer' : 'Pagado'}</button>
            </div>`;
          }).join('') || '<div class="empty">Alquiler, servicios, tarjeta… cargalos y te aviso antes de que venzan.</div>'}</div>
        </section>
        <section class="panel wide">
          <div class="panel-head"><h2>Movimientos de ${monthName(mk)}</h2>
            <div class="inline"><button class="btn ghost sm" data-action="newTx" data-type="income">＋ Ingreso</button><button class="btn ghost sm" data-action="newTx" data-type="expense">＋ Gasto</button></div>
          </div>
          <div class="list">${txHtml || '<div class="empty">Sin movimientos este mes.</div>'}</div>
        </section>
      </div>`;
  },

  work() { return taskView('work'); },
  personal() { return taskView('personal'); },

  settings() {
    const s = state.settings;
    const perm = 'Notification' in window ? Notification.permission : 'unsupported';
    const permTxt = { granted: '✅ Activadas en este dispositivo', denied: '🚫 Bloqueadas: habilitalas desde la configuración del navegador', default: 'Todavía no las activaste', unsupported: 'Este navegador no soporta notificaciones (en iPhone: instalá la app primero)' }[perm];
    const hourSel = (name, val) => `<select name="${name}" data-action="setHour">${Array.from({ length: 24 }, (_, h) => `<option value="${h}" ${+val === h ? 'selected' : ''}>${pad(h)}:00</option>`).join('')}</select>`;
    const toggle = (key, title, desc) => `<label class="switch"><div><div>${title}</div><div class="desc">${desc}</div></div><input type="checkbox" data-action="toggleNotif" data-key="${key}" ${s.notif[key] ? 'checked' : ''}></label>`;
    return `
      <header class="page-head"><div><p class="eyebrow">Ajustes</p><h1>Configuración</h1></div></header>
      <div class="settings grid2">
        <section class="panel">
          <h2>Perfil</h2>
          <p class="help">¿Cómo te saludo en el inicio?</p>
          <div class="inline"><input id="set-name" value="${esc(s.name)}" placeholder="Tu nombre"><button class="btn" data-action="saveName">Guardar</button></div>
          <h2 style="margin-top:18px">Dólar</h2>
          <p class="help">Cotización manual para pasar los montos en USD a pesos en los totales y gráficos.</p>
          <div class="inline"><input id="set-rate" type="number" min="0" step="0.01" value="${esc(s.rate)}"><button class="btn" data-action="saveRate">Guardar</button></div>
        </section>

        <section class="panel">
          <h2>Notificaciones</h2>
          <p class="help">${permTxt}</p>
          ${perm === 'default' ? '<button class="btn primary" data-action="askNotif">Activar notificaciones</button>' : ''}
          ${perm === 'granted' ? '<button class="btn sm" data-action="testNotif">Probar</button>' : ''}
          <div style="margin-top:8px">
            ${toggle('summary', 'Resumen diario', 'A la mañana: tareas de hoy y pagos cercanos.')}
            ${toggle('tasks', 'Tareas que vencen hoy o mañana', 'Si quedan pendientes, te aviso a la tarde.')}
            ${toggle('bills', 'Vencimientos de pagos', `Desde ${s.billDaysBefore} días antes de cada gasto fijo.`)}
            ${toggle('evening', 'Recordatorio de cargar gastos', 'A la noche, para registrar lo del día.')}
          </div>
          <div class="hours">
            <label class="field"><span>Resumen</span>${hourSel('summaryHour', s.summaryHour)}</label>
            <label class="field"><span>Tareas</span>${hourSel('taskHour', s.taskHour)}</label>
            <label class="field"><span>Cargar gastos</span>${hourSel('eveningHour', s.eveningHour)}</label>
            <label class="field"><span>Avisar pagos</span><select name="billDaysBefore" data-action="setHour">${[1, 2, 3, 5, 7].map(n => `<option value="${n}" ${+s.billDaysBefore === n ? 'selected' : ''}>${n} día${n > 1 ? 's' : ''} antes</option>`).join('')}</select></label>
          </div>
          <p class="help" style="margin-top:12px">Los avisos llegan mientras la app está abierta o en segundo plano. Con la app instalada en Android (Chrome) también se revisan solos cada tanto aunque esté cerrada.</p>
        </section>

        <section class="panel">${Sync.panel()}</section>

        <section class="panel">
          <h2>Instalar en el celular</h2>
          <p class="help"><strong>iPhone:</strong> abrí la página en Safari → botón Compartir → <em>Agregar a inicio</em>. Después abrila desde el ícono para poder activar notificaciones.</p>
          <p class="help"><strong>Android:</strong> en Chrome, menú ⋮ → <em>Instalar app</em>.</p>
          ${Install.prompt ? '<button class="btn primary" data-action="install">Instalar ahora</button>' : ''}
          <h2 style="margin-top:18px">Copia de seguridad</h2>
          <p class="help">Descargá tus datos en un archivo o importalos (se combinan con lo que ya tenés).</p>
          <div class="inline">
            <button class="btn" data-action="exportData">Exportar</button>
            <label class="btn">Importar<input type="file" accept="application/json,.json" id="import-file" hidden></label>
            <button class="btn danger ghost" data-action="wipe">Borrar datos de este dispositivo</button>
          </div>
        </section>
      </div>`;
  }
};

function taskView(area) {
  const all = live(state.tasks).filter(t => t.area === area);
  const g = groupTasks(all);
  const f = ui.filter[area];
  const weekAgo = Date.now() - 7 * 864e5;
  const doneWeek = g.done.filter(t => (t.doneAt || 0) >= weekAgo).length;
  const sections = [
    ['overdue', '⚠️ Vencidas'], ['today', 'Hoy'], ['tomorrow', 'Mañana'], ['later', 'Próximas'], ['nodate', 'Sin fecha']
  ];
  const groupHtml = (key, title) => g[key].length
    ? `<div class="group-title">${title} <span class="count">${g[key].length}</span></div><div class="list">${g[key].map(t => taskRow(t)).join('')}</div>` : '';
  let body = '';
  if (f !== 'done') body += sections.map(([k, t]) => groupHtml(k, t)).join('');
  if (f !== 'pending') body += groupHtml('done', '✓ Hechas');
  if (!body) body = `<div class="empty">${f === 'done' ? 'Todavía no completaste tareas.' : 'No hay pendientes. Escribí una arriba y apretá Enter.'}</div>`;
  return `
    <header class="page-head">
      <div><p class="eyebrow">${area === 'work' ? 'Laburo' : 'Personal'}</p><h1>${area === 'work' ? '💼 Lo del laburo' : '🌱 Mis cosas'}</h1></div>
    </header>
    <section class="cards">
      <div class="card"><div class="label">Pendientes</div><div class="value">${all.length - g.done.length}</div></div>
      <div class="card"><div class="label">Para hoy</div><div class="value">${g.today.length + g.overdue.length}</div><div class="sub">${g.overdue.length ? `${g.overdue.length} vencida${g.overdue.length > 1 ? 's' : ''}` : 'Al día'}</div></div>
      <div class="card"><div class="label">Hechas esta semana</div><div class="value pos">${doneWeek}</div></div>
    </section>
    <section class="panel">
      <form class="quick" data-quick="${area}">
        <input name="title" placeholder="Nueva tarea… (Enter para agregar)" autocomplete="off" required>
        <input name="due" type="date" title="Fecha" value="">
        <select name="priority" title="Prioridad">${Object.entries(PRIO).map(([k, v]) => `<option value="${k}" ${k === 'media' ? 'selected' : ''}>${v}</option>`).join('')}</select>
        <button class="btn primary">Agregar</button>
      </form>
      <div class="chips">
        ${[['pending', 'Pendientes'], ['done', 'Hechas'], ['all', 'Todas']].map(([k, v]) => `<button class="chip ${f === k ? 'on' : ''}" data-action="filter" data-area="${area}" data-f="${k}">${v}</button>`).join('')}
      </div>
      ${body}
    </section>`;
}

// ---------- gráficos ----------
function palette(n) {
  return Array.from({ length: n }, (_, i) => css(`--c${(i % 9) + 1}`));
}

function chartDefaults() {
  const C = window.Chart;
  C.defaults.color = css('--muted');
  C.defaults.borderColor = css('--border');
  C.defaults.font.family = getComputedStyle(document.body).fontFamily;
  C.defaults.plugins.legend.labels.boxWidth = 10;
  C.defaults.plugins.legend.labels.boxHeight = 10;
  C.defaults.maintainAspectRatio = false;
}

function noChart(id, msg) {
  const c = document.getElementById(id);
  if (c) c.parentElement.innerHTML = `<div class="empty">${msg}</div>`;
}

function catChart(mk) {
  const data = byCategory(mk);
  if (!window.Chart) return noChart('ch-cat', 'Gráficos no disponibles sin conexión.');
  if (!data.length) return noChart('ch-cat', 'Sin gastos este mes.');
  const narrow = innerWidth < 520;
  charts.push(new Chart(document.getElementById('ch-cat'), {
    type: 'doughnut',
    data: { labels: data.map(d => d[0]), datasets: [{ data: data.map(d => Math.round(d[1])), backgroundColor: palette(data.length), borderColor: css('--surface'), borderWidth: 2 }] },
    options: {
      cutout: '62%',
      plugins: {
        legend: { position: narrow ? 'bottom' : 'right' },
        tooltip: { callbacks: { label: c => ` ${c.label}: ${fmt(c.raw)}` } }
      }
    }
  }));
}

function monthsChart(mk) {
  if (!window.Chart) return noChart('ch-months', 'Gráficos no disponibles sin conexión.');
  const months = Array.from({ length: 6 }, (_, i) => shiftMonth(mk, i - 5));
  const t = months.map(totals);
  charts.push(new Chart(document.getElementById('ch-months'), {
    type: 'bar',
    data: {
      labels: months.map(m => monthName(m, true)),
      datasets: [
        { label: 'Ingresos', data: t.map(x => Math.round(x.inc)), backgroundColor: css('--income'), borderRadius: 4 },
        { label: 'Gastos', data: t.map(x => Math.round(x.exp)), backgroundColor: css('--expense'), borderRadius: 4 }
      ]
    },
    options: {
      plugins: { legend: { position: 'bottom' }, tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${fmt(c.raw)}` } } },
      scales: { y: { ticks: { callback: v => fmt(v).replace(/\s/g, '') } }, x: { grid: { display: false } } }
    }
  }));
}

function doneChart() {
  if (!window.Chart) return noChart('ch-done', 'Gráficos no disponibles sin conexión.');
  const start = parseDate(today());
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7)); // lunes de esta semana
  const weeks = Array.from({ length: 8 }, (_, i) => { const d = new Date(start); d.setDate(d.getDate() - (7 - i) * 7 + 7); return d; });
  const count = area => weeks.map((w, i) => {
    const from = w.getTime(), to = i < 7 ? weeks[i + 1].getTime() : Infinity;
    return live(state.tasks).filter(t => t.area === area && t.status === 'done' && t.doneAt >= from && t.doneAt < to).length;
  });
  charts.push(new Chart(document.getElementById('ch-done'), {
    type: 'bar',
    data: {
      labels: weeks.map(w => w.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })),
      datasets: [
        { label: 'Laburo', data: count('work'), backgroundColor: css('--c4'), borderRadius: 4 },
        { label: 'Personal', data: count('personal'), backgroundColor: css('--c1'), borderRadius: 4 }
      ]
    },
    options: {
      plugins: { legend: { position: 'bottom' } },
      scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, beginAtZero: true, ticks: { precision: 0 } } }
    }
  }));
}

const AFTER = {
  home() { if (window.Chart) chartDefaults(); catChart(thisMonth()); doneChart(); },
  money() { if (window.Chart) chartDefaults(); catChart(ui.month); monthsChart(ui.month); }
};

// ---------- modal ----------
let modalSubmit = null;

function openModal(title, body, onSubmit, extra = '') {
  const f = $('#modal-form');
  f.innerHTML = `<header><h2>${title}</h2><button type="button" class="icon-btn" data-action="closeModal" aria-label="Cerrar">✕</button></header>
    <div class="modal-body">${body}</div>
    <footer>${extra}<span class="spacer"></span><button type="button" class="btn ghost" data-action="closeModal">Cancelar</button><button class="btn primary">Guardar</button></footer>`;
  modalSubmit = onSubmit;
  $('#modal').showModal();
  const first = f.querySelector('.modal-body input:not([type=radio]), .modal-body textarea');
  if (first && matchMedia('(pointer: fine)').matches) first.focus();
}

function closeModal() { $('#modal').close(); modalSubmit = null; }

$('#modal-form').addEventListener('submit', e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  if (modalSubmit && modalSubmit(data) !== false) { closeModal(); render(); }
});

const datalist = (id, items) => `<datalist id="${id}">${items.map(c => `<option value="${esc(c)}">`).join('')}</datalist>`;
const currencySel = cur => `<select name="currency"><option value="ARS" ${cur !== 'USD' ? 'selected' : ''}>$ ARS</option><option value="USD" ${cur === 'USD' ? 'selected' : ''}>US$ USD</option></select>`;

function txForm(t) {
  const isNew = !t.id;
  t = { type: 'expense', currency: 'ARS', date: today(), ...t };
  openModal(isNew ? 'Nuevo movimiento' : 'Editar movimiento', `
    <div class="fields">
      <div class="seg">
        <input type="radio" name="type" id="ty-e" value="expense" ${t.type === 'expense' ? 'checked' : ''}><label for="ty-e">Gasto</label>
        <input type="radio" name="type" id="ty-i" value="income" ${t.type === 'income' ? 'checked' : ''}><label for="ty-i">Ingreso</label>
      </div>
      <div class="fields two">
        <label class="field"><span>Monto</span><input name="amount" type="number" inputmode="decimal" min="0" step="0.01" required value="${esc(t.amount ?? '')}"></label>
        <label class="field"><span>Moneda</span>${currencySel(t.currency)}</label>
      </div>
      <div class="fields two">
        <label class="field"><span>Categoría</span><input name="category" list="cats" required value="${esc(t.category ?? '')}" placeholder="Ej: Súper"></label>
        <label class="field"><span>Fecha</span><input name="date" type="date" required value="${esc(t.date)}"></label>
      </div>
      <label class="field"><span>Nota (opcional)</span><input name="note" value="${esc(t.note ?? '')}" placeholder="Ej: Verdulería"></label>
    </div>
    ${datalist('cats', categories(t.type))}`,
  d => {
    upsert('tx', { ...t, ...d, amount: +d.amount, category: d.category.trim(), note: d.note.trim(), id: t.id || uid(), createdAt: t.createdAt || Date.now() });
    toast(isNew ? 'Movimiento guardado' : 'Cambios guardados');
    checkBudgetAlert(d);
  },
  isNew ? '' : `<button type="button" class="btn danger ghost" data-action="deleteTx" data-id="${t.id}">Eliminar</button>`);
  // al cambiar tipo, cambian las categorías sugeridas
  document.querySelectorAll('#modal input[name=type]').forEach(r => r.addEventListener('change', () => {
    $('#cats').innerHTML = categories(r.value).map(c => `<option value="${esc(c)}">`).join('');
  }));
}

function checkBudgetAlert(d) {
  if (d.type !== 'expense') return;
  const b = live(state.budgets).find(b => b.category.toLowerCase() === d.category.trim().toLowerCase());
  if (!b) return;
  const spent = Object.fromEntries(byCategory(d.date.slice(0, 7)))[b.category] || 0;
  const p = spent / b.amount * 100;
  if (p > 100) Reminders.notifyNow('Te pasaste del presupuesto', `${b.category}: ${fmt(spent)} de ${fmt(+b.amount)}`, `budget:${b.id}:${d.date.slice(0, 7)}:over`);
  else if (p >= 80) Reminders.notifyNow('Ojo con el presupuesto', `${b.category}: ya usaste el ${Math.round(p)}%`, `budget:${b.id}:${d.date.slice(0, 7)}:80`);
}

function budgetForm(b = {}) {
  const isNew = !b.id;
  openModal(isNew ? 'Nuevo presupuesto' : 'Editar presupuesto', `
    <div class="fields">
      <label class="field"><span>Categoría</span><input name="category" list="bcats" required value="${esc(b.category ?? '')}" placeholder="Ej: Salidas"></label>
      <label class="field"><span>Tope mensual (en pesos)</span><input name="amount" type="number" inputmode="decimal" min="1" step="1" required value="${esc(b.amount ?? '')}"></label>
    </div>${datalist('bcats', categories('expense'))}`,
  d => { upsert('budgets', { ...b, category: d.category.trim(), amount: +d.amount, id: b.id || uid() }); toast('Presupuesto guardado'); },
  isNew ? '' : `<button type="button" class="btn danger ghost" data-action="deleteBudget" data-id="${b.id}">Eliminar</button>`);
}

function billForm(b = {}) {
  const isNew = !b.id;
  b = { currency: 'ARS', day: 10, category: 'Servicios', paid: [], ...b };
  openModal(isNew ? 'Nuevo gasto fijo' : 'Editar gasto fijo', `
    <div class="fields">
      <label class="field"><span>Nombre</span><input name="name" required value="${esc(b.name ?? '')}" placeholder="Ej: Alquiler, Luz, Tarjeta"></label>
      <div class="fields two">
        <label class="field"><span>Monto</span><input name="amount" type="number" inputmode="decimal" min="0" step="0.01" required value="${esc(b.amount ?? '')}"></label>
        <label class="field"><span>Moneda</span>${currencySel(b.currency)}</label>
      </div>
      <div class="fields two">
        <label class="field"><span>Vence el día</span><input name="day" type="number" min="1" max="31" required value="${esc(b.day)}"></label>
        <label class="field"><span>Categoría</span><input name="category" list="fcats" value="${esc(b.category)}"></label>
      </div>
      <p class="help muted" style="margin:0;font-size:13px">Cuando lo marques como pagado se carga solo como gasto del mes.</p>
    </div>${datalist('fcats', categories('expense'))}`,
  d => { upsert('bills', { ...b, name: d.name.trim(), amount: +d.amount, currency: d.currency, day: Math.min(31, Math.max(1, +d.day)), category: d.category.trim() || 'Servicios', id: b.id || uid() }); toast('Gasto fijo guardado'); },
  isNew ? '' : `<button type="button" class="btn danger ghost" data-action="deleteBill" data-id="${b.id}">Eliminar</button>`);
}

function taskForm(t = {}) {
  const isNew = !t.id;
  t = { area: view === 'personal' ? 'personal' : 'work', priority: 'media', status: 'todo', due: '', notes: '', ...t };
  openModal(isNew ? 'Nueva tarea' : 'Tarea', `
    <div class="fields">
      <label class="field"><span>Título</span><input name="title" required value="${esc(t.title ?? '')}"></label>
      <div class="seg">
        <input type="radio" name="area" id="ar-w" value="work" ${t.area === 'work' ? 'checked' : ''}><label for="ar-w">💼 Laburo</label>
        <input type="radio" name="area" id="ar-p" value="personal" ${t.area === 'personal' ? 'checked' : ''}><label for="ar-p">🌱 Personal</label>
      </div>
      <div class="fields two">
        <label class="field"><span>Fecha</span><input name="due" type="date" value="${esc(t.due)}"></label>
        <label class="field"><span>Prioridad</span><select name="priority">${Object.entries(PRIO).map(([k, v]) => `<option value="${k}" ${t.priority === k ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
      </div>
      <label class="field"><span>Estado</span><select name="status">
        <option value="todo" ${t.status === 'todo' ? 'selected' : ''}>Pendiente</option>
        <option value="doing" ${t.status === 'doing' ? 'selected' : ''}>En curso</option>
        <option value="done" ${t.status === 'done' ? 'selected' : ''}>Hecha</option>
      </select></label>
      <label class="field"><span>Notas</span><textarea name="notes" placeholder="Detalles, links, pasos…">${esc(t.notes)}</textarea></label>
    </div>`,
  d => {
    const doneAt = d.status === 'done' ? (t.status === 'done' ? t.doneAt : Date.now()) : null;
    upsert('tasks', { ...t, ...d, title: d.title.trim(), doneAt, id: t.id || uid(), createdAt: t.createdAt || Date.now() });
    toast(isNew ? 'Tarea agregada' : 'Tarea guardada');
  },
  isNew ? '' : `<button type="button" class="btn danger ghost" data-action="deleteTask" data-id="${t.id}">Eliminar</button>`);
}

// ---------- acciones ----------
const find = (coll, id) => state[coll].find(x => x.id === id);

const ACTIONS = {
  go: d => go(d.view),
  closeModal,
  month: d => { ui.month = shiftMonth(ui.month, +d.d); render(); },
  filter: d => { ui.filter[d.area] = d.f; render(); },

  newTx: d => txForm({ type: d.type }),
  editTx: d => txForm({ ...find('tx', d.id) }),
  deleteTx: d => { remove('tx', d.id); closeModal(); render(); toast('Movimiento eliminado'); },

  newBudget: () => budgetForm(),
  editBudget: d => budgetForm({ ...find('budgets', d.id) }),
  deleteBudget: d => { remove('budgets', d.id); closeModal(); render(); },

  newBill: () => billForm(),
  editBill: d => billForm({ ...find('bills', d.id) }),
  deleteBill: d => { remove('bills', d.id); closeModal(); render(); },
  payBill: d => {
    const b = find('bills', d.id);
    const paid = [...new Set([...(b.paid || []), d.month])];
    const date = d.month === thisMonth() ? today() : billDue(b, d.month);
    const txId = uid();
    upsert('tx', { id: txId, type: 'expense', amount: +b.amount, currency: b.currency, category: b.category || 'Servicios', note: b.name, date, createdAt: Date.now(), billId: b.id });
    upsert('bills', { ...b, paid, txByMonth: { ...(b.txByMonth || {}), [d.month]: txId } });
    render();
    toast(`${b.name}: marcado como pagado`);
  },
  unpayBill: d => {
    const b = find('bills', d.id);
    const txId = b.txByMonth?.[d.month];
    if (txId) remove('tx', txId);
    const txByMonth = { ...(b.txByMonth || {}) };
    delete txByMonth[d.month];
    upsert('bills', { ...b, paid: (b.paid || []).filter(m => m !== d.month), txByMonth });
    render();
  },

  newTask: d => taskForm({ area: d.area }),
  editTask: d => taskForm({ ...find('tasks', d.id) }),
  deleteTask: d => { remove('tasks', d.id); closeModal(); render(); toast('Tarea eliminada'); },
  toggleTask: d => {
    const t = find('tasks', d.id);
    const done = t.status !== 'done';
    upsert('tasks', { ...t, status: done ? 'done' : 'todo', doneAt: done ? Date.now() : null });
    render();
    if (done) toast('¡Hecho! ✓');
  },

  editRate: () => {
    openModal('Cotización del dólar', `<label class="field"><span>1 USD = ? ARS</span><input name="rate" type="number" min="0" step="0.01" required value="${esc(state.settings.rate)}"></label>`,
      d => { setSettings({ rate: +d.rate }); toast('Cotización actualizada'); });
  },
  saveName: () => { setSettings({ name: $('#set-name').value.trim() }); toast('Listo'); },
  saveRate: () => { setSettings({ rate: +$('#set-rate').value || 0 }); toast('Cotización actualizada'); },

  askNotif: async () => {
    if (!('Notification' in window)) return toast('Este navegador no soporta notificaciones');
    const p = await Notification.requestPermission();
    if (p === 'granted') { await Reminders.enableBackground(); Reminders.notifyNow('¡Listo! 🔔', 'Vas a recibir tus avisos acá.', 'welcome'); }
    render();
  },
  testNotif: () => Reminders.notifyNow('Así se ven los avisos', 'Resumen, tareas, pagos y recordatorio de gastos.', 'test:' + Date.now()),
  toggleNotif: (d, el) => setSettings({ notif: { ...state.settings.notif, [d.key]: el.checked } }),

  install: async () => { await Install.prompt?.prompt(); Install.prompt = null; render(); },

  exportData: () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `mi-espacio-${today()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  },
  wipe: () => {
    if (!confirm('¿Borrar todos los datos guardados en este dispositivo? Si tenés la nube activada, se vuelven a bajar al iniciar sesión.')) return;
    localStorage.removeItem(LS_DATA);
    state = blank();
    Reminders.refresh();
    render();
    toast('Datos borrados de este dispositivo');
  },

  cloudSave: () => Sync.saveConfig($('#cl-url').value.trim(), $('#cl-key').value.trim()),
  cloudForget: () => Sync.saveConfig('', ''),
  sendCode: () => Sync.sendCode($('#cl-email').value.trim()),
  verifyCode: () => Sync.verify($('#cl-code').value.trim()),
  syncNow: () => Sync.pull(true),
  logout: () => Sync.logout()
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!el || el.tagName === 'SELECT' || (el.tagName === 'INPUT' && el.type === 'checkbox')) return;
  const fn = ACTIONS[el.dataset.action];
  if (!fn) return;
  e.preventDefault();
  e.stopPropagation();
  fn(el.dataset, el);
});

document.addEventListener('change', e => {
  const el = e.target;
  if (el.id === 'import-file' && el.files[0]) {
    el.files[0].text().then(txt => {
      try { state = merge(state, normalize(JSON.parse(txt))); save(); render(); toast('Datos importados'); }
      catch { toast('Ese archivo no es una copia válida'); }
    });
    return;
  }
  if (el.dataset.action === 'toggleNotif') ACTIONS.toggleNotif(el.dataset, el);
  if (el.dataset.action === 'setHour') { setSettings({ [el.name]: +el.value }); toast('Guardado'); }
});

document.addEventListener('submit', e => {
  const f = e.target;
  if (!f.dataset.quick) return;
  e.preventDefault();
  const d = Object.fromEntries(new FormData(f));
  if (!d.title.trim()) return;
  upsert('tasks', { id: uid(), area: f.dataset.quick, title: d.title.trim(), due: d.due, priority: d.priority, status: 'todo', notes: '', createdAt: Date.now() });
  render();
  $(`form[data-quick] input[name=title]`)?.focus();
});

document.querySelector('.nav').addEventListener('click', e => {
  const b = e.target.closest('[data-view]');
  if (b) go(b.dataset.view);
});

// ---------- recordatorios / notificaciones ----------
// La página arma la lista de avisos de hoy y mañana y la deja en Cache Storage,
// donde el service worker también la puede leer (sincronización periódica en Android).
const REM_CACHE = 'miespacio-reminders';

const Reminders = {
  build() {
    const s = state.settings, n = s.notif, out = [];
    const t = today();
    for (const day of [t, addDays(t, 1)]) {
      const at = h => { const d = parseDate(day); d.setHours(+h, 0, 0, 0); return d.getTime(); };
      const pending = live(state.tasks).filter(x => x.status !== 'done');
      const dueBy = pending.filter(x => x.due && x.due <= day);
      const dueNext = pending.filter(x => x.due === addDays(day, 1));
      const bills = upcomingBills(+s.billDaysBefore, day);

      if (n.summary) {
        const w = dueBy.filter(x => x.area === 'work').length, p = dueBy.filter(x => x.area === 'personal').length;
        const parts = [];
        if (w) parts.push(`💼 ${w} de laburo`);
        if (p) parts.push(`🌱 ${p} personal${p > 1 ? 'es' : ''}`);
        if (bills.length) parts.push(`💸 ${bills.length} pago${bills.length > 1 ? 's' : ''} cerca`);
        out.push({ key: `summary:${day}`, at: at(s.summaryHour), title: 'Buen día ☀️ Esto es lo de hoy',
          body: parts.length ? parts.join(' · ') : 'Día libre de pendientes 🎉' });
      }
      if (n.tasks && (dueBy.length || dueNext.length)) {
        const names = l => l.slice(0, 3).map(x => x.title).join(', ') + (l.length > 3 ? ` y ${l.length - 3} más` : '');
        const body = [dueBy.length && `Hoy: ${names(dueBy)}`, dueNext.length && `Mañana: ${names(dueNext)}`].filter(Boolean).join(' · ');
        out.push({ key: `tasks:${day}`, at: at(s.taskHour), title: 'Tareas que vencen', body });
      }
      if (n.bills) {
        for (const b of bills) {
          const d = daysBetween(day, b.due);
          const when = d < 0 ? 'está vencido' : d === 0 ? 'vence hoy' : d === 1 ? 'vence mañana' : `vence en ${d} días`;
          out.push({ key: `bill:${b.id}:${b.month}:${day}`, at: at(s.summaryHour) + 60e3, title: `💸 ${b.name} ${when}`, body: `${fmt(+b.amount, b.currency)} · día ${b.day}` });
        }
      }
      if (n.evening && !live(state.tx).some(x => x.date === day)) {
        out.push({ key: `evening:${day}`, at: at(s.eveningHour), title: '¿Cargaste tus gastos de hoy? 💸', body: 'Tomate un minuto para anotarlos.' });
      }
    }
    return out;
  },

  async cache() { return 'caches' in window ? caches.open(REM_CACHE) : null; },
  async fired() {
    const c = await this.cache();
    const r = c && await c.match('fired');
    return r ? r.json() : [];
  },
  async setFired(list) {
    const c = await this.cache();
    if (c) await c.put('fired', new Response(JSON.stringify(list.slice(-300))));
  },

  async refresh() {
    try {
      const c = await this.cache();
      if (c) await c.put('reminders', new Response(JSON.stringify(this.build())));
    } catch { /* sin Cache Storage */ }
    this.check();
  },

  async show(title, body, tag) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const reg = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : null;
    const opts = { body, tag, icon: 'icon-192.png', badge: 'icon-192.png', data: { url: location.href.split('#')[0] } };
    if (reg) return reg.showNotification(title, opts);
    new Notification(title, opts);
  },

  async notifyNow(title, body, key) {
    const fired = await this.fired();
    if (fired.includes(key)) return;
    await this.show(title, body, key);
    await this.setFired([...fired, key]);
  },

  async check() {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const fired = await this.fired();
    const now = Date.now(), t = today();
    let changed = false;
    for (const r of this.build()) {
      if (fired.includes(r.key) || now < r.at || dstr(new Date(r.at)) !== t) continue;
      await this.show(r.title, r.body, r.key);
      fired.push(r.key);
      changed = true;
    }
    if (changed) await this.setFired(fired);
  },

  async enableBackground() {
    try {
      const reg = await navigator.serviceWorker?.ready;
      if (!reg?.periodicSync) return;
      const st = await navigator.permissions.query({ name: 'periodic-background-sync' });
      if (st.state === 'granted') await reg.periodicSync.register('miespacio-reminders', { minInterval: 60 * 60 * 1000 });
    } catch { /* no soportado */ }
  }
};

// ---------- nube (Supabase) ----------
const Sync = {
  sb: null, user: null, status: 'off', error: '', last: 0, timer: null, codeSent: false,

  config() {
    let c = {};
    try { c = JSON.parse(localStorage.getItem(LS_CLOUD)) || {}; } catch { }
    const def = window.MI_ESPACIO_CLOUD || {};
    return { url: c.url || def.url || '', key: c.key || def.key || '', fromFile: !c.url && !!def.url };
  },

  async init() {
    const c = this.config();
    if (!c.url || !c.key) { this.status = 'off'; this.badge(); return; }
    try {
      const { createClient } = await import(SUPABASE_URL);
      this.sb = createClient(c.url, c.key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'miespacio-auth' } });
      const { data } = await this.sb.auth.getSession();
      this.user = data.session?.user || null;
      this.status = this.user ? 'ok' : 'login';
      this.sb.auth.onAuthStateChange((_e, session) => {
        const was = this.user?.id;
        this.user = session?.user || null;
        this.status = this.user ? 'ok' : 'login';
        if (this.user && this.user.id !== was) this.pull();
        if (view === 'settings') render(); else this.badge();
      });
      if (this.user) await this.pull();
    } catch (e) {
      this.status = 'error';
      this.error = navigator.onLine ? (e.message || String(e)) : 'Sin conexión';
    }
    this.badge();
  },

  // Baja lo de la nube, lo combina con lo local y sube el resultado.
  async pull(manual) {
    if (!this.sb || !this.user) return;
    this.status = 'syncing'; this.badge();
    try {
      const { data, error } = await this.sb.from(TABLE).select('data').eq('user_id', this.user.id).maybeSingle();
      if (error) throw error;
      const before = JSON.stringify(state);
      if (data?.data) state = merge(state, normalize(data.data));
      const changed = JSON.stringify(state) !== before;
      persistLocal();
      const up = await this.sb.from(TABLE).upsert({ user_id: this.user.id, data: state, updated_at: new Date().toISOString() });
      if (up.error) throw up.error;
      this.status = 'ok'; this.error = ''; this.last = Date.now();
      if (changed) { Reminders.refresh(); if (!$('#modal').open && !document.activeElement?.matches('input, textarea')) render(); }
      if (manual) toast('Sincronizado ✓');
    } catch (e) {
      this.status = 'error';
      this.error = e.message || String(e);
      if (manual) toast('No se pudo sincronizar');
    }
    this.badge();
    if (view === 'settings' && manual) render();
  },

  queue() {
    if (!this.sb || !this.user) return;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.pull(), 1200);
  },

  badge() {
    const dot = $('#sync-dot');
    if (!dot) return;
    dot.className = 'sync-dot ' + (this.status === 'off' ? '' : this.status);
    dot.title = { ok: 'Sincronizado', syncing: 'Sincronizando…', error: 'Error de sincronización', login: 'Falta iniciar sesión', off: '' }[this.status];
  },

  saveConfig(url, key) {
    if (url && !/^https:\/\/.+/.test(url)) return toast('La URL tiene que empezar con https://');
    if (url) localStorage.setItem(LS_CLOUD, JSON.stringify({ url, key }));
    else localStorage.removeItem(LS_CLOUD);
    toast(url ? 'Conectando…' : 'Nube desconectada');
    setTimeout(() => location.reload(), 500);
  },

  async sendCode(email) {
    if (!email) return toast('Escribí tu email');
    ui.otpEmail = email;
    const { error } = await this.sb.auth.signInWithOtp({ email, options: { emailRedirectTo: location.href.split('#')[0] } });
    if (error) return toast('Error: ' + error.message);
    this.codeSent = true;
    toast('Te mandamos un mail ✉️');
    render();
  },

  async verify(code) {
    if (!code) return toast('Escribí el código del mail');
    const { error } = await this.sb.auth.verifyOtp({ email: ui.otpEmail, token: code, type: 'email' });
    if (error) return toast('Código inválido o vencido');
    this.codeSent = false;
    toast('¡Sesión iniciada!');
  },

  async logout() {
    await this.sb?.auth.signOut();
    this.user = null; this.status = 'login';
    render();
    toast('Sesión cerrada (tus datos siguen en este dispositivo)');
  },

  panel() {
    const c = this.config();
    if (!c.url || !c.key) {
      return `<h2>Nube y sincronización</h2>
        <p class="help">Para ver lo mismo en la compu y el celu, conectá un proyecto gratuito de Supabase (los pasos están en el README). Mientras tanto, todo se guarda en este dispositivo.</p>
        <div class="fields">
          <label class="field"><span>Project URL</span><input id="cl-url" placeholder="https://xxxx.supabase.co"></label>
          <label class="field"><span>Anon key</span><input id="cl-key" placeholder="eyJhbGciOi…"></label>
          <div><button class="btn primary" data-action="cloudSave">Conectar</button></div>
        </div>`;
    }
    const forget = c.fromFile ? '' : '<button class="btn ghost sm" data-action="cloudForget">Desconectar proyecto</button>';
    if (this.status === 'error' && !this.sb) {
      return `<h2>Nube y sincronización</h2><p class="help">No se pudo conectar: ${esc(this.error)}</p>${forget}`;
    }
    if (!this.user) {
      return `<h2>Nube y sincronización</h2>
        <p class="help">Entrá con tu email. Cada una usa su propio mail y ve solo sus datos. Te llega un código (o un link) para entrar.</p>
        <div class="fields">
          <div class="inline"><input id="cl-email" type="email" placeholder="tu@email.com" value="${esc(ui.otpEmail)}"><button class="btn primary" data-action="sendCode">Enviar código</button></div>
          ${this.codeSent ? '<div class="inline"><input id="cl-code" inputmode="numeric" autocomplete="one-time-code" placeholder="Código del mail"><button class="btn" data-action="verifyCode">Entrar</button></div>' : ''}
          <div>${forget}</div>
        </div>`;
    }
    const st = { ok: `✅ Sincronizado${this.last ? ' · ' + new Date(this.last).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : ''}`, syncing: 'Sincronizando…', error: `⚠️ ${esc(this.error)}` }[this.status] || '';
    return `<h2>Nube y sincronización</h2>
      <p class="help">Conectada como <strong>${esc(this.user.email)}</strong><br>${st}</p>
      <div class="inline"><button class="btn" data-action="syncNow">Sincronizar ahora</button><button class="btn ghost" data-action="logout">Cerrar sesión</button>${forget}</div>`;
  }
};

// ---------- instalación y arranque ----------
const Install = { prompt: null };
addEventListener('beforeinstallprompt', e => { e.preventDefault(); Install.prompt = e; if (view === 'settings') render(); });

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').then(() => {
    if (window.Notification?.permission === 'granted') Reminders.enableBackground();
  }).catch(() => { });
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  Reminders.refresh();
  Sync.pull();
  if (view === 'home' && !$('#modal').open) render();
});
addEventListener('hashchange', () => {
  const v = location.hash.slice(1);
  if (v !== view && VIEWS[v]) { view = v; render(); }
});
setInterval(() => Reminders.check(), 60e3);
addEventListener('online', () => Sync.pull());

// Chart.js se carga con defer; si todavía no llegó al primer render, se vuelve a dibujar.
render();
if (!window.Chart) addEventListener('load', () => { if (window.Chart && AFTER[view]) render(); });
Reminders.refresh();
Sync.init();
