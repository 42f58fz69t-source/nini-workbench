/* ============================================
   妮妮的工作台  —  app.js
   纯本地存储 PWA，响应式分栏布局
   ============================================ */

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const todayStr = () => new Date().toISOString().slice(0, 10);
const fmtDate = (d) => {
  const dt = typeof d === 'string' ? new Date(d) : d;
  return `${dt.getMonth() + 1}月${dt.getDate()}日`;
};
const fmtDateFull = (d) => {
  const dt = typeof d === 'string' ? new Date(d) : d;
  const w = '日一二三四五六'[dt.getDay()];
  return `${dt.getFullYear()}年${dt.getMonth() + 1}月${dt.getDate()}日 周${w}`;
};
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const isWide = () => window.innerWidth >= 768;

/* ---------- Storage ---------- */
const DB = {
  get(key, def) {
    try { const v = localStorage.getItem('nn_' + key); return v ? JSON.parse(v) : def; }
    catch { return def; }
  },
  set(key, val) { localStorage.setItem('nn_' + key, JSON.stringify(val)); },
  remove(key) { localStorage.removeItem('nn_' + key); },
  all() {
    const out = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k.startsWith('nn_')) { try { out[k.slice(3)] = JSON.parse(localStorage.getItem(k)); } catch {} }
    }
    return out;
  }
};

/* ---------- Toast ---------- */
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 1800);
}

/* ---------- Modal ---------- */
function openModal(html) {
  $('#modal').innerHTML = '<div class="modal-handle"></div>' + html;
  $('#modalOverlay').classList.add('show');
}
function closeModal() { $('#modalOverlay').classList.remove('show'); }
$('#modalOverlay')?.addEventListener('click', (e) => {
  if (e.target === $('#modalOverlay')) closeModal();
});

/* ---------- SVG icons ---------- */
const ICONS = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1V9.5z" stroke-linejoin="round"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke-linecap="round"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" stroke-linejoin="round"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke-linejoin="round"/></svg>',
  wallet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7h18v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7zM3 7l2-3h12l2 3M16 13h2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  run: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13" cy="4" r="2"/><path d="M5 19l3-5 4 2 2-5 4 3M9 11l-2-3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7l3-7z" stroke-linejoin="round"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" stroke-linejoin="round"/></svg>',
  flame: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2s4 4 4 8a4 4 0 0 1-8 0c0-2 1-3 1-3s-3 2-3 6a6 6 0 0 0 12 0c0-6-6-11-6-11z" stroke-linejoin="round"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg>',
  chevL: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  chevR: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke-linejoin="round"/></svg>',
  news: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2M18 14h-8M18 10h-8M18 18h-8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18zM2 2l7.5 7.5M11 11a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6M1 20v-6h6M3.5 9a9 9 0 0 1 14.8-3.4L23 10M1 14l4.7 4.4A9 9 0 0 0 20.5 15" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18" stroke-linecap="round"/></svg>',
};

/* ============================================
   Module registry — 便于动态增删
   ============================================ */
const MODULES = [
  { id: 'home', icon: ICONS.home, color: '#7cb342', title: '首页', desc: '今日概览', group: 'main', builtIn: true },
  { id: 'donelist', icon: ICONS.list, color: '#66bb6a', title: 'Donelist', desc: '今日待办+回溯', group: 'daily', builtIn: true },
  { id: 'dailyread', icon: ICONS.news, color: '#4fc3f7', title: '每日必读', desc: '时政+申论背诵', group: 'study', builtIn: true, badge: '新' },
  { id: 'study', icon: ICONS.book, color: '#0ea5e9', title: '自考备考', desc: () => { const n = DB.get('subjects', []).length; return `${n}科 · 每日一练 · 本期3科`; }, group: 'study', builtIn: true },
  { id: 'sleep', icon: ICONS.moon, color: '#ab47bc', title: '作息打卡', desc: '睡眠+精力评分', group: 'health', builtIn: true },
  { id: 'sport', icon: ICONS.run, color: '#ef5350', title: '运动记录', desc: '运动类型+时长', group: 'health', builtIn: true },
  { id: 'cycle', icon: ICONS.heart, color: '#ec407a', title: '生理期管理', desc: '日历+智能预测', group: 'health', builtIn: true },
  { id: 'habits', icon: ICONS.flame, color: '#ffa726', title: '习惯打卡', desc: '长期坚持+连续天数', group: 'daily', builtIn: true },
  { id: 'money', icon: ICONS.wallet, color: '#8d6e63', title: '理财记账', desc: '随手记收支', group: 'life', builtIn: true },
  { id: 'wishes', icon: ICONS.star, color: '#ec407a', title: '愿望与人生项目', desc: '小想法到大目标', group: 'life', builtIn: true },
];

const GROUP_LABELS = { main: '常用', daily: '日常', study: '备考', health: '健康', work: '工作', life: '生活', custom: '我的模块' };

function getModules() {
  const custom = DB.get('customModules', []);
  return [...MODULES, ...custom];
}
function getModuleDef(id) {
  return getModules().find(m => m.id === id);
}

/* ============================================
   Page renderers
   ============================================ */
const PAGES = {
  home: () => Home.render(),
  donelist: () => Donelist.render(),
  sleep: () => Sleep.render(),
  study: () => Study.render(),
  backlog: () => Backlog.render(),
  money: () => Money.render(),
  sport: () => Sport.render(),
  wishes: () => Wishes.render(),
  cycle: () => Cycle.render(),
  habits: () => Habits.render(),
  dailyread: () => DailyRead.render(),
  settings: () => Settings.render(),
};

/* ============================================
   Navigation — responsive split
   ============================================ */
const Nav = {
  current: 'home',
  go(page) {
    Nav.current = page;
    if (Donelist.viewDate && page !== 'donelist') Donelist.viewDate = null;
    window.scrollTo(0, 0);
    Nav.refresh();
  },
  refresh() {
    Nav.renderSidebar();
    Nav.renderMain();
  },
  renderSidebar() {
    const mods = getModules();
    const groups = {};
    mods.forEach(m => { (groups[m.group] = groups[m.group] || []).push(m); });
    const groupOrder = ['main', 'daily', 'study', 'health', 'work', 'life', 'custom'];
    let html = `<div class="sb-header">
      <div class="logo"><span class="dora">🍃</span><span class="logo-text">妮妮的工作台</span></div>
      <div class="sub">All in One · 抹茶版</div>
    </div>`;
    groupOrder.forEach(g => {
      if (!groups[g]) return;
      html += `<div class="sb-section">${GROUP_LABELS[g] || g}</div>`;
      groups[g].forEach(m => {
        html += `<div class="sidebar-item ${Nav.current === m.id ? 'active' : ''}" onclick="Nav.go('${m.id}');Nav.closeSidebarMobile()">${m.icon}<span>${esc(m.title)}${m.badge ? ' <span style="font-size:9px;color:var(--accent)">●</span>' : ''}</span></div>`;
      });
    });
    html += `<div class="sb-section">系统</div>`;
    html += `<div class="sidebar-item ${Nav.current === 'settings' ? 'active' : ''}" onclick="Nav.go('settings');Nav.closeSidebarMobile()">${ICONS.settings}<span>设置</span></div>`;
    $('#sidebar').innerHTML = html;
  },
  renderMain() {
    const def = getModuleDef(Nav.current);
    const title = def ? def.title : (PAGES[Nav.current] ? (Nav.current === 'settings' ? '设置' : '') : '');
    const render = PAGES[Nav.current] || PAGES.home;
    const isHome = Nav.current === 'home';

    let topbar;
    if (isHome) {
      topbar = `<div class="topbar">
        <button class="menu-btn" onclick="Nav.toggleSidebar()" aria-label="菜单">${ICONS.menu || '☰'}</button>
        <h1>妮妮的工作台 🍃</h1>
        <div class="actions">
          <button class="icon-btn" onclick="Search.open()" title="搜索">🔍</button>
          <button class="icon-btn" onclick="Nav.go('settings')">${ICONS.settings}</button>
        </div>
      </div>`;
    } else {
      topbar = `<div class="topbar">
        <button class="menu-btn" onclick="Nav.toggleSidebar()" aria-label="菜单">${ICONS.menu || '☰'}</button>
        <button class="back-btn" onclick="Nav.go('home')">${ICONS.chevL}</button>
        <h1>${esc(title)}</h1>
        <div style="width:34px"></div>
      </div>`;
    }
    $('#app').innerHTML = topbar + `<div class="page active">${render()}</div>`;
  },
  toggleSidebar() {
    document.body.classList.toggle('sb-open');
  },
  closeSidebarMobile() {
    document.body.classList.remove('sb-open');
  },
  renderBottomNav() {
    return '';
  }
};

window.addEventListener('resize', () => { Nav.refresh(); });
// 回到前台/可见时自动刷新，确保"今天"等时间始终与真实时间同步
document.addEventListener('visibilitychange', () => { if (!document.hidden) Nav.refresh(); });
window.addEventListener('focus', () => Nav.refresh());
// 每分钟检查一次日期变化，跨过午夜时自动刷新
setInterval(() => {
  const now = new Date();
  if (now.getHours() === 0 && now.getMinutes() === 0) Nav.refresh();
}, 60000);

/* ============================================
   HOME
   ============================================ */
const Home = {
  render() {
    const todos = DB.get('donelist', []);
    const todayTodos = todos.filter(t => t.date === todayStr());
    const doneToday = todayTodos.filter(t => t.done).length;
    const sleep = DB.get('sleep', {});
    const todaySleep = sleep[todayStr()];
    const money = DB.get('money', []);
    const todayMoney = money.filter(m => m.date === todayStr());
    const expenseToday = todayMoney.filter(m => m.type === 'expense').reduce((s, m) => s + m.amount, 0);
    const habits = DB.get('habits', []);
    const habitsDone = habits.filter(h => (h.logs || []).includes(todayStr())).length;

    const hour = new Date().getHours();
    let greeting = '晚上好';
    if (hour < 6) greeting = '夜深了';
    else if (hour < 11) greeting = '早上好';
    else if (hour < 14) greeting = '中午好';
    else if (hour < 18) greeting = '下午好';

    let summary = '';
    if (todayTodos.length) summary += `今日待办 ${doneToday}/${todayTodos.length}　`;
    if (todaySleep && todaySleep.energy) summary += `精力 ${todaySleep.energy}/10　`;
    if (expenseToday) summary += `今日支出 ¥${expenseToday}　`;
    if (habits.length) summary += `习惯 ${habitsDone}/${habits.length}`;
    if (!summary) summary = '点击下方模块开始记录今天';

    const cycle = Cycle.getCurrentPhase();
    const cycleCard = cycle ? `
      <div class="phase-card" style="background: ${cycle.color}">
        <div class="phase-name">${cycle.name}</div>
        <div class="phase-desc">${cycle.desc}</div>
      </div>` : '';

    const exams = DB.get('exams', []).filter(e => e.date >= todayStr()).sort((a, b) => a.date.localeCompare(b.date));
    const examCard = exams.length ? (() => {
      const e = exams[0];
      const days = Math.ceil((new Date(e.date) - new Date(todayStr())) / 86400000);
      return `<div class="card" style="background:linear-gradient(135deg,#7cb342,#aed581);color:white;box-shadow:0 6px 24px rgba(124,179,66,0.3)">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div><div style="font-size:12px;opacity:0.92">🎯 最近考试 · ${esc(e.name)}</div><div style="font-size:28px;font-weight:800;margin-top:4px">${days} <span style="font-size:14px">天后</span></div><div style="font-size:11px;opacity:0.85;margin-top:2px">${fmtDate(e.date)}</div></div>
          <div style="font-size:42px">📚</div>
        </div>
      </div>`;
    })() : '';

    const doraLines = [
      '今天也要元气满满哦！',
      '努力的人运气不会太差~',
      '哆啦A梦说：梦想是要自己实现的！',
      '小新说：做错事要道歉，才是好孩子~',
      '休息一下也没关系，别太累啦',
    ];
    const doraLine = doraLines[new Date().getDate() % doraLines.length];

    const mods = getModules().filter(m => m.id !== 'home');
    const grid = mods.map(m => `
      <div class="grid-card" onclick="Nav.go('${m.id}')">
        ${m.badge ? `<span class="badge-new">${m.badge}</span>` : ''}
        <div class="icon-wrap" style="background:${m.color}">${m.icon}</div>
        <div class="title">${esc(m.title)}</div>
        <div class="desc">${esc(typeof m.desc === 'function' ? m.desc() : m.desc)}</div>
      </div>`).join('');

    const installBanner = (window._deferredPrompt && !DB.get('installed', false)) ? `
      <div class="install-banner">
        <span>📱 添加到主屏幕，像 App 一样使用</span>
        <button onclick="installApp()">安装</button>
        <span class="close" onclick="this.parentElement.style.display='none'">×</span>
      </div>` : '';

    return `
      ${installBanner}
      <div class="home-hero">
        <div class="date">${fmtDateFull(new Date())}</div>
        <div class="greeting">${greeting}，妮妮 👋</div>
        <div class="summary">${esc(summary)}</div>
        <div class="dora-line">🍃 ${doraLine}</div>
      </div>
      ${cycleCard}
      ${examCard}
      <div class="grid">${grid}</div>
    `;
  }
};

/* ============================================
   DONELIST
   ============================================ */
const Donelist = {
  viewDate: null,
  render() {
    const date = Donelist.viewDate || todayStr();
    const isToday = date === todayStr();
    const todos = DB.get('donelist', []).filter(t => t.date === date);
    const done = todos.filter(t => t.done).length;
    const backlog = DB.get('backlog', []);
    const later = backlog.filter(i => !i.done);
    const laterDone = backlog.filter(i => i.done);
    const all = [
      ...DB.get('donelist', []).map(t => ({ id: t.id, text: t.text, done: t.done, date: t.date, type: '待办' })),
      ...backlog.map(i => ({ id: i.id, text: i.text, done: i.done, date: i.createdAt ? new Date(i.createdAt).toISOString().slice(0,10) : todayStr(), type: '不急', note: i.note }))
    ].sort((a, b) => b.date.localeCompare(a.date) || (a.done === b.done ? 0 : a.done ? 1 : -1));
    const todoHtml = todos.length ? todos.map(t => `
      <div class="task-item ${t.done ? 'done' : ''}">
        <div class="checkbox ${t.done ? 'checked' : ''}" onclick="Donelist.toggle('${t.id}')">${ICONS.check}</div>
        <div class="task-text" onclick="Donelist.toggle('${t.id}')">${esc(t.text)}</div>
        <button class="task-delete" onclick="Donelist.edit('${t.id}')" style="color:var(--primary)">${ICONS.edit}</button>
        <button class="task-delete" onclick="Donelist.del('${t.id}')">${ICONS.trash}</button>
      </div>`).join('') : `<div class="empty"><div class="emoji">📝</div><div>${isToday ? '今天还没有待办' : '这一天没有记录'}</div></div>`;
    const laterHtml = later.length ? later.map(i => `
      <div class="task-item ${i.done ? 'done' : ''}">
        <div class="checkbox ${i.done ? 'checked' : ''}" onclick="Backlog.toggle('${i.id}')">${ICONS.check}</div>
        <div style="flex:1"><div class="task-text" onclick="Backlog.toggle('${i.id}')">${esc(i.text)}</div>${i.note ? `<div class="task-meta">${esc(i.note)}</div>` : ''}</div>
        <button class="task-delete" onclick="Backlog.edit('${i.id}')" style="color:var(--primary)">${ICONS.edit}</button>
        <button class="task-delete" onclick="Backlog.del('${i.id}')">${ICONS.trash}</button>
      </div>`).join('') : `<div class="empty"><div class="emoji">📋</div><div>没有不急的事项</div></div>`;
    const allHtml = all.length ? all.map(a => `
      <div class="task-item ${a.done ? 'done' : ''}">
        <div style="flex:1">
          <div class="task-text" style="font-size:14px">${esc(a.text)}</div>
          <div class="task-meta">${a.type} · ${fmtDate(a.date)}${a.note ? ' · ' + esc(a.note) : ''}</div>
        </div>
        <span class="badge gray" style="font-size:10px">${a.done ? '已完成' : '进行中'}</span>
      </div>`).join('') : `<div class="empty"><div class="emoji">📚</div><div>还没有任何事项</div></div>`;
    return `
      <div class="card">
        <div class="calendar-header" style="justify-content:center">
          <input type="date" id="dlDate" value="${date}" onchange="Donelist.pickDate(this.value)" style="border:1.5px solid var(--primary);border-radius:12px;padding:8px 14px;font-size:15px;font-weight:700;color:var(--primary-dark);text-align:center;background:var(--primary-soft);outline:none;cursor:pointer">
        </div>
        ${!isToday ? `<div style="text-align:center;margin-top:8px"><button class="btn small ghost" onclick="Donelist.viewDate='${todayStr()}';Nav.refresh()">回到今天</button></div>` : ''}
      </div>
      <div class="card">
        <div class="card-title"><span>✅ 每日待办 · ${done}/${todos.length}</span><a onclick="Donelist.add('daily')">+ 添加</a></div>
        ${todoHtml}
      </div>
      <div class="card">
        <div class="card-title"><span>📋 不急但要完成 · ${later.length}</span><a onclick="Donelist.add('later')">+ 添加</a></div>
        ${laterHtml}
        ${laterDone.length ? `<details style="margin-top:8px"><summary style="font-size:12px;color:var(--text-3);cursor:pointer">已完成 ${laterDone.length} 项</summary>${laterDone.map(i => `<div class="task-item done"><div class="checkbox checked">${ICONS.check}</div><div style="flex:1"><div class="task-text">${esc(i.text)}</div></div><button class="task-delete" onclick="Backlog.del('${i.id}')">${ICONS.trash}</button></div>`).join('')}</details>` : ''}
      </div>
      <div class="card">
        <div class="card-title"><span>📚 所有事项 · ${all.length}</span></div>
        <div style="max-height:420px;overflow-y:auto;-webkit-overflow-scrolling:touch">${allHtml}</div>
      </div>
    `;
  },
  pickDate(v) { Donelist.viewDate = v; Nav.refresh(); },
  shift(n) {
    const d = new Date(Donelist.viewDate || todayStr());
    d.setDate(d.getDate() + n);
    Donelist.viewDate = d.toISOString().slice(0, 10);
    Nav.refresh();
  },
  add(type) {
    if (type === 'later') {
      openModal(`<h3>添加不急事项</h3>
        <span class="label">事项</span><input class="input" id="blText" placeholder="不急但要完成的事">
        <span class="label">备注</span><input class="input" id="blNote" placeholder="截止时间、背景等">
        <button class="btn" onclick="Donelist.saveLater()">保存</button>`);
    } else {
      openModal(`<h3>添加每日待办</h3>
        <span class="label">日期</span>
        <input type="date" class="input" id="taskDate" value="${Donelist.viewDate || todayStr()}">
        <span class="label">任务内容（一行一个，可批量添加）</span>
        <textarea class="textarea" id="taskInput" placeholder="要做什么？" autofocus></textarea>
        <button class="btn" onclick="Donelist.save()">保存</button>`);
    }
  },
  save() {
    const text = $('#taskInput').value.trim();
    if (!text) return toast('请输入内容');
    const date = $('#taskDate').value || todayStr();
    const todos = DB.get('donelist', []);
    text.split('\n').filter(Boolean).forEach(line => {
      todos.push({ id: uid(), text: line.trim(), date, done: false, createdAt: Date.now() });
    });
    DB.set('donelist', todos);
    closeModal(); Nav.refresh(); toast('已添加');
  },
  saveLater() {
    const text = $('#blText').value.trim();
    if (!text) return toast('请输入内容');
    const items = DB.get('backlog', []);
    items.push({ id: uid(), text, note: $('#blNote').value.trim(), done: false, createdAt: Date.now() });
    DB.set('backlog', items);
    closeModal(); Nav.refresh(); toast('已加入不急事项');
  },
  toggle(id) {
    const todos = DB.get('donelist', []);
    const t = todos.find(x => x.id === id);
    if (t) { t.done = !t.done; DB.set('donelist', todos); if (t.done) PetCat.cheer('待办完成啦！🎉'); Nav.refresh(); }
  },
  del(id) {
    if (!confirm('确认删除这条任务？')) return;
    DB.set('donelist', DB.get('donelist', []).filter(t => t.id !== id));
    Nav.refresh(); toast('已删除');
  },
  edit(id) {
    const todos = DB.get('donelist', []);
    const t = todos.find(x => x.id === id);
    if (!t) return;
    openModal(`<h3>编辑任务</h3>
      <span class="label">日期</span>
      <input type="date" class="input" id="editDate" value="${t.date}">
      <span class="label">任务内容</span>
      <textarea class="textarea" id="editText">${esc(t.text)}</textarea>
      <label style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-2);margin:8px 0">
        <input type="checkbox" id="editDone" ${t.done ? 'checked' : ''}> 标记为已完成
      </label>
      <button class="btn" onclick="Donelist.saveEdit('${id}')">保存修改</button>
      <button class="btn secondary" onclick="Donelist.del('${id}');closeModal()" style="margin-top:8px">删除此任务</button>`);
  },
  saveEdit(id) {
    const todos = DB.get('donelist', []);
    const t = todos.find(x => x.id === id);
    if (!t) return;
    const text = $('#editText').value.trim();
    if (!text) return toast('请输入内容');
    t.text = text;
    t.date = $('#editDate').value || t.date;
    t.done = $('#editDone').checked;
    DB.set('donelist', todos);
    closeModal(); Nav.refresh(); toast('已保存修改');
  }
};

/* ============================================
   DAILY READ — 每日必读（时政+申论）
   ============================================ */
const DailyRead = {
  _tab: 'politics',
  _viewDate: null,
  _cache: {},
  _fetchedAt: {},
  render() {
    const date = DailyRead._viewDate || todayStr();
    const isToday = date === todayStr();
    const cached = DailyRead._cache[date];
    if (cached) return DailyRead._renderContent(date, cached);
    DailyRead._load(date);
    return DailyRead._renderLoading(date, isToday);
  },
  _renderLoading(date, isToday) {
    return `<div class="card"><div class="calendar-header">
        <button onclick="DailyRead.shift(-1)">${ICONS.chevL}</button>
        <div class="month">${isToday ? '今日必读' : fmtDate(date)}</div>
        <button onclick="DailyRead.shift(1)">${ICONS.chevR}</button>
      </div>${!isToday ? `<div style="text-align:center;margin-bottom:8px"><button class="btn small ghost" onclick="DailyRead._viewDate='${todayStr()}';Nav.refresh()">回到今天</button></div>` : ''}</div>
      <div class="card"><div style="text-align:center;padding:20px;color:var(--text-2)"><div class="emoji">👋</div>正在加载今日内容...</div></div>`;
  },
  _renderContent(date, data) {
    const isToday = date === todayStr();
    const fa = DailyRead._fetchedAt[date];
    const t = fa ? new Date(fa) : null;
    const timeStr = t ? `${t.getMonth()+1}/${t.getDate()} ${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')}` : '';
    const srcLabel = data._remote ? '远程' : '本地';
    return `
      <div class="card">
        <div class="calendar-header">
          <button onclick="DailyRead.shift(-1)">${ICONS.chevL}</button>
          <div class="month">${isToday ? '今日必读' : fmtDate(date)}</div>
          <button onclick="DailyRead.shift(1)">${ICONS.chevR}</button>
        </div>
        ${!isToday ? `<div style="text-align:center;margin-bottom:8px"><button class="btn small ghost" onclick="DailyRead._viewDate='${todayStr()}';Nav.refresh()">回到今天</button></div>` : ''}
        <div style="display:flex;justify-content:flex-end;margin-bottom:6px">
          <button class="refresh-btn" onclick="DailyRead.refresh('${date}')">${ICONS.refresh} 刷新</button>
        </div>
        ${fa ? `<div style="font-size:11px;color:var(--text-3);text-align:right;margin-bottom:8px">更新于 ${timeStr} · ${srcLabel}</div>` : ''}
      </div>
      <div class="card">
        <div class="segmented" id="readTab">
          <button class="${DailyRead._tab === 'politics' ? 'active' : ''}" onclick="DailyRead.setTab('politics')">📱 时政(${(data.politics||[]).length})</button>
          <button class="${DailyRead._tab === 'essay' ? 'active' : ''}" onclick="DailyRead.setTab('essay')">✍️ 申论</button>
          <button class="${DailyRead._tab === 'words' ? 'active' : ''}" onclick="DailyRead.setTab('words')">💎 好词好句</button>
          <button class="${DailyRead._tab === 'quiz' ? 'active' : ''}" onclick="DailyRead.setTab('quiz')">🧠 常识</button>
        </div>
        ${DailyRead._tab === 'politics' ? DailyRead._renderPolitics(data.politics||[]) : DailyRead._tab === 'essay' ? DailyRead._renderEssay(data.essay||{}) : DailyRead._tab === 'words' ? DailyRead._renderWords(date) : DailyRead._renderQuiz(date)}
      </div>
    `;
  },
  _renderPolitics(items) {
    if (!items.length) return `<div class="empty"><div class="emoji">📰</div><div>暂无时政内容</div></div>`;
    return items.map((item) => `
      <div class="read-item" style="padding:16px 0">
        <div class="read-body" style="font-size:15px;line-height:1.85;color:var(--text)">${DailyRead._renderBoldText(item.body || item.title || '')}</div>
      </div>`).join('') + `
      <div style="margin-top:12px;display:flex;gap:8px">
        <button class="btn secondary small" onclick="DailyRead.refresh('${DailyRead._viewDate || todayStr()}')">${ICONS.refresh} 重新抓取最新</button>
      </div>`;
  },
  _renderBoldText(text) {
    if (!text) return '';
    return text.replace(/\*\*(.+?)\*\*/g, '<u style="text-decoration:underline;text-decoration-color:var(--primary);text-underline-offset:3px;text-decoration-thickness:2px;font-weight:600">$1</u>');
  },
  _renderEssay(essay) {
    if (!essay || !essay.topic) return `<div class="empty"><div class="emoji">✍️</div><div>暂无申论内容</div></div>`;
    return `
      <div class="essay-box">
        <div class="topic-label">📚 今日话题</div>
        <div class="topic">${esc(essay.topic)}</div>
      </div>
      ${essay.source || essay.background ? `<div class="card" style="margin-top:8px">
        <div class="card-title"><span>📡 出处 / 背景</span></div>
        ${essay.source ? `<div style="font-size:13px;color:var(--primary-dark);font-weight:600;margin-bottom:8px;line-height:1.7">${esc(essay.source)}</div>` : ''}
        ${essay.background ? `<div style="font-size:13px;line-height:1.8;color:var(--text)">${esc(essay.background)}</div>` : ''}
      </div>` : ''}
      ${essay.core_quote ? `<div class="card" style="margin-top:8px">
        <div class="card-title"><span>📖 核心表述 / 原话</span></div>
        <div style="font-size:14px;line-height:1.9;color:var(--primary-dark);font-style:italic;padding:8px 12px;background:var(--primary-soft);border-radius:10px;border-left:3px solid var(--primary)">${esc(essay.core_quote)}</div>
      </div>` : ''}
      ${essay.significance ? `<div class="card" style="margin-top:8px">
        <div class="card-title"><span>🌟 政策意义</span></div>
        <div style="font-size:13px;line-height:1.8">${esc(essay.significance)}</div>
      </div>` : ''}
      ${(essay.measures || []).length ? `<div class="card" style="margin-top:8px">
        <div class="card-title"><span>📌 对策措施 / 规范表述</span></div>
        <div style="font-size:13px;line-height:2">${(essay.measures || []).map((m, i) => `<div>${i+1}. ${esc(m)}</div>`).join('')}</div>
      </div>` : ''}
      <div style="margin-top:12px;display:flex;gap:8px">
        <button class="btn secondary small" onclick="DailyRead.refresh('${DailyRead._viewDate || todayStr()}')">${ICONS.refresh} 重新抓取</button>
      </div>
    `;
  },
  _renderQuiz(date) {
    if (typeof COMMON_SENSE === 'undefined' || !COMMON_SENSE.length) return `<div class="empty"><div class="emoji">🧠</div><div>题库加载中</div></div>`;
    const seed = date.split('-').reduce((a, b) => a + parseInt(b), 0);
    const picks = [];
    const pool = COMMON_SENSE.slice();
    let idx = seed;
    while (picks.length < 3 && pool.length) {
      idx = (idx * 9301 + 49297) % 233280;
      const i = idx % pool.length;
      picks.push(pool.splice(i, 1)[0]);
    }
    return `<div style="font-size:12px;color:var(--text-2);margin-bottom:10px">每日3题 · 今日(${fmtDate(date)})</div>` + picks.map((q, i) => `
      <div class="read-item" id="quiz-${i}" style="padding:14px 0">
        <div class="read-title" style="margin-bottom:8px">${i+1}. ${esc(q.q)}</div>
        <div class="options">
          ${q.opts.map((o, j) => `<div class="opt" onclick="DailyRead.answerQuiz(${i},${j})">${String.fromCharCode(65+j)}. ${esc(o)}</div>`).join('')}
        </div>
        <div class="answer-reveal" id="ans-${i}" style="display:none;font-size:12px;color:var(--success);margin-top:8px;line-height:1.7">✅ 正确答案：${String.fromCharCode(65+q.answer)}. ${esc(q.opts[q.answer])}<br>💡 ${esc(q.tip)}</div>
      </div>`).join('');
  },
  answerQuiz(qi, oi) {
    if (typeof COMMON_SENSE === 'undefined') return;
    const date = DailyRead._viewDate || todayStr();
    const seed = date.split('-').reduce((a, b) => a + parseInt(b), 0);
    const picks = [];
    const pool = COMMON_SENSE.slice();
    let idx = seed;
    while (picks.length < 3 && pool.length) { idx = (idx * 9301 + 49297) % 233280; const i = idx % pool.length; picks.push(pool.splice(i, 1)[0]); }
    const q = picks[qi];
    if (!q) return;
    const opts = $$(`#quiz-${qi} .opt`);
    opts.forEach(o => o.classList.remove('correct', 'wrong'));
    opts[oi].classList.add(oi === q.answer ? 'correct' : 'wrong');
    if (oi !== q.answer) opts[q.answer].classList.add('correct');
    $(`#ans-${qi}`).style.display = 'block';
    if (oi === q.answer) PetCat.cheer('答对了！🎉');
  },
  _renderWords(date) {
    const dayIdx = Math.abs([...date].reduce((a, c) => a + c.charCodeAt(0), 0)) % GOODWORDS_DEFAULT.length;
    const daily = GOODWORDS_DEFAULT[dayIdx];
    const userWords = DB.get('goodwords', []);
    const userHtml = userWords.length ? userWords.slice().reverse().map(w => `
      <div class="essay-box" style="margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:start;gap:8px">
          <div style="font-weight:700;color:var(--primary-dark);font-size:15px">${esc(w.title)}</div>
          <button class="task-delete" onclick="DailyRead.delWord('${w.id}')">${ICONS.trash}</button>
        </div>
        <div style="font-size:13px;line-height:1.9;white-space:pre-wrap;margin-top:6px">${esc(w.content)}</div>
        <div style="font-size:11px;color:var(--text-3);margin-top:6px">${w.date}</div>
      </div>`).join('') : `<div class="empty" style="padding:16px"><div class="emoji">💎</div><div>还没有积累的好词好句，下面添加一条吧</div></div>`;
    return `
      <div class="essay-box" style="margin-bottom:12px">
        <div class="topic-label">📅 今日推送（${fmtDate(date)}）</div>
        <div class="topic">${esc(daily.title)}</div>
        <div style="font-size:13px;line-height:1.9;white-space:pre-wrap;margin-top:8px">${esc(daily.content)}</div>
      </div>
      <div class="card-title" style="margin-bottom:10px"><span>✏️ 我的积累（${userWords.length}）</span><a onclick="DailyRead.addWord()">+ 添加</a></div>
      ${userHtml}
    `;
  },
  addWord() {
    openModal(`<h3>添加好词好句</h3>
      <span class="label">话题标题</span><input class="input" id="gwTitle" placeholder="如：民生为本">
      <span class="label">内容（名言 + 解读，可多行）</span><textarea class="textarea" id="gwContent" placeholder="名言原文\n解读：适用主题..."></textarea>
      <button class="btn" onclick="DailyRead.saveWord()">保存</button>`);
  },
  saveWord() {
    const title = $('#gwTitle').value.trim();
    const content = $('#gwContent').value.trim();
    if (!title || !content) return toast('请填写标题和内容');
    const words = DB.get('goodwords', []);
    words.push({ id: uid(), title, content, date: todayStr() });
    DB.set('goodwords', words);
    closeModal(); DailyRead.setTab('words'); Nav.refresh(); toast('已积累');
  },
  delWord(id) {
    if (!confirm('删除这条积累？')) return;
    DB.set('goodwords', DB.get('goodwords', []).filter(w => w.id !== id));
    Nav.refresh(); toast('已删除');
  },
  setTab(t) { DailyRead._tab = t; Nav.refresh(); },
  shift(n) {
    const d = new Date(DailyRead._viewDate || todayStr());
    d.setDate(d.getDate() + n);
    DailyRead._viewDate = d.toISOString().slice(0, 10);
    Nav.refresh();
  },
  answer(qi, oi) {
    const date = DailyRead._viewDate || todayStr();
    const data = DailyRead._cache[date];
    if (!data || !data.politics || !data.politics[qi] || !data.politics[qi].quiz) return;
    const correct = data.politics[qi].quiz.answer;
    const opts = $$(`#quiz-${qi} .opt`);
    opts.forEach((o) => { o.classList.remove('correct', 'wrong'); });
    opts[oi].classList.add(oi === correct ? 'correct' : 'wrong');
    if (oi !== correct) opts[correct].classList.add('correct');
    $(`#ans-${qi}`).style.display = 'block';
  },
  async _load(date) {
    // 默认同源相对路径：部署到 GitHub Pages / 任意静态托管后，自动从同站 news/ 拉取每日更新；
    // 也可在「设置-新闻源地址」填写绝对地址（如 raw.githubusercontent.com）覆盖。
    let newsUrl = (DB.get('newsUrl', '') || '').trim().replace(/\/$/, '');
    if (!newsUrl) {
      const base = (location.pathname || '/').replace(/index\.html$/, '').replace(/\/$/, '');
      newsUrl = base + '/news';
    }
    // 远程优先（GitHub Actions 每天9点生成 daily-YYYY-MM-DD.json）
    try {
      const resp = await fetch(`${newsUrl}/daily-${date}.json?t=${Date.now()}`, { cache: 'no-store' });
      if (resp.ok) {
        const json = await resp.json();
        if (json && json.politics) {
          json._remote = true;
          DailyRead._cache[date] = json;
          DailyRead._fetchedAt[date] = Date.now();
          Nav.refresh();
          return;
        }
      }
    } catch (e) { console.warn('remote news load failed', e); }
    // 本地内置兜底（真实新闻，不依赖后端）
    if (typeof generateBuiltinDaily === 'function') {
      try {
        const data = generateBuiltinDaily(date);
        DailyRead._cache[date] = data;
        DailyRead._fetchedAt[date] = Date.now();
        Nav.refresh();
        return;
      } catch (e) { console.error('builtin daily failed', e); }
    }
  },
  async refresh(date) {
    toast('正在刷新...');
    DailyRead._cache[date] = null;
    await DailyRead._load(date);
    toast('已更新为最新内容');
  }
};

/* ============================================
   STUDY / 自考备考 — 14 科
   ============================================ */
const Study = {
  // 海南大学 自考法学本科（030101K）：免考 2/3/4 后剩余 14 科（不含毕业论文）
  // 本期报考（10月）：合同法 / 犯罪学 / 侵权责任法
  DEFAULT_SUBJECTS: [
    { name: '习近平新时代中国特色社会主义思想概论', isActive: false, examDate: '' },
    { name: '国际法', isActive: false, examDate: '' },
    { name: '国际经济法', isActive: false, examDate: '' },
    { name: '合同法', isActive: true, examDate: '2026-10-24' },
    { name: '公司法', isActive: false, examDate: '' },
    { name: '侵权责任法', isActive: true, examDate: '2026-10-24' },
    { name: '犯罪学', isActive: true, examDate: '2026-10-24' },
    { name: '保险法', isActive: false, examDate: '' },
    { name: '环境资源法学', isActive: false, examDate: '' },
    { name: '商法', isActive: false, examDate: '' },
    { name: '劳动和社会保障法', isActive: false, examDate: '' },
    { name: '国际私法', isActive: false, examDate: '' },
    { name: '知识产权法', isActive: false, examDate: '' },
    { name: '物权法', isActive: false, examDate: '' },
  ],
  // 合并迁移：保留已有科目的日志/进度，补齐缺失默认科目；保留用户自定义科目
  ensureSubjects() {
    const stored = DB.get('subjects', null);
    const defaults = Study.DEFAULT_SUBJECTS;
    if (!stored || !stored.length) {
      const fresh = defaults.map((d, i) => ({
        id: uid(), name: d.name, order: i, isActive: !!d.isActive, examDate: d.examDate || '', targetHours: 0, progress: 0, logs: [], createdAt: Date.now(),
      }));
      DB.set('subjects', fresh);
      return fresh;
    }
    const byName = {};
    stored.forEach(s => { byName[s.name] = s; });
    const merged = defaults.map((d, i) => {
      const ex = byName[d.name];
      if (ex) {
        ex.isActive = !!d.isActive;
        if (ex.examDate === undefined) ex.examDate = '';
        if (ex.logs === undefined) ex.logs = [];
        return ex;
      }
      return { id: uid(), name: d.name, order: i, isActive: !!d.isActive, examDate: d.examDate || '', targetHours: 0, progress: 0, logs: [], createdAt: Date.now() };
    });
    // 保留用户自定义的、不在默认清单里的科目
    stored.forEach(s => {
      if (!defaults.some(d => d.name === s.name)) {
        s.isActive = s.isActive || false;
        if (s.logs === undefined) s.logs = [];
        merged.push(s);
      }
    });
    DB.set('subjects', merged);
    return merged;
  },
  /* ===== 科目独立计时器（替代原番茄钟） =====
     特点：开始计时后用真实时间戳记录，tick 仅用于显示。
     暂停时记录累计秒数；只有"停止"才把学时写入「记录本次学习」。
     锁屏/切屏不影响：基于 Date.now() 差值计算，重新打开页面/回到前台自动补偿。 */
  _timer: { id: null, running: false, sec: 0, startedAt: 0 },
  initTimer() {
    const st = DB.get('studyTimer', null);
    if (st && st.running) {
      // 恢复正在计时的状态（不重启 interval，仅恢复累计秒数，等待页面显示时再 tick）
      Study._timer = { id: st.id, running: true, sec: st.sec, startedAt: Date.now() };
    } else if (st) {
      Study._timer = { id: st.id, running: false, sec: st.sec, startedAt: 0 };
    }
  },
  timerSubjectName() {
    const st = DB.get('studyTimer', null);
    if (!st) return null;
    const s = Study.ensureSubjects().find(x => x.id === st.id);
    return s ? s.name : null;
  },
  fmtTimer(sec) {
    sec = Math.max(0, Math.floor(sec));
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return (h > 0 ? `${h}:${String(m).padStart(2,'0')}:` : `${String(m).padStart(2,'0')}:`) + String(s).padStart(2,'0');
  },
  startTimer(id) {
    const st = DB.get('studyTimer', null);
    if (st && st.id === id && st.running) return; // 已在计时的就是本科目
    if (st && st.running && st.id !== id) {
      // 切换到另一科目：先停止原科目（消耗的时间丢弃/不记录？这里按"未停止不记录"，直接清空）
      toast('已切换到新科目，原计时未保存（请先点停止保存）');
    }
    const t = { id, running: true, sec: (st && st.id === id ? st.sec : 0), startedAt: Date.now() };
    DB.set('studyTimer', t);
    Study._timer = { id, running: true, sec: t.sec, startedAt: t.startedAt };
    Study._tickTimer();
    if (Study._timerUiId === id) Study._renderTimerCard();
    Nav.refresh();
  },
  pauseTimer() {
    const st = DB.get('studyTimer', null);
    if (!st || !st.running) return;
    const cur = st.sec + Math.floor((Date.now() - st.startedAt) / 1000);
    st.sec = cur; st.running = false; st.startedAt = 0;
    DB.set('studyTimer', st);
    Study._timer = { id: st.id, running: false, sec: cur, startedAt: 0 };
    if (Study._timerUiId === st.id) Study._renderTimerCard();
    Nav.refresh();
  },
  stopTimer(id) {
    const st = DB.get('studyTimer', null);
    if (!st || st.id !== id) return;
    const cur = st.sec + Math.floor((Date.now() - st.startedAt) / 1000);
    DB.remove('studyTimer');
    Study._timer = { id: null, running: false, sec: 0, startedAt: 0 };
    const hours = cur / 3600;
    // 自动写入「记录本次学习」
    const subs = Study.ensureSubjects();
    const s = subs.find(x => x.id === id);
    if (s) {
      const date = todayStr();
      const log = {
        id: uid(), content: '计时学习', hours: Math.round(hours * 100) / 100,
        progress: s.progress || 0, difficulty: '', reviewed: false, date, ts: Date.now(),
      };
      s.logs = s.logs || [];
      s.logs.push(log);
      DB.set('subjects', subs);
    }
    PetCat.cheer(`「${s ? s.name : '科目'}」已学习 ${Study.fmtTimer(cur)}，已记录~ 🐾`);
    if (Study._timerUiId === id) Study._renderTimerCard();
    Nav.refresh();
  },
  _tickTimer() {
    clearInterval(Study._iv);
    Study._iv = setInterval(() => {
      const st = DB.get('studyTimer', null);
      if (!st || !st.running) { clearInterval(Study._iv); return; }
      const total = st.sec + Math.floor((Date.now() - st.startedAt) / 1000);
      // 更新卡片显示
      const disp = document.getElementById('timerDisplay');
      if (disp) disp.textContent = Study.fmtTimer(total);
      // 同步内存状态
      Study._timer.sec = total;
    }, 1000);
  },
  _timerUiId: null,
  _renderTimerCard() {
    const id = Study._timerUiId;
    if (!id) return;
    const el = document.getElementById('timerCard');
    if (!el) return;
    const st = DB.get('studyTimer', null);
    const running = st && st.running && st.id === id;
    const sec = running ? (st.sec + Math.floor((Date.now() - st.startedAt) / 1000)) : (st ? st.sec : 0);
    el.innerHTML = `
      <div style="text-align:center">
        <div id="timerDisplay" style="font-size:48px;font-weight:800;color:var(--primary);font-variant-numeric:tabular-nums;letter-spacing:-1px">${Study.fmtTimer(sec)}</div>
        <div style="font-size:12px;color:var(--text-3);margin:4px 0 12px">${running ? '计时中 · 锁屏/切屏不影响' : '已暂停（点开始继续）'}</div>
        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
          ${running
            ? `<button class="btn secondary" onclick="Study.pauseTimer()">⏸ 暂停</button>`
            : `<button class="btn" onclick="Study.startTimer('${id}')">▶ 开始计时</button>`}
          <button class="btn" onclick="Study.stopTimer('${id}')">⏹ 停止并记录</button>
          <button class="btn secondary" onclick="Study.closeTimer()">✕ 收起</button>
        </div>
        <div style="font-size:11px;color:var(--text-3);margin-top:8px">停止后自动写入「记录本次学习」，累加该科累计学时/次数</div>
      </div>`;
  },
  closeTimer() {
    Study._timerUiId = null;
    const el = document.getElementById('timerCard');
    if (el) el.style.display = 'none';
  },
  openTimer(id) {
    Study._timerUiId = id;
    const el = document.getElementById('timerCard');
    if (el) { el.style.display = 'block'; Study._renderTimerCard(); }
  },
  // 连续学习天数（按学习记录日期计算）
  streak(subs) {
    const days = new Set();
    subs.forEach(s => (s.logs || []).forEach(l => { if (l.date) days.add(l.date); }));
    if (!days.size) return 0;
    const iso = dt => { const y = dt.getFullYear(); const m = String(dt.getMonth() + 1).padStart(2, '0'); const d = String(dt.getDate()).padStart(2, '0'); return `${y}-${m}-${d}`; };
    let dt = new Date();
    if (!days.has(iso(dt))) dt.setDate(dt.getDate() - 1); // 今天还没学但昨天有，从昨天起算
    let n = 0;
    while (days.has(iso(dt))) { n++; dt.setDate(dt.getDate() - 1); }
    return n;
  },
  render() {
    const subs = Study.ensureSubjects();
    Study._off = 0;
    Study._cur = studyDailyContent(todayStr(), 0);
    // 若计时器面板处于打开状态，渲染其内容与标题
    if (Study._timerUiId) {
      const tt = subs.find(x => x.id === Study._timerUiId);
      const tc = document.getElementById('timerCard');
      if (!tt && tc) tc.style.display = 'none';
      else if (tt) {
        const tct = document.getElementById('timerCardTitle');
        if (tct) tct.textContent = '⏱ 计时 · ' + tt.name;
        Study._renderTimerCard();
      }
    }
    const allLogs = subs.flatMap(s => s.logs || []);
    const totalHours = allLogs.reduce((s, l) => s + (l.hours || 0), 0);
    const totalSessions = allLogs.length;
    const avgProgress = subs.length ? Math.round(subs.reduce((s, x) => s + (x.progress || 0), 0) / subs.length) : 0;
    const streak = Study.streak(subs);
    const active = subs.filter(s => s.isActive);
    const nearest = active.filter(s => s.examDate).map(s => ({ s, days: Math.ceil((new Date(s.examDate) - new Date(new Date().toDateString())) / 86400000) })).filter(x => x.days >= 0).sort((a, b) => a.days - b.days)[0];
    const bmCount = DB.get('studyBookmarks', []).length;
    const diffCount = subs.reduce((n, s) => n + (s.logs || []).filter(l => l.difficulty && l.difficulty.trim()).length, 0);
    const reviewedCount = allLogs.filter(l => l.reviewed).length;

    const activeCard = active.length ? `<div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:6px">${active.map(s => `<span class="badge fire">🔥 本期 · ${esc(s.name)}</span>`).join('')}</div>${nearest ? `<div style="margin-top:8px;font-size:13px;color:var(--warning);font-weight:700">⏰ 最近考试：${esc(nearest.s.name)} 还有 ${nearest.days} 天（${fmtDate(nearest.s.examDate)}）</div>` : ''}` : '';

    const statCard = `
      <div class="card">
        <div class="card-title"><span>备考总览 · ${subs.length} 科</span></div>
        <div class="stat-row">
          <div class="stat-box"><div class="num">${totalHours}</div><div class="lbl">累计学时</div></div>
          <div class="stat-box"><div class="num">${totalSessions}</div><div class="lbl">学习次数</div></div>
          <div class="stat-box"><div class="num">${avgProgress}%</div><div class="lbl">平均进度</div></div>
          <div class="stat-box"><div class="num">${streak}</div><div class="lbl">连续学习(天)</div></div>
        </div>
        ${activeCard}
        <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
          <button class="btn secondary" onclick="Study.openFlashcard()">🃏 随机抽背</button>
          <button class="btn secondary" onclick="Study.renderBookmarks()">📕 错题本(${bmCount})</button>
          <button class="btn secondary" onclick="Study.renderKeyDiff()">📌 重点难点(${diffCount})</button>
        </div>
        ${reviewedCount ? `<div style="margin-top:8px;font-size:12px;color:var(--text-2)">已标记复习 ${reviewedCount} 条记录</div>` : ''}
      </div>`;

    const list = subs.map(s => {
      const hours = (s.logs || []).reduce((sum, l) => sum + (l.hours || 0), 0);
      const sessions = (s.logs || []).length;
      const pct = clamp(s.progress || 0, 0, 100);
      let daysLeft = null;
      if (s.examDate) daysLeft = Math.ceil((new Date(s.examDate) - new Date(new Date().toDateString())) / 86400000);
      const lastLog = (s.logs || []).slice().sort((a, b) => b.ts - a.ts)[0];
      return `<div class="card" onclick="Study.open('${s.id}')">
        <div style="display:flex;justify-content:space-between;align-items:start;gap:8px">
          <div style="flex:1;min-width:0">
            <div style="font-size:15px;font-weight:700">${esc(s.name)} ${s.isActive ? '<span class="badge fire" style="font-size:10px">本期</span>' : ''}</div>
            <div class="sub" style="font-size:11px;color:var(--text-2);margin-top:3px">
              ${sessions} 次 · ${hours}h ${lastLog ? ' · 最近 ' + fmtDate(lastLog.date) : ' · 还没开始'}
            </div>
          </div>
          ${daysLeft !== null ? `<span class="badge ${daysLeft < 0 ? 'gray' : daysLeft < 14 ? 'orange' : 'blue'}">${daysLeft < 0 ? '已考' : '剩' + daysLeft + '天'}</span>` : ''}
        </div>
        <div class="progress-bar"><div class="fill" style="width:${pct}%"></div></div>
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-2)">
          <span>${s.examDate ? '考试 ' + fmtDate(s.examDate) : '未设考试日'}</span><span>${pct}%</span>
        </div>
        <button class="btn secondary" style="width:100%;margin-top:8px;font-size:13px" onclick="Study.openTimer('${s.id}')">⏱ 计时学习</button>
      </div>`;
    }).join('');

    return statCard
      + `<div id="studyDaily">${Study.renderDaily(0)}</div>`
      + `<div class="card" id="timerCard" style="display:${Study._timerUiId ? 'block' : 'none'};border-left:4px solid var(--primary)"><div class="card-title"><span id="timerCardTitle">⏱ 科目计时器</span></div><div id="timerInner"></div></div>`
      + list
      + `
      <button class="btn secondary" onclick="Study.addSubject()" style="margin-top:8px">+ 添加自定义科目</button>
      <div style="font-size:11px;color:var(--text-3);text-align:center;margin-top:12px;padding:0 16px;line-height:1.6">
        已内置 14 科（免考 3 科后）。每日一练按日期自动轮换；本期重点：合同法 / 犯罪学 / 侵权责任法。
      </div>`;
  },
  renderDaily(offset) {
    const c = studyDailyContent(todayStr(), offset);
    const m = c.question;
    const optsHtml = m ? m.opts.map((o, i) => `<div class="opt">${String.fromCharCode(65 + i)}. ${esc(o)}</div>`).join('') : '';
    const ansHtml = m ? `<div class="daily-answer" id="dailyAns" style="display:none;margin-top:8px;padding:10px 12px;background:#f5f9f5;border-radius:8px;font-size:13px;white-space:pre-wrap">正确答案：${String.fromCharCode(65 + m.answer)}\n${esc(m.tip)}</div>` : '';
    return `
      <div class="card daily-card">
        <div class="card-title"><span>📅 每日一练 · ${esc(c.subject)}</span><span class="badge blue">${fmtDate(todayStr())}</span></div>
        ${m ? `<div style="font-weight:700;margin-bottom:8px">${esc(m.q)}</div>${optsHtml}${ansHtml}
          <div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap">
            <button class="btn secondary" onclick="Study.toggleAnswer()">显示答案/解析</button>
            <button class="btn secondary" onclick="Study.moreDaily()">换一题</button>
            <button class="btn secondary" onclick="Study.bookmark()">★ 收藏</button>
          </div>` : `<div class="empty"><div class="emoji">📖</div><div>今日暂无推送</div></div>`}
        <div style="margin-top:12px;padding-top:10px;border-top:1px dashed var(--line)">
          <div style="font-size:12px;color:var(--text-2);margin-bottom:4px">💡 考点速记</div>
          <div style="font-size:13px;line-height:1.6">${esc(c.quick)}</div>
        </div>
        ${c.law ? `<div style="margin-top:10px;font-size:12px;color:var(--text-2);background:#f5f9f5;padding:8px 10px;border-radius:8px;line-height:1.6">📜 ${esc(c.law)}</div>` : ''}
      </div>`;
  },
  toggleAnswer() {
    const el = document.getElementById('dailyAns');
    if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
  },
  moreDaily() {
    Study._off = (Study._off || 0) + 1;
    Study._cur = studyDailyContent(todayStr(), Study._off);
    const el = document.getElementById('studyDaily');
    if (el) el.innerHTML = Study.renderDaily(Study._off);
  },
  bookmark() {
    const c = Study._cur;
    if (!c) return;
    const bm = DB.get('studyBookmarks', []);
    const key = c.question ? c.question.q : c.quick;
    if (bm.some(b => b.q === key)) return toast('已在错题本中');
    bm.unshift({
      id: uid(), subject: c.subject,
      q: c.question ? c.question.q : c.quick,
      a: c.question ? ('正确答案：' + String.fromCharCode(65 + c.question.answer) + '\n' + c.question.tip) : '',
      note: c.quick, addedAt: Date.now(),
    });
    DB.set('studyBookmarks', bm);
    toast('★ 已收藏到错题本');
  },
  renderBookmarks() {
    const bm = DB.get('studyBookmarks', []);
    const html = bm.length ? bm.map(b => `
      <div class="list-item">
        <div class="main">
          <div class="title">${esc(b.q)}</div>
          <div class="sub">${esc(b.subject)}${b.a ? ' · 已收藏' : ''}</div>
          ${b.a ? `<div style="font-size:12px;color:var(--text-2);margin-top:4px;white-space:pre-wrap">${esc(b.a)}</div>` : ''}
        </div>
        <button class="task-delete" onclick="Study.delBookmark('${b.id}')">${ICONS.trash}</button>
      </div>`).join('') : `<div class="empty"><div class="emoji">📕</div><div>错题本还是空的<br>在「每日一练」点 ★ 收藏吧</div></div>`;
    openModal(`<h3>📕 错题本 / 收藏夹（${bm.length}）</h3>${html}<div style="font-size:11px;color:var(--text-3);margin-top:8px">收藏来自每日一练，便于考前集中回看易错点。</div>`);
  },
  delBookmark(id) {
    DB.set('studyBookmarks', DB.get('studyBookmarks', []).filter(b => b.id !== id));
    Study.renderBookmarks();
  },
  renderKeyDiff() {
    const subs = Study.ensureSubjects();
    const items = [];
    subs.forEach(s => (s.logs || []).forEach(l => { if (l.difficulty && l.difficulty.trim()) items.push({ subject: s.name, content: l.content, diff: l.difficulty, date: l.date }); }));
    items.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    const html = items.length ? items.map(it => `
      <div class="list-item">
        <div class="main">
          <div class="title">${esc(it.diff)}</div>
          <div class="sub">${esc(it.subject)} · ${fmtDate(it.date)}${it.content ? ' · ' + esc(it.content) : ''}</div>
        </div>
      </div>`).join('') : `<div class="empty"><div class="emoji">📌</div><div>还没有记录重点难点<br>在科目详情记学习时写下「重点难点/心得」</div></div>`;
    openModal(`<h3>📌 重点难点本（待复习 ${items.length}）</h3>${html}<div style="font-size:11px;color:var(--text-3);margin-top:8px">汇总所有科目学习记录里的难点与心得，考前集中攻克。</div>`);
  },
  openFlashcard() {
    const cards = studyFlashcards();
    for (let i = cards.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [cards[i], cards[j]] = [cards[j], cards[i]]; }
    Study._fc = { cards, i: 0, flipped: false };
    Study._renderFlashcard();
  },
  _renderFlashcard() {
    const fc = Study._fc;
    if (!fc || !fc.cards.length) { openModal('<h3>🃏 随机抽背</h3><div class="empty"><div class="emoji">🃏</div><div>暂无可抽背内容</div></div>'); return; }
    const c = fc.cards[fc.i];
    openModal(`
      <div style="text-align:center">
        <h3 style="text-align:left">🃏 随机抽背 · ${esc(c.subject)}</h3>
        <div class="flashcard ${fc.flipped ? 'flipped' : ''}" onclick="Study.flipFlashcard()">
          <div class="fc-inner">
            <div class="fc-face fc-front">${esc(c.front)}</div>
            <div class="fc-face fc-back" style="white-space:pre-wrap">${esc(c.back)}</div>
          </div>
        </div>
        <div style="font-size:12px;color:var(--text-2);margin:10px 0">${fc.i + 1} / ${fc.cards.length} · 点击卡片翻面</div>
        <div style="display:flex;gap:8px;justify-content:center">
          <button class="btn secondary" onclick="Study.nextFlashcard()">下一张 →</button>
          <button class="btn" onclick="Study.openFlashcard()">🔀 重新洗牌</button>
        </div>
      </div>`);
  },
  flipFlashcard() { Study._fc.flipped = !Study._fc.flipped; Study._renderFlashcard(); },
  nextFlashcard() { Study._fc.i = (Study._fc.i + 1) % Study._fc.cards.length; Study._fc.flipped = false; Study._renderFlashcard(); },
  addSubject() {
    openModal(`<h3>添加自定义科目</h3>
      <span class="label">科目名称</span>
      <input class="input" id="subName" placeholder="如：数据结构">
      <span class="label">考试日期（可选）</span>
      <input type="date" class="input" id="subDate">
      <span class="label">目标学习时长（小时）</span>
      <input type="number" class="input" id="subHours" placeholder="如 50">
      <label style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-2);margin:8px 0">
        <input type="checkbox" id="subActive"> 标记为本期报考（重点复习）
      </label>
      <button class="btn" onclick="Study.saveSubject()">保存</button>`);
  },
  saveSubject() {
    const name = $('#subName').value.trim();
    if (!name) return toast('请输入科目名称');
    const active = $('#subActive').checked;
    const subs = Study.ensureSubjects();
    subs.push({ id: uid(), name, order: subs.length, isActive: active, examDate: $('#subDate').value || (active ? '2026-10-24' : ''), targetHours: +$('#subHours').value || 0, progress: 0, logs: [], createdAt: Date.now() });
    DB.set('subjects', subs);
    closeModal(); Nav.refresh(); toast('已添加科目');
  },
  open(id) {
    const s = Study.ensureSubjects().find(x => x.id === id);
    if (!s) return;
    Study.cur = id;
    const hours = (s.logs || []).reduce((sum, l) => sum + (l.hours || 0), 0);
    const pct = clamp(s.progress || 0, 0, 100);
    const daysLeft = s.examDate ? Math.ceil((new Date(s.examDate) - new Date(new Date().toDateString())) / 86400000) : null;
    const logs = (s.logs || []).slice().sort((a, b) => b.ts - a.ts);
    const logHtml = logs.length ? logs.map(l => `
      <div class="list-item">
        <div class="main">
          <div class="title">${esc(l.content)}${l.reviewed ? ' <span class="badge green">已复习</span>' : ''}</div>
          <div class="sub">${fmtDate(l.date)} · ${l.hours}h ${l.difficulty ? ' · 难点：' + esc(l.difficulty) : ''}</div>
        </div>
        <button class="task-delete" onclick="Study.delLog('${id}','${l.id}')">${ICONS.trash}</button>
      </div>`).join('') : `<div class="empty" style="padding:24px"><div class="emoji">📖</div><div>还没有学习记录</div></div>`;

    openModal(`
      <div style="display:flex;justify-content:space-between;align-items:start;gap:8px">
        <h3 style="flex:1">${esc(s.name)}</h3>
        <button class="btn secondary" style="padding:6px 12px;font-size:13px;flex-shrink:0" onclick="Study.editSubject('${id}')">编辑</button>
      </div>
      ${s.examDate ? `<div style="font-size:13px;color:var(--text-2);margin-bottom:10px">考试日期：${fmtDateFull(s.examDate)}${daysLeft !== null ? (daysLeft < 0 ? '（已过）' : ` · <strong style="color:${daysLeft < 14 ? 'var(--danger)' : 'var(--warning)'}">还有 ${daysLeft} 天</strong>`) : ''}</div>` : '<div style="font-size:12px;color:var(--text-3);margin-bottom:10px">未设考试日期</div>'}
      <div style="display:flex;gap:8px;margin-bottom:14px">
        <div class="stat-box"><div class="num" style="font-size:18px">${hours}</div><div class="lbl">累计学时</div></div>
        <div class="stat-box"><div class="num" style="font-size:18px">${logs.length}</div><div class="lbl">学习次数</div></div>
        <div class="stat-box"><div class="num" style="font-size:18px">${pct}%</div><div class="lbl">当前进度</div></div>
      </div>
      <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">
        <button class="btn" onclick="Study.addLog('${id}')">+ 记录本次学习</button>
        <button class="btn secondary" onclick="closeModal();Nav.go('study');Study.openTimer('${id}')">⏱ 科目计时学习</button>
      </div>
      <div style="margin-top:16px"><div class="card-title"><span>学习记录</span></div>${logHtml}</div>
      ${(() => { const qa = STUDY_QUICK[s.name] || []; return qa.length ? `<div style="margin-top:16px"><div class="card-title"><span>本章速记（${qa.length}）</span></div>${qa.slice(0, 5).map(k => '<div style="font-size:13px;padding:6px 0;border-bottom:1px dashed var(--line)">• ' + esc(k) + '</div>').join('')}${qa.length > 5 ? '<div style="font-size:11px;color:var(--text-3);margin-top:6px">…还有 ' + (qa.length - 5) + ' 条，每天在备考首页速记推送</div>' : ''}</div>` : ''; })()}
      <button class="btn secondary" onclick="Study.delSubject('${id}');closeModal()" style="margin-top:16px">删除该科目</button>
    `);
  },
  addLog(id) {
    const s = Study.ensureSubjects().find(x => x.id === id);
    const curProgress = s ? (s.progress || 0) : 0;
    // 若计时器正在/暂停在该科目，把已计秒数换算成小时预填
    let prefillHours = '';
    const st = DB.get('studyTimer', null);
    if (st && st.id === id) {
      const sec = st.sec + (st.running ? Math.floor((Date.now() - st.startedAt) / 1000) : 0);
      if (sec > 0) prefillHours = (Math.round((sec / 3600) * 100) / 100);
    }
    openModal(`<h3>记录本次学习</h3>
      ${prefillHours ? `<div style="font-size:12px;color:var(--text-2);margin-bottom:8px">⏱ 计时器已计 <strong>${Study.fmtTimer((st.sec + (st.running ? Math.floor((Date.now() - st.startedAt) / 1000) : 0)))}</strong>，已预填时长（停止计时也会自动记录）</div>` : ''}
      <span class="label">日期</span>
      <input type="date" class="input" id="logDate" value="${todayStr()}">
      <span class="label">学习内容</span>
      <textarea class="textarea" id="logContent" placeholder="学了哪个章节/知识点/做了什么题"></textarea>
      <div class="row">
        <div><span class="label">时长（小时）</span>
        <input type="number" class="input" id="logHours" placeholder="如 2" step="0.5" min="0" value="${prefillHours}"></div>
        <div><span class="label">进度更新至（%）</span>
        <input type="number" class="input" id="logProgress" value="${curProgress}" min="0" max="100"></div>
      </div>
      <span class="label">重点难点 / 心得</span>
      <textarea class="textarea" id="logDiff" placeholder="记下难点、易错点、需要复习的地方"></textarea>
      <label style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-2);margin:8px 0">
        <input type="checkbox" id="logReviewed"> 标记为已复习
      </label>
      <button class="btn" onclick="Study.saveLog('${id}')">保存</button>`);
  },
  saveLog(id) {
    const subs = Study.ensureSubjects();
    const s = subs.find(x => x.id === id);
    if (!s) return;
    const content = $('#logContent').value.trim();
    if (!content) return toast('请输入学习内容');
    s.logs = s.logs || [];
    const newProgress = clamp(+$('#logProgress').value || 0, 0, 100);
    s.logs.push({ id: uid(), content, hours: +$('#logHours').value || 0, progress: newProgress, difficulty: $('#logDiff').value.trim(), reviewed: $('#logReviewed').checked, date: $('#logDate').value || todayStr(), ts: Date.now() });
    s.progress = newProgress;
    DB.set('subjects', subs);
    closeModal(); Study.open(id); toast('已记录学习');
  },
  delLog(id, logId) {
    const subs = Study.ensureSubjects();
    const s = subs.find(x => x.id === id);
    if (s) { s.logs = (s.logs || []).filter(l => l.id !== logId); DB.set('subjects', subs); }
    closeModal(); Study.open(id);
  },
  editSubject(id) {
    const s = Study.ensureSubjects().find(x => x.id === id);
    if (!s) return;
    openModal(`<h3>编辑科目</h3>
      <span class="label">科目名称</span>
      <input class="input" id="editName" value="${esc(s.name)}">
      <span class="label">考试日期</span>
      <input type="date" class="input" id="editDate" value="${s.examDate || ''}">
      <span class="label">目标学习时长（小时）</span>
      <input type="number" class="input" id="editHours" value="${s.targetHours || 0}">
      <span class="label">当前进度（%）</span>
      <input type="number" class="input" id="editProgress" value="${s.progress || 0}" min="0" max="100">
      <button class="btn" onclick="Study.saveEdit('${id}')">保存</button>`);
  },
  saveEdit(id) {
    const subs = Study.ensureSubjects();
    const s = subs.find(x => x.id === id);
    if (!s) return;
    s.name = $('#editName').value.trim() || s.name;
    s.examDate = $('#editDate').value;
    s.targetHours = +$('#editHours').value || 0;
    s.progress = clamp(+$('#editProgress').value || 0, 0, 100);
    DB.set('subjects', subs);
    closeModal(); Study.open(id); toast('已保存');
  },
  delSubject(id) {
    DB.set('subjects', Study.ensureSubjects().filter(x => x.id !== id));
    Nav.refresh(); toast('已删除科目');
  }
};

/* ============================================
   SLEEP
   ============================================ */
const Sleep = {
  _energy: null, _editEnergy: null,
  _sleepHours(bed, wake) {
    if (!bed || !wake) return 0;
    const [bh, bm] = bed.split(':').map(Number);
    const [wh, wm] = wake.split(':').map(Number);
    let mins = (wh * 60 + wm) - (bh * 60 + bm);
    if (mins <= 0) mins += 24 * 60;
    return Math.round(mins / 6) / 10;
  },
  _total(s) {
    const night = Sleep._sleepHours(s.bed, s.wake);
    const nap = Sleep._sleepHours(s.napStart, s.napEnd);
    return Math.round((night + nap) * 10) / 10;
  },
  render() {
    const sleep = DB.get('sleep', {});
    const today = todayStr();
    const t = sleep[today] || {};
    const dates = Object.keys(sleep).sort().reverse().slice(0, 14);
    const avgEnergy = dates.length ? (dates.reduce((s, d) => s + (sleep[d].energy || 0), 0) / dates.length).toFixed(1) : '—';
    const avgTotal = dates.length ? (dates.reduce((s, d) => s + Sleep._total(sleep[d]), 0) / dates.length).toFixed(1) : '—';
    const todayTotal = Sleep._total(t);
    const history = dates.slice(0, 7).map(d => {
      const s = sleep[d];
      const total = Sleep._total(s);
      return `<div class="list-item"><div class="main"><div class="title">${fmtDate(d)} · 共 ${total}小时</div><div class="sub">${s.bed ? '晚睡 ' + s.bed : ''} ${s.wake ? '起 ' + s.wake : ''}${s.napStart ? '　午觉 ' + s.napStart + '-' + s.napEnd : ''} ${s.energy ? '　精力 ' + s.energy : ''}</div></div><button class="task-delete" onclick="Sleep.edit('${d}')" style="color:var(--primary)">${ICONS.edit}</button><button class="task-delete" onclick="Sleep.del('${d}')">${ICONS.trash}</button></div>`;
    }).join('') || `<div class="empty"><div class="emoji">😴</div><div>还没有作息记录</div></div>`;
    Sleep._energy = t.energy || null;
    return `
      <div class="card">
        <div class="card-title"><span>🌙 今日作息 · ${fmtDateFull(new Date())}</span><span style="color:var(--primary-dark);font-weight:700">总 ${todayTotal}h</span></div>
        <div style="font-size:12px;font-weight:700;color:var(--text-2);margin:6px 0 2px">🌃 晚上睡觉</div>
        <div class="row">
          <div><span class="label">入睡时间</span><input type="time" class="input" id="bedTime" value="${t.bed || ''}"></div>
          <div><span class="label">起床时间</span><input type="time" class="input" id="wakeTime" value="${t.wake || ''}"></div>
        </div>
        <div style="font-size:12px;font-weight:700;color:var(--text-2);margin:10px 0 2px">☀️ 午觉</div>
        <div class="row">
          <div><span class="label">午觉开始</span><input type="time" class="input" id="napStart" value="${t.napStart || ''}"></div>
          <div><span class="label">午觉结束</span><input type="time" class="input" id="napEnd" value="${t.napEnd || ''}"></div>
        </div>
        <span class="label">今日精力评分</span>
        <div class="chips" id="energyChips">${[1,2,3,4,5,6,7,8,9,10].map(n => `<div class="chip ${t.energy === n ? 'active' : ''}" onclick="Sleep.setEnergy(${n})">${n}</div>`).join('')}</div>
        <button class="btn" onclick="Sleep.save()">保存今日记录</button>
      </div>
      <div class="card">
        <div class="card-title"><span>近14天统计</span></div>
        <div class="stat-row">
          <div class="stat-box"><div class="num">${avgTotal}</div><div class="lbl">平均总睡眠(h)</div></div>
          <div class="stat-box"><div class="num">${avgEnergy}</div><div class="lbl">平均精力</div></div>
          <div class="stat-box"><div class="num">${dates.length}</div><div class="lbl">记录天数</div></div>
        </div>
      </div>
      <div class="card"><div class="card-title"><span>最近记录</span></div>${history}</div>
    `;
  },
  setEnergy(n) { Sleep._energy = n; $$('#energyChips .chip').forEach((c, i) => c.classList.toggle('active', i + 1 === n)); },
  save() {
    const sleep = DB.get('sleep', {});
    const bed = $('#bedTime').value, wake = $('#wakeTime').value;
    const napStart = $('#napStart').value, napEnd = $('#napEnd').value;
    const energy = Sleep._energy !== null ? Sleep._energy : (sleep[todayStr()] || {}).energy;
    if (!bed && !wake && !napStart && !napEnd && !energy) return toast('请填写内容');
    sleep[todayStr()] = { bed, wake, napStart, napEnd, energy, updatedAt: Date.now() };
    DB.set('sleep', sleep);
    Sleep._energy = null;
    PetCat.cheer('好好休息 💤');
    Nav.refresh(); toast('已记录今日作息');
  },
  edit(date) {
    const sleep = DB.get('sleep', {});
    const s = sleep[date] || {};
    Sleep._editEnergy = s.energy || null;
    openModal(`<h3>编辑作息 · ${fmtDate(date)}</h3>
      <div style="font-size:12px;font-weight:700;color:var(--text-2);margin:6px 0 2px">🌃 晚上睡觉</div>
      <div class="row">
        <div><span class="label">入睡</span><input type="time" class="input" id="editBed" value="${s.bed || ''}"></div>
        <div><span class="label">起床</span><input type="time" class="input" id="editWake" value="${s.wake || ''}"></div>
      </div>
      <div style="font-size:12px;font-weight:700;color:var(--text-2);margin:8px 0 2px">☀️ 午觉</div>
      <div class="row">
        <div><span class="label">开始</span><input type="time" class="input" id="editNapStart" value="${s.napStart || ''}"></div>
        <div><span class="label">结束</span><input type="time" class="input" id="editNapEnd" value="${s.napEnd || ''}"></div>
      </div>
      <span class="label">精力评分</span>
      <div class="chips" id="editEnergyChips">${[1,2,3,4,5,6,7,8,9,10].map(n => `<div class="chip ${s.energy === n ? 'active' : ''}" onclick="Sleep.setEditEnergy(${n})">${n}</div>`).join('')}</div>
      <button class="btn" onclick="Sleep.saveEdit('${date}')">保存修改</button>`);
  },
  setEditEnergy(n) { Sleep._editEnergy = n; $$('#editEnergyChips .chip').forEach((c, i) => c.classList.toggle('active', i + 1 === n)); },
  saveEdit(date) {
    const sleep = DB.get('sleep', {});
    const s = sleep[date] || {};
    s.bed = $('#editBed').value; s.wake = $('#editWake').value;
    s.napStart = $('#editNapStart').value; s.napEnd = $('#editNapEnd').value;
    s.energy = Sleep._editEnergy;
    if (!s.bed && !s.wake && !s.napStart && !s.napEnd && !s.energy) delete sleep[date];
    else sleep[date] = s;
    DB.set('sleep', sleep);
    Sleep._editEnergy = null;
    closeModal(); Nav.refresh(); toast('已修改');
  },
  del(date) {
    if (!confirm('确认删除这条作息记录？')) return;
    const sleep = DB.get('sleep', {});
    delete sleep[date];
    DB.set('sleep', sleep);
    Nav.refresh(); toast('已删除');
  }
};

/* ============================================
   BACKLOG
   ============================================ */
const Backlog = {
  render() {
    const items = DB.get('backlog', []);
    const active = items.filter(i => !i.done);
    const done = items.filter(i => i.done);
    const list = (arr) => arr.length ? arr.map(i => `
      <div class="task-item ${i.done ? 'done' : ''}">
        <div class="checkbox ${i.done ? 'checked' : ''}" onclick="Backlog.toggle('${i.id}')">${ICONS.check}</div>
        <div style="flex:1"><div class="task-text" onclick="Backlog.toggle('${i.id}')">${esc(i.text)}</div>${i.note ? `<div class="task-meta">${esc(i.note)}</div>` : ''}</div>
        <button class="task-delete" onclick="Backlog.edit('${i.id}')" style="color:var(--primary)">${ICONS.edit}</button>
        <button class="task-delete" onclick="Backlog.del('${i.id}')">${ICONS.trash}</button>
      </div>`).join('') : '';
    return `
      <div class="card"><div class="card-title"><span>待办池 · ${active.length} 项</span><a onclick="Backlog.add()">+ 添加</a></div>
        ${list(active) || `<div class="empty"><div class="emoji">📋</div><div>暂无待办</div></div>`}
      </div>
      ${done.length ? `<div class="card"><div class="card-title"><span>已完成 · ${done.length}</span></div>${list(done)}</div>` : ''}
    `;
  },
  add() {
    openModal(`<h3>添加到待办池</h3>
      <span class="label">事项</span><input class="input" id="blText" placeholder="不需要立刻做，但要完成的事">
      <span class="label">备注</span><input class="input" id="blNote" placeholder="截止时间、背景等">
      <button class="btn" onclick="Backlog.save()">保存</button>`);
  },
  save() {
    const text = $('#blText').value.trim();
    if (!text) return toast('请输入内容');
    const items = DB.get('backlog', []);
    items.push({ id: uid(), text, note: $('#blNote').value.trim(), done: false, createdAt: Date.now() });
    DB.set('backlog', items);
    closeModal(); Nav.refresh(); toast('已加入待办池');
  },
  toggle(id) { const items = DB.get('backlog', []); const i = items.find(x => x.id === id); if (i) { i.done = !i.done; DB.set('backlog', items); Nav.refresh(); } },
  del(id) { if (!confirm('确认删除？')) return; DB.set('backlog', DB.get('backlog', []).filter(i => i.id !== id)); Nav.refresh(); toast('已删除'); },
  edit(id) {
    const items = DB.get('backlog', []);
    const i = items.find(x => x.id === id);
    if (!i) return;
    openModal(`<h3>编辑待办</h3>
      <span class="label">事项</span><input class="input" id="editBlText" value="${esc(i.text)}">
      <span class="label">备注</span><input class="input" id="editBlNote" value="${esc(i.note || '')}">
      <label style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-2);margin:8px 0">
        <input type="checkbox" id="editBlDone" ${i.done ? 'checked' : ''}> 标记为已完成
      </label>
      <button class="btn" onclick="Backlog.saveEdit('${id}')">保存修改</button>`);
  },
  saveEdit(id) {
    const items = DB.get('backlog', []);
    const i = items.find(x => x.id === id);
    if (!i) return;
    const text = $('#editBlText').value.trim();
    if (!text) return toast('请输入内容');
    i.text = text;
    i.note = $('#editBlNote').value.trim();
    i.done = $('#editBlDone').checked;
    DB.set('backlog', items);
    closeModal(); Nav.refresh(); toast('已保存修改');
  }
};

/* ============================================
   MONEY
   ============================================ */
const Money = {
  _type: 'expense', _cat: null,
  render() {
    const items = DB.get('money', []).slice().sort((a, b) => b.ts - a.ts);
    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthItems = items.filter(i => i.date.startsWith(monthStr));
    const income = monthItems.filter(i => i.type === 'income').reduce((s, i) => s + i.amount, 0);
    const expense = monthItems.filter(i => i.type === 'expense').reduce((s, i) => s + i.amount, 0);
    const list = items.slice(0, 30).map(i => `
      <div class="money-item">
        <div class="main"><div class="title">${esc(i.category)}</div><div class="sub">${fmtDate(i.date)} ${i.note ? '· ' + esc(i.note) : ''}</div></div>
        <div class="money-amount ${i.type}">${i.type === 'income' ? '+' : '−'}¥${i.amount}</div>
        <button class="task-delete" onclick="Money.edit('${i.id}')" style="color:var(--primary)">${ICONS.edit}</button>
        <button class="task-delete" onclick="Money.del('${i.id}')">${ICONS.trash}</button>
      </div>`).join('') || `<div class="empty"><div class="emoji">💰</div><div>还没有记账</div></div>`;
    return `
      <div class="card"><div class="card-title"><span>${now.getFullYear()}年${now.getMonth() + 1}月小结</span></div>
        <div class="stat-row">
          <div class="stat-box"><div class="num" style="color:var(--success)">+${income}</div><div class="lbl">收入</div></div>
          <div class="stat-box"><div class="num" style="color:var(--danger)">−${expense}</div><div class="lbl">支出</div></div>
          <div class="stat-box"><div class="num" style="color:var(--primary-dark)">${income - expense}</div><div class="lbl">结余</div></div>
        </div>
      </div>
      <div class="card"><div class="card-title"><span>记一笔</span></div>
        <div class="segmented" id="moneyType">
          <button class="active" onclick="Money.setType('expense')">支出</button>
          <button onclick="Money.setType('income')">收入</button>
        </div>
        <div class="chips" id="moneyCats"></div>
        <span class="label">金额</span><input type="number" class="input" id="moneyAmount" placeholder="0.00" step="0.01">
        <span class="label">备注</span><input class="input" id="moneyNote" placeholder="一句话备注">
        <button class="btn" onclick="Money.save()">记一笔</button>
      </div>
      <div class="card"><div class="card-title"><span>最近记录</span></div>${list}</div>
    `;
  },
  setType(t) { Money._type = t; Money._cat = null; $$('#moneyType button').forEach((b, i) => b.classList.toggle('active', (t === 'expense' ? 0 : 1) === i)); Money.renderCats(); },
  renderCats() {
    const cats = { expense: ['餐饮', '交通', '购物', '居家', '娱乐', '医疗', '教育', '其他'], income: ['工资', '兼职', '红包', '其他'] }[Money._type];
    $('#moneyCats').innerHTML = cats.map(c => `<div class="chip ${Money._cat === c ? 'active' : ''}" onclick="Money.setCat('${c}')">${c}</div>`).join('');
  },
  setCat(c) { Money._cat = c; Money.renderCats(); },
  save() {
    const amount = +$('#moneyAmount').value;
    if (!amount) return toast('请输入金额');
    if (!Money._cat) return toast('请选择分类');
    const items = DB.get('money', []);
    items.push({ id: uid(), type: Money._type, amount, category: Money._cat, note: $('#moneyNote').value.trim(), date: todayStr(), ts: Date.now() });
    DB.set('money', items);
    Money._cat = null;
    PetCat.cheer('记账完成 💰');
    Nav.refresh(); toast('已记账');
  },
  del(id) { if (!confirm('确认删除这条记录？')) return; DB.set('money', DB.get('money', []).filter(i => i.id !== id)); Nav.refresh(); toast('已删除'); },
  edit(id) {
    const items = DB.get('money', []);
    const i = items.find(x => x.id === id);
    if (!i) return;
    openModal(`<h3>编辑记账</h3>
      <div class="segmented" id="editMoneyType">
        <button class="${i.type === 'expense' ? 'active' : ''}" onclick="Money.setEditType('expense')">支出</button>
        <button class="${i.type === 'income' ? 'active' : ''}" onclick="Money.setEditType('income')">收入</button>
      </div>
      <span class="label">分类</span>
      <div class="chips" id="editMoneyCats"></div>
      <span class="label">金额</span><input type="number" class="input" id="editMoneyAmount" value="${i.amount}" step="0.01">
      <span class="label">备注</span><input class="input" id="editMoneyNote" value="${esc(i.note || '')}">
      <span class="label">日期</span><input type="date" class="input" id="editMoneyDate" value="${i.date}">
      <button class="btn" onclick="Money.saveEdit('${id}')">保存修改</button>`);
    Money._editType = i.type;
    Money._editCat = i.category;
    Money.renderEditCats();
  },
  setEditType(t) { Money._editType = t; Money._editCat = null; $$('#editMoneyType button').forEach((b, i) => b.classList.toggle('active', (t === 'expense' ? 0 : 1) === i)); Money.renderEditCats(); },
  renderEditCats() {
    const cats = { expense: ['餐饮', '交通', '购物', '居家', '娱乐', '医疗', '教育', '其他'], income: ['工资', '兼职', '红包', '其他'] }[Money._editType];
    $('#editMoneyCats').innerHTML = cats.map(c => `<div class="chip ${Money._editCat === c ? 'active' : ''}" onclick="Money.setEditCat('${c}')">${c}</div>`).join('');
  },
  setEditCat(c) { Money._editCat = c; Money.renderEditCats(); },
  saveEdit(id) {
    const items = DB.get('money', []);
    const i = items.find(x => x.id === id);
    if (!i) return;
    const amount = +$('#editMoneyAmount').value;
    if (!amount) return toast('请输入金额');
    if (!Money._editCat) return toast('请选择分类');
    i.type = Money._editType;
    i.amount = amount;
    i.category = Money._editCat;
    i.note = $('#editMoneyNote').value.trim();
    i.date = $('#editMoneyDate').value || i.date;
    DB.set('money', items);
    Money._editCat = null;
    closeModal(); Nav.refresh(); toast('已修改');
  }
};

/* ============================================
   SPORT
   ============================================ */
const Sport = {
  _type: null, _int: null,
  render() {
    const items = DB.get('sport', []).slice().sort((a, b) => b.ts - a.ts);
    const now = new Date();
    const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay()); weekStart.setHours(0, 0, 0, 0);
    const weekItems = items.filter(i => new Date(i.date) >= weekStart);
    const weekMin = weekItems.reduce((s, i) => s + i.duration, 0);
    const list = items.slice(0, 20).map(i => `
      <div class="list-item">
        <div class="main"><div class="title">${esc(i.type)} · ${i.duration}分钟</div><div class="sub">${fmtDate(i.date)} ${i.note ? '· ' + esc(i.note) : ''}</div></div>
        <span class="badge orange">${esc(i.intensity || '')}</span>
        <button class="task-delete" onclick="Sport.edit('${i.id}')" style="color:var(--primary)">${ICONS.edit}</button>
        <button class="task-delete" onclick="Sport.del('${i.id}')">${ICONS.trash}</button>
      </div>`).join('') || `<div class="empty"><div class="emoji">🏃</div><div>还没有运动记录</div></div>`;
    return `
      <div class="card"><div class="card-title"><span>本周运动</span></div>
        <div class="stat-row">
          <div class="stat-box"><div class="num">${weekMin}</div><div class="lbl">本周分钟</div></div>
          <div class="stat-box"><div class="num">${weekItems.length}</div><div class="lbl">本周次数</div></div>
        </div>
      </div>
      <div class="card"><div class="card-title"><span>记录运动</span></div>
        <span class="label">运动类型</span>
        <div class="chips" id="sportType">${['跑步', '走路', '骑行', '游泳', '健身', '瑜伽', '球类', '其他'].map(t => `<div class="chip" onclick="Sport.set('${t}')">${t}</div>`).join('')}</div>
        <span class="label">强度</span>
        <div class="chips" id="sportInt">${['轻松', '中等', '高强度'].map(t => `<div class="chip" onclick="Sport.setInt('${t}')">${t}</div>`).join('')}</div>
        <span class="label">时长（分钟）</span><input type="number" class="input" id="sportDur" placeholder="如 30">
        <span class="label">备注</span><input class="input" id="sportNote" placeholder="感受、地点等">
        <button class="btn" onclick="Sport.save()">记录</button>
      </div>
      <div class="card"><div class="card-title"><span>最近记录</span></div>${list}</div>
    `;
  },
  set(t) { Sport._type = t; $$('#sportType .chip').forEach(c => c.classList.toggle('active', c.textContent === t)); },
  setInt(t) { Sport._int = t; $$('#sportInt .chip').forEach(c => c.classList.toggle('active', c.textContent === t)); },
  save() {
    if (!Sport._type) return toast('请选择运动类型');
    const dur = +$('#sportDur').value;
    if (!dur) return toast('请输入时长');
    const items = DB.get('sport', []);
    items.push({ id: uid(), type: Sport._type, duration: dur, intensity: Sport._int, note: $('#sportNote').value.trim(), date: todayStr(), ts: Date.now() });
    DB.set('sport', items);
    Sport._type = Sport._int = null;
    Nav.refresh(); toast('已记录运动');
  },
  del(id) { if (!confirm('确认删除这条运动记录？')) return; DB.set('sport', DB.get('sport', []).filter(i => i.id !== id)); Nav.refresh(); toast('已删除'); },
  edit(id) {
    const items = DB.get('sport', []);
    const i = items.find(x => x.id === id);
    if (!i) return;
    Sport._editType = i.type;
    Sport._editInt = i.intensity;
    openModal(`<h3>编辑运动记录</h3>
      <span class="label">运动类型</span>
      <div class="chips" id="editSportType">${['跑步', '走路', '骑行', '游泳', '健身', '瑜伽', '球类', '其他'].map(t => `<div class="chip ${i.type === t ? 'active' : ''}" onclick="Sport.setEditType('${t}')">${t}</div>`).join('')}</div>
      <span class="label">强度</span>
      <div class="chips" id="editSportInt">${['轻松', '中等', '高强度'].map(t => `<div class="chip ${i.intensity === t ? 'active' : ''}" onclick="Sport.setEditInt('${t}')">${t}</div>`).join('')}</div>
      <span class="label">时长（分钟）</span><input type="number" class="input" id="editSportDur" value="${i.duration}">
      <span class="label">备注</span><input class="input" id="editSportNote" value="${esc(i.note || '')}">
      <span class="label">日期</span><input type="date" class="input" id="editSportDate" value="${i.date}">
      <button class="btn" onclick="Sport.saveEdit('${id}')">保存修改</button>`);
  },
  setEditType(t) { Sport._editType = t; $$('#editSportType .chip').forEach(c => c.classList.toggle('active', c.textContent === t)); },
  setEditInt(t) { Sport._editInt = t; $$('#editSportInt .chip').forEach(c => c.classList.toggle('active', c.textContent === t)); },
  saveEdit(id) {
    const items = DB.get('sport', []);
    const i = items.find(x => x.id === id);
    if (!i) return;
    if (!Sport._editType) return toast('请选择运动类型');
    const dur = +$('#editSportDur').value;
    if (!dur) return toast('请输入时长');
    i.type = Sport._editType;
    i.intensity = Sport._editInt;
    i.duration = dur;
    i.note = $('#editSportNote').value.trim();
    i.date = $('#editSportDate').value || i.date;
    DB.set('sport', items);
    Sport._editType = Sport._editInt = null;
    closeModal(); Nav.refresh(); toast('已修改');
  }
};

/* ============================================
   WISHES
   ============================================ */
const Wishes = {
  render() {
    const items = DB.get('wishes', []);
    const wishes = items.filter(i => i.type === 'wish');
    const projects = items.filter(i => i.type === 'project');
    const wishHtml = wishes.length ? wishes.map(w => `
      <div class="task-item ${w.done ? 'done' : ''}">
        <div class="checkbox ${w.done ? 'checked' : ''}" onclick="Wishes.toggle('${w.id}')">${ICONS.check}</div>
        <div class="task-text" onclick="Wishes.toggle('${w.id}')">${esc(w.text)}</div>
        <button class="task-delete" onclick="Wishes.editWish('${w.id}')" style="color:var(--primary)">${ICONS.edit}</button>
        <button class="task-delete" onclick="Wishes.del('${w.id}')">${ICONS.trash}</button>
      </div>`).join('') : '';
    const projHtml = projects.length ? projects.map(p => {
      const tasks = p.tasks || [];
      const doneTasks = tasks.filter(t => t.done).length;
      const pct = tasks.length ? Math.round(doneTasks / tasks.length * 100) : 0;
      return `<div class="card" onclick="Wishes.openProject('${p.id}')">
        <div style="display:flex;justify-content:space-between;align-items:start">
          <div style="flex:1"><div style="font-size:16px;font-weight:700">${esc(p.text)}</div>${p.note ? `<div style="font-size:12px;color:var(--text-2);margin-top:2px">${esc(p.note)}</div>` : ''}</div>
          <span class="badge pink">${pct}%</span>
        </div>
        ${tasks.length ? `<div class="progress-bar"><div class="fill" style="width:${pct}%;background:var(--pink)"></div></div><div style="font-size:11px;color:var(--text-2)">${doneTasks}/${tasks.length} 阶段完成</div>` : ''}
      </div>`;
    }).join('') : '';
    return `
      <div class="card"><div class="card-title"><span>✨ 愿望清单 · ${wishes.filter(w => !w.done).length} 个</span><a onclick="Wishes.addWish()">+ 添加</a></div>
        ${wishHtml || `<div class="empty"><div class="emoji">⭐</div><div>把突然冒出来的想法放这里</div></div>`}
      </div>
      <div class="card"><div class="card-title"><span>🎯 人生项目 · ${projects.length} 个</span><a onclick="Wishes.addProject()">+ 新建</a></div>
        ${projHtml || `<div class="empty"><div class="emoji">🎯</div><div>大到人生长期目标，拆解成阶段任务</div></div>`}
      </div>
    `;
  },
  addWish() { openModal(`<h3>添加愿望</h3><textarea class="textarea" id="wishText" placeholder="突然冒出来的想法…"></textarea><button class="btn" onclick="Wishes.saveWish()">保存</button>`); },
  saveWish() {
    const text = $('#wishText').value.trim();
    if (!text) return toast('请输入内容');
    const items = DB.get('wishes', []);
    items.push({ id: uid(), type: 'wish', text, done: false, createdAt: Date.now() });
    DB.set('wishes', items);
    closeModal(); Nav.refresh(); toast('已添加');
  },
  addProject() { openModal(`<h3>新建人生项目</h3><span class="label">项目名称</span><input class="input" id="projText" placeholder="如：学好英语、买房、跑半马"><span class="label">为什么重要</span><textarea class="textarea" id="projNote" placeholder="写下你的动机"></textarea><button class="btn" onclick="Wishes.saveProject()">创建</button>`); },
  saveProject() {
    const text = $('#projText').value.trim();
    if (!text) return toast('请输入项目名称');
    const items = DB.get('wishes', []);
    items.push({ id: uid(), type: 'project', text, note: $('#projNote').value.trim(), tasks: [], createdAt: Date.now() });
    DB.set('wishes', items);
    closeModal(); Nav.refresh(); toast('项目已创建');
  },
  openProject(id) {
    const items = DB.get('wishes', []);
    const p = items.find(x => x.id === id);
    if (!p) return;
    const tasks = p.tasks || [];
    const taskHtml = tasks.length ? tasks.map(t => `
      <div class="task-item ${t.done ? 'done' : ''}">
        <div class="checkbox ${t.done ? 'checked' : ''}" onclick="Wishes.toggleTask('${id}','${t.id}')">${ICONS.check}</div>
        <div class="task-text" onclick="Wishes.toggleTask('${id}','${t.id}')">${esc(t.text)}</div>
        <button class="task-delete" onclick="Wishes.delTask('${id}','${t.id}')">${ICONS.trash}</button>
      </div>`).join('') : `<div class="empty" style="padding:20px"><div>还没有阶段任务</div></div>`;
    openModal(`<h3>${esc(p.text)}</h3>
      ${p.note ? `<div style="font-size:13px;color:var(--text-2);margin-bottom:12px;line-height:1.6">${esc(p.note)}</div>` : ''}
      <div style="margin-bottom:8px"><input class="input" id="newTaskInput" placeholder="+ 添加阶段任务，回车确认" onkeypress="if(event.key==='Enter')Wishes.addTask('${id}')"></div>
      <div>${taskHtml}</div>
      <button class="btn secondary" onclick="Wishes.del('${id}');closeModal()" style="margin-top:16px">删除整个项目</button>`);
  },
  addTask(id) {
    const text = $('#newTaskInput').value.trim();
    if (!text) return;
    const items = DB.get('wishes', []);
    const p = items.find(x => x.id === id);
    if (!p) return;
    p.tasks = p.tasks || [];
    p.tasks.push({ id: uid(), text, done: false });
    DB.set('wishes', items);
    closeModal(); Wishes.openProject(id);
  },
  toggleTask(id, tid) {
    const items = DB.get('wishes', []);
    const p = items.find(x => x.id === id);
    const t = p.tasks.find(x => x.id === tid);
    if (t) { t.done = !t.done; DB.set('wishes', items); closeModal(); Wishes.openProject(id); }
  },
  delTask(id, tid) {
    const items = DB.get('wishes', []);
    const p = items.find(x => x.id === id);
    p.tasks = p.tasks.filter(t => t.id !== tid);
    DB.set('wishes', items);
    closeModal(); Wishes.openProject(id);
  },
  toggle(id) { const items = DB.get('wishes', []); const w = items.find(x => x.id === id); if (w) { w.done = !w.done; DB.set('wishes', items); Nav.refresh(); } },
  del(id) { if (!confirm('确认删除？')) return; DB.set('wishes', DB.get('wishes', []).filter(i => i.id !== id)); Nav.refresh(); toast('已删除'); },
  editWish(id) {
    const items = DB.get('wishes', []);
    const w = items.find(x => x.id === id);
    if (!w) return;
    openModal(`<h3>编辑愿望</h3>
      <textarea class="textarea" id="editWishText">${esc(w.text)}</textarea>
      <label style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-2);margin:8px 0">
        <input type="checkbox" id="editWishDone" ${w.done ? 'checked' : ''}> 标记为已完成
      </label>
      <button class="btn" onclick="Wishes.saveEditWish('${id}')">保存修改</button>`);
  },
  saveEditWish(id) {
    const items = DB.get('wishes', []);
    const w = items.find(x => x.id === id);
    if (!w) return;
    const text = $('#editWishText').value.trim();
    if (!text) return toast('请输入内容');
    w.text = text;
    w.done = $('#editWishDone').checked;
    DB.set('wishes', items);
    closeModal(); Nav.refresh(); toast('已保存修改');
  }
};

/* ============================================
   CYCLE
   ============================================ */
const Cycle = {
  _viewYear: null, _viewMonth: null,
  getAvgCycle() { return DB.get('cycleAvg', 28); },
  getAvgPeriod() { return DB.get('periodAvg', 5); },
  render() {
    const phase = Cycle.getCurrentPhase();
    const cal = Cycle.renderCalendar();
    const periods = DB.get('periods', []).sort();
    let phaseCard = '';
    if (phase) {
      phaseCard = `<div class="phase-card" style="background:${phase.color}">
        <div class="phase-name">${phase.name}</div>
        <div class="phase-desc">${phase.desc}</div>
        <div class="tips">${phase.tips}</div>
      </div>`;
    } else {
      phaseCard = `<div class="card"><div class="empty"><div class="emoji">💗</div><div>记录一次经期开始日期，即可获得预测和温馨提示</div></div></div>`;
    }
    return `
      ${phaseCard}
      <div class="card"><div class="card-title"><span>⚙️ 周期设置</span><a onclick="Cycle.editCycle()">编辑</a></div>
        <div style="display:flex;gap:10px">
          <div class="stat-box" style="flex:1"><div class="num" style="font-size:18px">${Cycle.getAvgCycle()}</div><div class="lbl">平均周期(天)</div></div>
          <div class="stat-box" style="flex:1"><div class="num" style="font-size:18px">${Cycle.getAvgPeriod()}</div><div class="lbl">平均经期(天)</div></div>
        </div>
        <div style="font-size:11px;color:var(--text-3);margin-top:8px">记录越多预测越准，也可手动调整周期天数。</div>
      </div>
      ${Cycle.renderPrediction()}
      <div class="card"><div class="card-title"><span>日历视图</span><a onclick="Cycle.logPeriod()">+ 标记经期</a></div>
        ${cal}
        <div style="display:flex;gap:12px;font-size:11px;color:var(--text-2);margin-top:12px;flex-wrap:wrap">
          <span><span style="display:inline-block;width:10px;height:10px;background:var(--pink);border-radius:3px;vertical-align:middle"></span> 经期</span>
          <span><span style="display:inline-block;width:10px;height:10px;background:rgba(236,64,122,0.3);border-radius:3px;vertical-align:middle"></span> 预测</span>
          <span><span style="display:inline-block;width:10px;height:10px;background:var(--warning);border-radius:3px;vertical-align:middle"></span> 排卵期</span>
        </div>
      </div>
      ${periods.length ? `<div class="card"><div class="card-title"><span>历史记录</span></div>
        <div style="display:flex;gap:10px;overflow-x:auto;padding-bottom:8px;-webkit-overflow-scrolling:touch">
        ${periods.slice().reverse().map(p => {
          const lens = DB.get('periodLens', {});
          const len = lens[p] || 5;
          const endDate = new Date(p); endDate.setDate(endDate.getDate() + len - 1);
          const endStr = endDate.toISOString().slice(0,10);
          const range = len > 1 ? `${fmtDateFull(p)} ~ ${fmtDateFull(endStr)}` : fmtDateFull(p);
          return `<div style="flex-shrink:0;min-width:180px;background:var(--bg-2);border-radius:12px;padding:12px;border:1px solid var(--border)"><div style="font-size:13px;font-weight:600;color:var(--text-1);margin-bottom:4px">${range}</div><div style="font-size:11px;color:var(--text-2);margin-bottom:8px">${len}天</div><button class="btn secondary" style="padding:4px 10px;font-size:12px;width:100%" onclick="Cycle.delPeriod('${p}')">删除</button></div>`;
        }).join('')}
        </div>
      </div>` : '<div class="card"><div class="empty"><div class="emoji">📝</div><div>暂无历史记录，标记经期后将显示在此</div></div></div>'}
    `;
  },
  editCycle() {
    openModal(`<h3>周期设置</h3>
      <span class="label">平均周期天数（一般21-35）</span><input type="number" class="input" id="cycleAvg" value="${Cycle.getAvgCycle()}" min="20" max="45">
      <span class="label">平均经期天数（一般3-7）</span><input type="number" class="input" id="periodAvg" value="${Cycle.getAvgPeriod()}" min="2" max="12">
      <button class="btn" onclick="Cycle.saveCycle()">保存</button>`);
  },
  saveCycle() {
    const c = clamp(+$('#cycleAvg').value || 28, 20, 45);
    const p = clamp(+$('#periodAvg').value || 5, 2, 12);
    DB.set('cycleAvg', c); DB.set('periodAvg', p);
    closeModal(); Nav.refresh(); toast('已保存周期设置');
  },
  logPeriod() {
    openModal(`<h3>标记经期</h3>
      <span class="label">开始日期</span>
      <input type="date" class="input" id="periodStart" value="${todayStr()}">
      <span class="label">结束日期（可选，不填则默认5天）</span>
      <input type="date" class="input" id="periodEnd">
      <button class="btn" onclick="Cycle.savePeriod()">保存</button>`);
  },
  savePeriod() {
    const start = $('#periodStart').value;
    if (!start) return toast('请选择开始日期');
    const end = $('#periodEnd').value;
    let len = 5;
    if (end) {
      len = Math.max(1, Math.round((new Date(end) - new Date(start)) / 86400000) + 1);
    }
    const periods = DB.get('periods', []);
    if (!periods.includes(start)) periods.push(start);
    DB.set('periods', periods.sort());
    const lens = DB.get('periodLens', {});
    lens[start] = len;
    DB.set('periodLens', lens);
    closeModal(); PetCat.cheer('记录好啦 💗'); Nav.refresh(); toast('已记录');
  },
  delPeriod(date) {
    DB.set('periods', DB.get('periods', []).filter(p => p !== date));
    const lens = DB.get('periodLens', {});
    delete lens[date];
    DB.set('periodLens', lens);
    Nav.refresh(); toast('已删除');
  },
  renderPrediction() {
    const periods = DB.get('periods', []).sort();
    if (!periods.length) return '';
    const lens = DB.get('periodLens', {});
    const cycles = [];
    for (let i = 1; i < periods.length; i++) cycles.push((new Date(periods[i]) - new Date(periods[i - 1])) / 86400000);
    const avgCycle = cycles.length ? Math.round(cycles.reduce((s, c) => s + c, 0) / cycles.length) : Cycle.getAvgCycle();
    const last = periods[periods.length - 1];
    const lastLen = lens[last] || Cycle.getAvgPeriod();
    const nextDate = new Date(last); nextDate.setDate(nextDate.getDate() + avgCycle);
    const nextEnd = new Date(nextDate); nextEnd.setDate(nextEnd.getDate() + lastLen - 1);
    const ovDate = new Date(nextDate); ovDate.setDate(ovDate.getDate() - 14);
    const daysToNext = Math.ceil((nextDate - new Date(todayStr())) / 86400000);
    const daysToOv = Math.ceil((ovDate - new Date(todayStr())) / 86400000);
    return `<div class="card">
      <div class="card-title"><span>预测信息</span></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <div class="stat-box" style="flex:1;min-width:100px"><div class="num" style="font-size:16px;color:var(--pink)">${daysToNext > 0 ? daysToNext + '天' : '已到'}</div><div class="lbl">下次经期</div><div style="font-size:11px;color:var(--text-2);margin-top:2px">${fmtDateFull(nextDate.toISOString().slice(0,10))}</div></div>
        <div class="stat-box" style="flex:1;min-width:100px"><div class="num" style="font-size:16px;color:var(--warning)">${daysToOv > 0 ? daysToOv + '天' : '已过'}</div><div class="lbl">预计排卵日</div><div style="font-size:11px;color:var(--text-2);margin-top:2px">${fmtDateFull(ovDate.toISOString().slice(0,10))}</div></div>
        <div class="stat-box" style="flex:1;min-width:100px"><div class="num" style="font-size:16px">${avgCycle}</div><div class="lbl">平均周期(天)</div></div>
      </div>
    </div>`;
  },
  renderCalendar() {
    const now = new Date();
    const y = Cycle._viewYear ?? now.getFullYear();
    const m = Cycle._viewMonth ?? now.getMonth();
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);
    const startDay = first.getDay();
    const days = last.getDate();
    const prevDays = new Date(y, m, 0).getDate();
    const marks = Cycle.getMarks(y, m);
    const today = todayStr();
    let cells = '';
    const weekdays = '日一二三四五六';
    for (let i = 0; i < 7; i++) cells += `<div class="calendar-weekday">${weekdays[i]}</div>`;
    for (let i = startDay - 1; i >= 0; i--) cells += `<div class="calendar-day other">${prevDays - i}</div>`;
    for (let d = 1; d <= days; d++) {
      const ds = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      let cls = 'calendar-day';
      if (ds === today) cls += ' today';
      const mark = marks[ds];
      if (mark === 'period') cls += ' period';
      else if (mark === 'predicted') cls += ' predicted';
      else if (mark === 'ovulation') cls += ' ovulation';
      cells += `<div class="${cls}">${d}</div>`;
    }
    const remaining = 42 - (startDay + days);
    for (let i = 1; i <= remaining; i++) cells += `<div class="calendar-day other">${i}</div>`;
    return `<div class="calendar-header"><div class="month" style="font-size:16px;font-weight:700"><input type="month" id="cycleMonthPicker" value="${y}-${String(m + 1).padStart(2, '0')}" onchange="Cycle.pickMonth(this.value)" style="border:none;background:transparent;font-size:16px;font-weight:700;color:var(--primary-dark);text-align:center;cursor:pointer;outline:none;padding:4px 8px;border-radius:8px"></div></div><div class="calendar-grid">${cells}</div>`;
  },
  shiftMonth(n) {
    let y = Cycle._viewYear ?? new Date().getFullYear();
    let m = (Cycle._viewMonth ?? new Date().getMonth()) + n;
    while (m < 0) { m += 12; y--; }
    while (m > 11) { m -= 12; y++; }
    Cycle._viewYear = y; Cycle._viewMonth = m;
    Nav.refresh();
  },
  pickMonth(val) {
    if (!val) return;
    const [y, m] = val.split('-').map(Number);
    Cycle._viewYear = y; Cycle._viewMonth = m - 1;
    Nav.refresh();
  },
  getMarks(y, m) {
    const periods = DB.get('periods', []).sort();
    const lens = DB.get('periodLens', {});
    const marks = {};
    if (!periods.length) return marks;
    periods.forEach(p => {
      const len = lens[p] || Cycle.getAvgPeriod();
      const start = new Date(p);
      for (let i = 0; i < len; i++) {
        const d = new Date(start); d.setDate(start.getDate() + i);
        marks[d.toISOString().slice(0, 10)] = 'period';
      }
    });
    const last = periods[periods.length - 1];
    const cycles = [];
    for (let i = 1; i < periods.length; i++) cycles.push((new Date(periods[i]) - new Date(periods[i - 1])) / 86400000);
    const avgCycle = cycles.length ? Math.round(cycles.reduce((s, c) => s + c, 0) / cycles.length) : Cycle.getAvgCycle();
    const lastLen = lens[last] || Cycle.getAvgPeriod();
    for (let k = 1; k <= 3; k++) {
      const start = new Date(last); start.setDate(start.getDate() + avgCycle * k);
      for (let i = 0; i < lastLen; i++) {
        const d = new Date(start); d.setDate(start.getDate() + i);
        const ds = d.toISOString().slice(0, 10);
        if (!marks[ds]) marks[ds] = 'predicted';
      }
      const ov = new Date(start); ov.setDate(ov.getDate() - 14);
      for (let i = -1; i <= 1; i++) {
        const d = new Date(ov); d.setDate(ov.getDate() + i);
        const ds = d.toISOString().slice(0, 10);
        if (!marks[ds]) marks[ds] = 'ovulation';
      }
    }
    return marks;
  },
  getCurrentPhase() {
    const periods = DB.get('periods', []).sort();
    if (!periods.length) return null;
    const lens = DB.get('periodLens', {});
    const cycles = [];
    for (let i = 1; i < periods.length; i++) cycles.push((new Date(periods[i]) - new Date(periods[i - 1])) / 86400000);
    const avgCycle = cycles.length ? Math.round(cycles.reduce((s, c) => s + c, 0) / cycles.length) : Cycle.getAvgCycle();
    const last = periods[periods.length - 1];
    const lastLen = lens[last] || Cycle.getAvgPeriod();
    const daysSinceLast = Math.floor((new Date(todayStr()) - new Date(last)) / 86400000);
    const dayInCycle = daysSinceLast + 1;
    const daysToNext = avgCycle - daysSinceLast;
    if (daysSinceLast < 0) return { name: '非经期', desc: '距离上次记录已过较久', color: '#94a3b8', tips: '<strong>提示：</strong>建议持续记录，预测会更准。' };
    if (dayInCycle <= lastLen) return { name: '经期中', desc: `第 ${dayInCycle} 天 · 预计还剩 ${lastLen - dayInCycle + 1} 天`, color: '#ec407a', tips: '<strong>🩸 经期提示</strong><br>• 饮食：温热为主，避免生冷寒凉，适量补铁<br>• 情绪：激素波动大，易烦躁，允许自己慢一点<br>• 运动：散步、瑜伽等轻度为主，避免高强度<br>• 休息：多睡，注意保暖，避免久坐' };
    if (dayInCycle >= avgCycle - 16 && dayInCycle <= avgCycle - 12) return { name: '排卵期', desc: `周期第 ${dayInCycle} 天 · 受孕几率高`, color: '#ffa726', tips: '<strong>🥚 排卵期提示</strong><br>• 饮食：优质蛋白，补充锌、维E<br>• 情绪：精力较旺盛，适合社交和挑战性工作<br>• 运动：体能佳，可安排中高强度训练<br>• 休息：注意白带变化，保持私处清洁' };
    if (dayInCycle > lastLen && dayInCycle <= 14) return { name: '卵泡期', desc: `周期第 ${dayInCycle} 天 · 身体在恢复`, color: '#ab47bc', tips: '<strong>🌱 卵泡期提示</strong><br>• 饮食：均衡饮食，多蔬果，补充维B群<br>• 情绪：状态回升，适合做需要专注的事<br>• 运动：可逐步增加强度，力量训练效果好<br>• 休息：建立规律作息，为排卵期储备精力' };
    return { name: '黄体期', desc: `周期第 ${dayInCycle} 天 · 预计 ${daysToNext} 天后下次经期`, color: '#7cb342', tips: '<strong>🍂 黄体期提示</strong><br>• 饮食：少盐少糖，缓解水肿；补镁助稳情绪<br>• 情绪：易出现 PMS（烦躁、低落），是正常的<br>• 运动：中等强度有氧有助于缓解经前不适<br>• 休息：嗜睡属正常，早睡早起，准备好卫生用品' };
  }
};

/* ============================================
   HABITS
   ============================================ */
const Habits = {
  render() {
    const habits = DB.get('habits', []);
    const today = todayStr();
    const list = habits.length ? habits.map(h => {
      const logs = h.logs || [];
      const doneToday = logs.includes(today);
      let streak = 0;
      const d = new Date(today);
      if (!doneToday) d.setDate(d.getDate() - 1);
      while (true) {
        const ds = d.toISOString().slice(0, 10);
        if (logs.includes(ds)) { streak++; d.setDate(d.getDate() - 1); } else break;
      }
      const monthStr = today.slice(0, 7);
      const monthDone = logs.filter(l => l.startsWith(monthStr)).length;
      return `<div class="habit-row">
        <div class="checkbox ${doneToday ? 'checked' : ''}" onclick="Habits.toggle('${h.id}')">${ICONS.check}</div>
        <div style="flex:1">
          <div class="title" style="font-size:15px;font-weight:600" onclick="Habits.toggle('${h.id}')">${esc(h.name)}</div>
          <div style="font-size:11px;color:var(--text-2)"><span class="habit-streak">🔥 ${streak} 天连续</span> · 本月 ${monthDone} 次${h.slot ? ' · ' + esc(h.slot) : ''}${h.freq ? ' · ' + esc(h.freq) : ''}</div>
        </div>
        <button class="task-delete" onclick="Habits.edit('${h.id}')" style="color:var(--primary)">${ICONS.edit}</button>
        <button class="task-delete" onclick="Habits.del('${h.id}')">${ICONS.trash}</button>
      </div>`;
    }).join('') : `<div class="empty"><div class="emoji">🔥</div><div>还没有习惯，添加一个想长期坚持的事</div></div>`;
    const todayDone = habits.filter(h => (h.logs || []).includes(today)).length;
    return `
      <div class="card"><div class="card-title"><span>今日 · ${todayDone}/${habits.length} 已完成</span><a onclick="Habits.add()">+ 新建</a></div>${list}</div>
      <div style="font-size:11px;color:var(--text-3);text-align:center;padding:0 16px;line-height:1.6">习惯是长期坚持的事（喝水、读书、冥想），点击方框即可打卡。</div>
    `;
  },
  add() {
    Habits._slot = '随时'; Habits._freq = '每天';
    openModal(`<h3>新建习惯</h3>
      <span class="label">习惯名称</span><input class="input" id="habitName" placeholder="如：每天喝水8杯">
      <span class="label">时间段</span>
      <div class="chips" id="habitSlot">${['清晨','上午','下午','傍晚','晚上','随时'].map(t => `<div class="chip ${t==='随时'?'active':''}" onclick="Habits.setSlot('${t}')">${t}</div>`).join('')}</div>
      <span class="label">目标频次</span>
      <div class="chips" id="habitFreq">${['每天','每周3次','每周5次','工作日'].map(t => `<div class="chip ${t==='每天'?'active':''}" onclick="Habits.setFreq('${t}')">${t}</div>`).join('')}</div>
      <button class="btn" onclick="Habits.save()">创建</button>`);
  },
  setSlot(t) { Habits._slot = t; $$('#habitSlot .chip').forEach(c => c.classList.toggle('active', c.textContent === t)); },
  setFreq(t) { Habits._freq = t; $$('#habitFreq .chip').forEach(c => c.classList.toggle('active', c.textContent === t)); },
  save() {
    const name = $('#habitName').value.trim();
    if (!name) return toast('请输入名称');
    const habits = DB.get('habits', []);
    habits.push({ id: uid(), name, slot: Habits._slot || '随时', freq: Habits._freq || '每天', logs: [], createdAt: Date.now() });
    DB.set('habits', habits);
    closeModal(); Nav.refresh(); toast('已创建习惯');
  },
  toggle(id) {
    const habits = DB.get('habits', []);
    const h = habits.find(x => x.id === id);
    if (!h) return;
    h.logs = h.logs || [];
    const today = todayStr();
    const i = h.logs.indexOf(today);
    if (i >= 0) h.logs.splice(i, 1);
    else { h.logs.push(today); PetCat.cheer('习惯打卡 ✅ 棒！'); }
    DB.set('habits', habits);
    Nav.refresh();
  },
  del(id) { if (!confirm('确认删除这个习惯？')) return; DB.set('habits', DB.get('habits', []).filter(h => h.id !== id)); Nav.refresh(); toast('已删除'); },
  edit(id) {
    const habits = DB.get('habits', []);
    const h = habits.find(x => x.id === id);
    if (!h) return;
    Habits._slot = h.slot || '随时'; Habits._freq = h.freq || '每天';
    openModal(`<h3>编辑习惯</h3>
      <span class="label">习惯名称</span>
      <input class="input" id="editHabitName" value="${esc(h.name)}">
      <span class="label">时间段</span>
      <div class="chips" id="habitSlot">${['清晨','上午','下午','傍晚','晚上','随时'].map(t => `<div class="chip ${t===(h.slot||'随时')?'active':''}" onclick="Habits.setSlot('${t}')">${t}</div>`).join('')}</div>
      <span class="label">目标频次</span>
      <div class="chips" id="habitFreq">${['每天','每周3次','每周5次','工作日'].map(t => `<div class="chip ${t===(h.freq||'每天')?'active':''}" onclick="Habits.setFreq('${t}')">${t}</div>`).join('')}</div>
      <button class="btn" onclick="Habits.saveEdit('${id}')">保存修改</button>
      <button class="btn secondary" onclick="Habits.clearLogs('${id}')" style="margin-top:8px">清空打卡记录</button>`);
  },
  saveEdit(id) {
    const habits = DB.get('habits', []);
    const h = habits.find(x => x.id === id);
    if (!h) return;
    const name = $('#editHabitName').value.trim();
    if (!name) return toast('请输入名称');
    h.name = name;
    h.slot = Habits._slot || '随时';
    h.freq = Habits._freq || '每天';
    DB.set('habits', habits);
    closeModal(); Nav.refresh(); toast('已保存修改');
  },
  clearLogs(id) {
    if (!confirm('确认清空所有打卡记录？习惯本身会保留。')) return;
    const habits = DB.get('habits', []);
    const h = habits.find(x => x.id === id);
    if (!h) return;
    h.logs = [];
    DB.set('habits', habits);
    closeModal(); Nav.refresh(); toast('已清空记录');
  }
};

/* ============================================
   SEARCH — 全模块搜索
   ============================================ */
const Search = {
  open() {
    openModal(`<h3>🔍 全模块搜索</h3>
      <input class="input" id="searchInput" placeholder="输入关键词，跨模块查找任务/记录" oninput="Search.run(this.value)" autofocus>
      <div id="searchResults" style="margin-top:8px;max-height:50vh;overflow-y:auto"></div>`);
  },
  run(kw) {
    const box = $('#searchResults');
    if (!box) return;
    kw = (kw || '').trim().toLowerCase();
    if (!kw) { box.innerHTML = '<div style="color:var(--text-3);font-size:13px;padding:12px">输入关键词开始搜索</div>'; return; }
    const results = [];
    DB.get('donelist', []).forEach(t => { if (t.text.toLowerCase().includes(kw)) results.push({ mod: '待办', text: t.text, date: t.date, done: t.done }); });
    DB.get('backlog', []).forEach(i => { if (i.text.toLowerCase().includes(kw)) results.push({ mod: '不急事项', text: i.text, date: '', done: i.done }); });
    DB.get('money', []).forEach(m => { if ((m.category + (m.note||'')).toLowerCase().includes(kw)) results.push({ mod: '记账', text: `${m.type==='income'?'+':'−'}¥${m.amount} ${m.category}`, date: m.date, done: false }); });
    DB.get('sport', []).forEach(s => { if (s.type.toLowerCase().includes(kw)) results.push({ mod: '运动', text: `${s.type} ${s.duration}分钟`, date: s.date, done: false }); });
    DB.get('wishes', []).forEach(w => { if (w.text.toLowerCase().includes(kw)) results.push({ mod: '愿望', text: w.text, date: '', done: w.done }); });
    DB.get('habits', []).forEach(h => { if (h.name.toLowerCase().includes(kw)) results.push({ mod: '习惯', text: h.name, date: '', done: false }); });
    DB.get('goodwords', []).forEach(g => { if ((g.title+g.content).toLowerCase().includes(kw)) results.push({ mod: '好词好句', text: g.title, date: g.date, done: false }); });
    DB.get('subjects', []).forEach(s => {
      if (s.name.toLowerCase().includes(kw)) results.push({ mod: '科目', text: s.name, date: '', done: false });
      (s.logs||[]).forEach(l => { if (l.content.toLowerCase().includes(kw)) results.push({ mod: s.name+' 学习', text: l.content, date: l.date, done: false }); });
    });
    if (!results.length) { box.innerHTML = '<div style="color:var(--text-3);font-size:13px;padding:12px">未找到匹配结果</div>'; return; }
    box.innerHTML = results.slice(0, 50).map(r => `<div class="list-item"><div class="main"><div class="title" style="font-size:14px">${esc(r.text)}</div><div class="sub"><span class="badge gray" style="font-size:10px">${r.mod}</span> ${r.date ? ' · ' + fmtDate(r.date) : ''}${r.done ? ' · 已完成' : ''}</div></div></div>`).join('');
  }
};

/* ============================================
   POMODORO — 已移除（计时功能并入自考备考「科目独立计时器」）
   ============================================ */

/* ============================================
   SETTINGS — 含自定义模块管理
   ============================================ */
const Settings = {
  render() {
    const counts = Object.entries(DB.all()).map(([k, v]) => {
      if (Array.isArray(v)) return [k, v.length];
      if (typeof v === 'object' && v) return [k, Object.keys(v).length];
      return [k, 1];
    });
    const total = counts.reduce((s, [, n]) => s + n, 0);
    const labels = { donelist: 'Donelist', sleep: '作息', subjects: '自考科目', backlog: '待办池', money: '记账', sport: '运动', wishes: '愿望', periods: '经期', habits: '习惯', dailyPolitics: '时政内容', dailyEssay: '申论内容', customModules: '自定义模块' };
    const countHtml = counts.filter(([k]) => labels[k]).map(([k, n]) => `<div class="list-item"><div class="main"><div class="title">${labels[k]}</div></div><div class="right"><span class="badge gray">${n}</span></div></div>`).join('');

    const customMods = DB.get('customModules', []);
    const customHtml = customMods.length ? customMods.map(m => `
      <div class="list-item">
        <div class="main"><div class="title">${esc(m.title)}</div><div class="sub">${esc(m.desc)}</div></div>
        <button class="task-delete" onclick="Settings.delModule('${m.id}')">${ICONS.trash}</button>
      </div>`).join('') : `<div class="empty" style="padding:20px"><div class="emoji">🧩</div><div>还没有自定义模块</div></div>`;

    return `
      <div class="card"><div class="card-title"><span>🧩 自定义模块</span><a onclick="Settings.addModule()">+ 新建</a></div>
        ${customHtml}
        <div style="font-size:11px;color:var(--text-3);margin-top:8px;line-height:1.5">可添加自定义模块，用于备忘或未来扩展。自定义模块支持文字记录、勾选标记。</div>
      </div>
      <div class="card"><div class="card-title"><span>📊 数据概览 · 共 ${total} 条</span></div>${countHtml}</div>
      <div class="card"><div class="card-title"><span>📡 每日必读·自动更新源</span></div>
        <span class="label">每日必读·新闻源地址（选填）</span>
        <input class="input" id="newsUrlInput" value="${esc(DB.get('newsUrl', ''))}" placeholder="留空=自动(同源相对路径 news/)">
        <button class="btn secondary" onclick="Settings.saveNewsUrl()">保存地址</button>
        <div style="font-size:11px;color:var(--text-3);margin-top:6px;line-height:1.5">部署到 GitHub Pages 后<b>留空即可自动</b>从同站 <code>news/</code> 拉取每日9点生成的最新时政/申论。如需指向其他仓库，可填绝对地址（如 <code>https://raw.githubusercontent.com/用户名/仓库名/main</code>）。不填且未部署时，使用内置真实新闻（已含2026年7月最新内容）。</div>
      </div>
      <div class="card"><div class="card-title"><span>🌗 外观</span></div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:14px;color:var(--text)">暗色护眼模式</span>
          <div class="checkbox ${DB.get('theme','')==='dark'?'checked':''}" onclick="Settings.toggleTheme()" style="width:46px;height:28px;border-radius:14px;background:${DB.get('theme','')==='dark'?'var(--primary)':'var(--border)'};position:relative;cursor:pointer;flex-shrink:0">
            <div style="width:22px;height:22px;border-radius:50%;background:white;position:absolute;top:3px;${DB.get('theme','')==='dark'?'right:3px':'left:3px'};transition:all 0.2s"></div>
          </div>
        </div>
      </div>
      <div class="card"><div class="card-title"><span>🎯 考试倒计时</span><a onclick="Settings.addExam()">+ 添加</a></div>
        ${((DB.get('exams',[]).filter(e=>e.date>=todayStr()).sort((a,b)=>a.date.localeCompare(b.date)).map(e=>{const days=Math.ceil((new Date(e.date)-new Date(todayStr()))/86400000);return `<div class="list-item"><div class="main"><div class="title">${esc(e.name)}</div><div class="sub">${fmtDate(e.date)} · 还有 ${days} 天</div></div><button class="task-delete" onclick="Settings.delExam('${e.id}')">${ICONS.trash}</button></div>`;}).join('')) || '<div class="empty" style="padding:16px"><div class="emoji">🎯</div><div>还没有添加考试</div></div>')}
      </div>
      <div class="card"><div class="card-title"><span>数据管理</span></div>
        <button class="btn secondary" onclick="Settings.export()" style="margin-bottom:8px">${ICONS.download} 导出备份</button>
        <button class="btn secondary" onclick="Settings.import()">导入备份</button>
        <button class="btn secondary" onclick="Settings.exportWeekly()" style="margin-top:8px">📄 导出本周周报</button>
      </div>
      <div class="card"><div class="card-title"><span>关于</span></div>
        <div style="font-size:13px;color:var(--text-2);line-height:1.7">
          <strong>妮妮的工作台 🍃</strong><br>
          一个纯本地存储的生活备考工作台，包含 ${getModules().filter(m => m.id !== 'home').length} 大模块。<br>
          数据完全保存在你的设备上，不会上传任何服务器。<br>
          建议每周导出一次备份。
        </div>
      </div>
      <div class="card"><div class="card-title"><span>危险区</span></div>
        <button class="btn danger" onclick="Settings.clear()">清空所有数据</button>
      </div>
    `;
  },
  addModule() {
    const colorOptions = ['#7cb342', '#66bb6a', '#4fc3f7', '#ab47bc', '#ef5350', '#ffa726', '#26a69a', '#ec407a', '#8d6e63'];
    openModal(`<h3>新建自定义模块</h3>
      <span class="label">模块名称</span>
      <input class="input" id="modTitle" placeholder="如：读书笔记、背单词">
      <span class="label">描述</span>
      <input class="input" id="modDesc" placeholder="一句话说明">
      <span class="label">图标颜色</span>
      <div class="chips" id="modColors">
        ${colorOptions.map((c, i) => `<div class="chip ${i === 0 ? 'active' : ''}" style="${i === 0 ? 'background:' + c + ';color:white' : ''}" onclick="Settings.pickColor('${c}', ${i})" data-color="${c}"><span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:${c};vertical-align:middle"></span></div>`).join('')}
      </div>
      <span class="label">图标</span>
      <div class="chips" id="modIcons">
        ${[['📝', '📝'], ['💡', '💡'], ['📚', '📚'], ['🎵', '🎵'], ['🐾', '🐾'], ['🌸', '🌸'], ['☕', '☕'], ['🎯', '🎯']].map((p, i) => `<div class="chip ${i === 0 ? 'active' : ''}" onclick="Settings.pickIcon('${p[0]}', ${i})" data-icon="${p[0]}">${p[0]}</div>`).join('')}
      </div>
      <button class="btn" onclick="Settings.saveModule()">创建</button>
    `);
    Settings._color = colorOptions[0];
    Settings._icon = '📝';
  },
  pickColor(c, i) {
    Settings._color = c;
    $$('#modColors .chip').forEach((ch, j) => {
      ch.classList.toggle('active', j === i);
      ch.style.background = j === i ? c : '';
      ch.style.color = j === i ? 'white' : '';
    });
  },
  pickIcon(icon, i) {
    Settings._icon = icon;
    $$('#modIcons .chip').forEach((ch, j) => ch.classList.toggle('active', j === i));
  },
  saveModule() {
    const title = $('#modTitle').value.trim();
    if (!title) return toast('请输入模块名称');
    const mods = DB.get('customModules', []);
    const id = 'custom_' + uid();
    mods.push({ id, icon: Settings._icon || '📝', color: Settings._color || '#7cb342', title, desc: $('#modDesc').value.trim() || '自定义模块', group: 'custom', builtIn: false, isCustom: true });
    DB.set('customModules', mods);
    // 注册渲染器
    PAGES[id] = () => CustomModule.render(id);
    closeModal(); Nav.refresh(); toast('已创建模块');
  },
  delModule(id) {
    DB.set('customModules', DB.get('customModules', []).filter(m => m.id !== id));
    DB.set('custom_' + id, []);  // 清空该模块数据
    delete PAGES[id];
    if (Nav.current === id) Nav.go('home');
    else Nav.refresh();
    toast('已删除模块');
  },
  saveNewsUrl() {
    const url = $('#newsUrlInput').value.trim().replace(/\/$/, '');
    DB.set('newsUrl', url);
    DailyRead._cache = {};
    Nav.refresh();
    toast(url ? '已保存，下次打开每日必读将自动更新' : '已清空，使用内置新闻');
  },
  toggleTheme() {
    const cur = document.documentElement.dataset.theme === 'dark' ? '' : 'dark';
    if (cur) document.documentElement.dataset.theme = 'dark';
    else document.documentElement.removeAttribute('data-theme');
    DB.set('theme', cur);
    Nav.refresh();
  },
  addExam() {
    openModal(`<h3>添加考试</h3>
      <span class="label">考试名称</span><input class="input" id="examName" placeholder="如：2026国考、省考">
      <span class="label">考试日期</span><input type="date" class="input" id="examDate">
      <button class="btn" onclick="Settings.saveExam()">保存</button>`);
  },
  saveExam() {
    const name = $('#examName').value.trim();
    const date = $('#examDate').value;
    if (!name || !date) return toast('请填写名称和日期');
    const exams = DB.get('exams', []);
    exams.push({ id: uid(), name, date });
    DB.set('exams', exams);
    closeModal(); Nav.refresh(); toast('已添加考试');
  },
  delExam(id) {
    if (!confirm('删除该考试？')) return;
    DB.set('exams', DB.get('exams', []).filter(e => e.id !== id));
    Nav.refresh(); toast('已删除');
  },
  export() {
    const data = JSON.stringify(DB.all(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `妮妮工作台备份_${todayStr()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('已导出备份');
  },
  exportWeekly() {
    const now = new Date();
    const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay()); weekStart.setHours(0,0,0,0);
    const ws = weekStart.toISOString().slice(0,10);
    const we = todayStr();
    const donelist = DB.get('donelist', []).filter(t => t.date >= ws && t.date <= we);
    const done = donelist.filter(t => t.done).length;
    const sleep = DB.get('sleep', {});
    const sleepDays = Object.keys(sleep).filter(d => d >= ws && d <= we);
    const habits = DB.get('habits', []);
    const habitDone = {};
    habits.forEach(h => { habitDone[h.name] = (h.logs||[]).filter(l => l >= ws && l <= we).length; });
    const money = DB.get('money', []).filter(m => m.date >= ws && m.date <= we);
    const income = money.filter(m => m.type==='income').reduce((s,m)=>s+m.amount,0);
    const expense = money.filter(m => m.type==='expense').reduce((s,m)=>s+m.amount,0);
    const sport = DB.get('sport', []).filter(s => s.date >= ws && s.date <= we);
    const sportMin = sport.reduce((s,s2)=>s+s2.duration,0);
    const subjects = DB.get('subjects', []);
    const weekLogs = subjects.flatMap(sub => (sub.logs||[]).filter(l => l.date >= ws && l.date <= we));
    const studyLogs = weekLogs.length;
    const studyHours = weekLogs.reduce((s,l)=>s+(l.hours||0),0);
    let html = `<h1 style="text-align:center;color:#7cb342">妮妮的工作台 · 本周周报</h1>`;
    html += `<p style="text-align:center;color:#666">${fmtDate(ws)} ~ ${fmtDate(we)}</p>`;
    html += `<h2 style="color:#558b2f">📋 任务</h2><p>本周待办 ${donelist.length} 项，已完成 ${done} 项</p>`;
    html += `<h2 style="color:#558b2f">😴 作息</h2><p>记录 ${sleepDays.length} 天</p>`;
    html += `<h2 style="color:#558b2f">🔥 习惯</h2>`;
    html += Object.entries(habitDone).map(([n,c]) => `${n}: ${c}次`).join('<br>') || '<p>无</p>';
    html += `<h2 style="color:#558b2f">💰 记账</h2><p>收入 ¥${income} · 支出 ¥${expense} · 结余 ¥${income-expense}</p>`;
    html += `<h2 style="color:#558b2f">🏃 运动</h2><p>本周 ${sport.length} 次，共 ${sportMin} 分钟</p>`;
    html += `<h2 style="color:#558b2f">📚 学习</h2><p>学习记录 ${studyLogs} 条 · 累计 ${studyHours} 学时（来自自考备考科目计时）</p>`;
    html += `<hr><p style="text-align:center;color:#999">生成时间 ${new Date().toLocaleString('zh-CN')}</p>`;
    const blob = new Blob([`<html><head><meta charset="utf-8"></head><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">${html}</body></html>`], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `妮妮周报_${ws}_${we}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast('周报已导出');
  },
  import() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          Object.entries(data).forEach(([k, v]) => DB.set(k, v));
          toast('已导入，刷新中…');
          setTimeout(() => Nav.go('home'), 500);
        } catch { toast('文件格式错误'); }
      };
      reader.readAsText(file);
    };
    input.click();
  },
  clear() {
    openModal(`<h3>确认清空所有数据？</h3>
      <div style="font-size:13px;color:var(--danger);margin-bottom:12px">此操作不可恢复，建议先导出备份。</div>
      <div class="row"><button class="btn secondary" onclick="closeModal()">取消</button><button class="btn danger" onclick="Settings.doClear()">确认清空</button></div>`);
  },
  doClear() {
    Object.keys(DB.all()).forEach(k => localStorage.removeItem('nn_' + k));
    closeModal(); Nav.go('home'); toast('已清空');
  }
};

/* ============================================
   Custom Module — 自定义模块渲染
   ============================================ */
const CustomModule = {
  render(id) {
    const def = getModuleDef(id);
    if (!def) return '<div class="empty">模块不存在</div>';
    const items = DB.get('custom_' + id, []);
    const active = items.filter(i => !i.done);
    const done = items.filter(i => i.done);
    const list = (arr) => arr.length ? arr.map(i => `
      <div class="task-item ${i.done ? 'done' : ''}">
        <div class="checkbox ${i.done ? 'checked' : ''}" onclick="CustomModule.toggle('${id}','${i.id}')">${ICONS.check}</div>
        <div style="flex:1">
          <div class="task-text" onclick="CustomModule.toggle('${id}','${i.id}')">${esc(i.text)}</div>
          ${i.note ? `<div class="task-meta">${esc(i.note)}</div>` : ''}
        </div>
        <button class="task-delete" onclick="CustomModule.del('${id}','${i.id}')">${ICONS.trash}</button>
      </div>`).join('') : '';
    return `
      <div class="card"><div class="card-title"><span>${def.icon} ${esc(def.title)} · ${active.length} 项</span><a onclick="CustomModule.add('${id}')">+ 添加</a></div>
        ${list(active) || `<div class="empty"><div class="emoji">${def.icon}</div><div>还没有记录</div></div>`}
      </div>
      ${done.length ? `<div class="card"><div class="card-title"><span>已完成 · ${done.length}</span></div>${list(done)}</div>` : ''}
    `;
  },
  add(id) {
    openModal(`<h3>添加记录</h3>
      <span class="label">内容</span><input class="input" id="cmText" placeholder="记录内容">
      <span class="label">备注</span><input class="input" id="cmNote" placeholder="可选备注">
      <button class="btn" onclick="CustomModule.save('${id}')">保存</button>`);
  },
  save(id) {
    const text = $('#cmText').value.trim();
    if (!text) return toast('请输入内容');
    const items = DB.get('custom_' + id, []);
    items.push({ id: uid(), text, note: $('#cmNote').value.trim(), done: false, createdAt: Date.now() });
    DB.set('custom_' + id, items);
    closeModal(); Nav.refresh(); toast('已添加');
  },
  toggle(id, itemId) {
    const items = DB.get('custom_' + id, []);
    const i = items.find(x => x.id === itemId);
    if (i) { i.done = !i.done; DB.set('custom_' + id, items); Nav.refresh(); }
  },
  del(id, itemId) {
    DB.set('custom_' + id, DB.get('custom_' + id, []).filter(i => i.id !== itemId));
    Nav.refresh();
  }
};

/* ============================================
   PWA install
   ============================================ */
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window._deferredPrompt = e;
  if (Nav.current === 'home') Nav.refresh();
});
function installApp() {
  const p = window._deferredPrompt;
  if (!p) { toast('请用浏览器菜单的"添加到主屏幕"'); return; }
  p.prompt();
  p.userChoice.then(() => { window._deferredPrompt = null; DB.set('installed', true); Nav.refresh(); });
}
window.addEventListener('appinstalled', () => { DB.set('installed', true); });

// Service Worker 注册由 index.html 中的内联脚本处理

/* ============================================
   Boot — 注册自定义模块渲染器并初始化
   ============================================ */
/* ============================================
   陪伴宠物：鲨鱼服小猫咪（可交互版）
   ============================================ */
const PetCat = {
  _t: null, _drag: null, _lastTap: 0,
  _tapCount: 0, _tapTimer: null,        // 抚摸检测
  _wanderTimer: null,                   // 漫游定时器
  _isSleeping: false,

  // —— 随机萌语池（点击时随机选一条）——
  _phrases: [
    '喵~ 🐱', '你好呀！', '摸摸我~ 💕', '今天也要加油哦！',
    '我在呢~', '鲨鱼喵！🦈', '呼噜噜~ 😸', '陪我玩嘛~',
    '你最好啦！', '喵呜~', '好开心！✨', '继续努力！💪',
    '休息一下？', '我在看着你哦~ 👀', '抱抱！🤗', '喵喵喵~',
    '今天辛苦了！', '你最棒了！🌟', '要喝水哦~ 💧', '爱你哟~ ❤️',
  ],

  // —— 时间感知问候 ——
  _timeGreeting() {
    const h = new Date().getHours();
    if (h >= 23 || h < 5) return ['夜深了，早点睡哦~ 🌙', '晚安...zzZ 💤'][Math.random() > 0.5 ? 1 : 0];
    if (h < 8) return ['早上好呀~ ☀️', '早安！新的一天开始啦！'][Math.random() > 0.5 ? 1 : 0];
    if (h < 12) return ['上午好！加油！', '上午工作顺利吗~ 😊'][Math.random() > 0.5 ? 1 : 0];
    if (h < 14) return ['中午啦，吃饭了吗？🍚', '午安~ 休息一下吧'][Math.random() > 0.5 ? 1 : 0];
    if (h < 18) return ['下午好！继续冲！', '下午茶时间~ ☕'][Math.random() > 0.5 ? 1 : 0];
    return ['晚上好~ 辛苦了！', '傍晚了，放松一下~ 🌅'][Math.random() > 0.5 ? 1 : 0];
  },

  init() {
    const cat = document.getElementById('petCat');
    if (!cat || cat._nn_bound) return;
    cat._nn_bound = true;

    // 恢复保存的位置
    const saved = DB.get('catPos', null);
    if (saved && typeof saved.x === 'number') PetCat._applyPos(cat, saved.x, saved.y);

    // 夜间睡眠模式
    PetCat._updateSleepState();
    setInterval(() => PetCat._updateSleepState(), 60000);

    // 启动自动漫游
    PetCat._startWandering();

    // —— 拖拽逻辑 ——
    const start = (e) => {
      const p = e.touches ? e.touches[0] : e;
      const rect = cat.getBoundingClientRect();
      PetCat._drag = { ox: p.clientX - rect.left, oy: p.clientY - rect.top, moved: false };
      cat.classList.add('dragging');
      e.preventDefault();
    };
    const move = (e) => {
      if (!PetCat._drag) return;
      const p = e.touches ? e.touches[0] : e;
      const x = p.clientX - PetCat._drag.ox;
      const y = p.clientY - PetCat._drag.oy;
      PetCat._applyPos(cat, x, y);
      PetCat._drag.moved = true;
      const bubble = document.getElementById('catBubble');
      if (bubble) { bubble.style.left = (x + 10) + 'px'; bubble.style.bottom = 'auto'; bubble.style.top = (y - 16) + 'px'; }
      e.preventDefault();
    };
    const end = (e) => {
      if (!PetCat._drag) return;
      const moved = PetCat._drag.moved;
      cat.classList.remove('dragging');
      const rect = cat.getBoundingClientRect();
      DB.set('catPos', { x: Math.round(rect.left), y: Math.round(rect.top) });
      PetCat._drag = null;
      // 未移动 → 点击/抚摸检测
      if (!moved) PetCat._handleTap();
      else { PetCat._tapCount = 0; clearTimeout(PetCat._tapTimer); }
    };

    cat.addEventListener('pointerdown', start);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    cat.addEventListener('touchstart', start, { passive: false });
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', end);
  },

  // —— 点击/抚摸处理 ——
  _handleTap() {
    const now = Date.now();
    // 双击复位
    if (now - PetCat._lastTap < 350) {
      PetCat.resetPos(); PetCat._lastTap = 0; PetCat._tapCount = 0;
      clearTimeout(PetCat._tapTimer); return;
    }
    PetCat._lastTap = now;
    PetCat._tapCount++;

    // 连续快速点击 → 抚摸模式
    clearTimeout(PetCat._tapTimer);
    PetCat._tapTimer = setTimeout(() => {
      const count = PetCat._tapCount; PetCat._tapCount = 0;
      if (count >= 3) {
        // 抚摸：连点3次以上触发
        PetCat._showPetted(count);
      } else {
        // 单击/双击未达复位阈值 → 随机萌语
        PetCat._showTapReaction();
      }
    }, 280);
  },

  _showTapReaction() {
    const cat = document.getElementById('petCat');
    if (!cat) return;
    cat.classList.remove('tapped','petted'); void cat.offsetWidth;
    cat.classList.add('tapped');
    setTimeout(() => cat.classList.remove('tapped'), 500);
    // 随机选一句（30%概率用时间问候）
    let msg = Math.random() < 0.3 ? PetCat._timeGreeting() : PetCat._phrases[Math.floor(Math.random() * PetCat._phrases.length)];
    PetCat.cheer(msg);
    // 小粒子特效
    PetCat._spawnParticles(3, ['✨','💫','⭐']);
  },

  _showPetted(tapCount) {
    const cat = document.getElementById('petCat');
    if (!cat) return;
    cat.classList.remove('tapped','petted'); void cat.offsetWidth;
    cat.classList.add('petted');
    setTimeout(() => cat.classList.remove('petted'), 600);
    // 根据抚摸次数给不同反应
    const msgs = [
      '嘿嘿~ 好舒服！😽',
      '再摸摸~ 💕',
      '哈哈哈 痒痒！😹',
      '停不下来啦~ ❤️',
      '你是最好的铲屎官！🏆',
    ];
    const idx = Math.min(Math.floor(tapCount / 3), msgs.length - 1);
    PetCat.cheer(msgs[idx]);
    // 大量爱心粒子
    PetCat._spawnParticles(6 + tapCount, ['❤️','💕','💖','💗','💝','🧡']);
  },

  // —— 粒子特效系统 ——
  _spawnParticles(count, emojis) {
    const container = document.getElementById('petParticles');
    const cat = document.getElementById('petCat');
    if (!container || !cat) return;
    const r = cat.getBoundingClientRect();
    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      el.className = 'pet-particle';
      el.textContent = emojis[i % emojis.length];
      // 从猫咪位置附近散开
      const offsetX = (Math.random() - 0.5) * 50;
      el.style.left = (r.left + r.width / 2 + offsetX) + 'px';
      el.style.top = (r.top + r.height / 3) + 'px';
      // 随机飘动方向
      const angle = (Math.random() - 0.5) * 80;
      const dist = 30 + Math.random() * 40;
      el.style.setProperty('--dx', (Math.sin(angle * Math.PI / 180) * dist) + 'px');
      el.style.setProperty('--dy', (-dist - Math.random() * 30) + 'px');
      el.style.animationDuration = (0.8 + Math.random() * 0.6) + 's';
      container.appendChild(el);
      setTimeout(() => el.remove(), 1500);
    }
  },

  // —— 自动漫游 ——
  _startWandering() {
    const wander = () => {
      if (PetCat._drag) { PetCat._scheduleWander(); return; }
      const cat = document.getElementById('petCat');
      if (!cat) return;
      // 50% 概率漫游，否则下次再试
      if (Math.random() > 0.45) { PetCat._scheduleWander(); return; }
      const w = cat.offsetWidth || 72, h = cat.offsetHeight || 96;
      const maxX = window.innerWidth - w - 20, maxY = window.innerHeight - h - 20;
      if (maxX <= 0 || maxY <= 0) { PetCat._scheduleWander(); return; }
      const nx = 10 + Math.random() * maxX;
      const ny = 10 + Math.random() * maxY;
      cat.classList.add('wandering');
      cat.style.left = nx + 'px'; cat.style.top = ny + 'px'; cat.style.bottom = 'auto';
      DB.set('catPos', { x: Math.round(nx), y: Math.round(ny) });
      setTimeout(() => { cat.classList.remove('wandering'); }, 1300);
      PetCat._scheduleWander();
    };
    // 首次延迟 15s 开始，之后每 15-35s 随机间隔
    PetCat._wanderTimer = setTimeout(wander, 15000);
  },
  _scheduleWander() {
    const delay = 15000 + Math.random() * 20000; // 15-35秒
    PetCat._wanderTimer = setTimeout(() => PetCat._startWandering(), delay);
  },

  // —— 睡眠状态（夜间变安静）——
  _updateSleepState() {
    const h = new Date().getHours();
    const shouldBeSleeping = (h >= 23 || h < 6);
    if (shouldBeSleeping !== PetCat._isSleeping) {
      PetCat._isSleeping = shouldBeSleeping;
      const cat = document.getElementById('petCat');
      if (cat) cat.classList.toggle('sleeping', shouldBeSleeping);
    }
  },

  // —— 位置管理（保留原有）——
  _applyPos(cat, x, y) {
    const w = cat.offsetWidth || 72, h = cat.offsetHeight || 96;
    const maxX = window.innerWidth - w, maxY = window.innerHeight - h;
    x = Math.max(0, Math.min(x, maxX)); y = Math.max(0, Math.min(y, maxY));
    cat.style.left = x + 'px'; cat.style.bottom = 'auto'; cat.style.top = y + 'px';
  },
  resetPos() {
    const cat = document.getElementById('petCat');
    const bubble = document.getElementById('catBubble');
    if (cat) { cat.style.left = ''; cat.style.top = ''; cat.style.bottom = ''; }
    if (bubble) { bubble.style.left = ''; bubble.style.top = ''; bubble.style.bottom = ''; }
    DB.set('catPos', null);
    PetCat.cheer('回到原位啦~ 🐾');
    // 复位时也来点粒子
    PetCat._spawnParticles(5, ['✨','🌟','💫','⭐','🦈']);
  },

  // —— 欢呼（各模块完成任务时调用）——
  cheer(msg) {
    const cat = document.getElementById('petCat');
    const bubble = document.getElementById('catBubble');
    if (!cat || !bubble) return;
    bubble.textContent = msg || '加油！💪';
    if (!PetCat._drag) {
      const r = cat.getBoundingClientRect();
      bubble.style.left = (r.left + 10) + 'px';
      bubble.style.bottom = 'auto';
      bubble.style.top = (r.top - 16) + 'px';
    }
    bubble.classList.add('show');
    // 使用新的 cheering 动画类
    cat.classList.remove('cheering','tapped','petted'); void cat.offsetWidth;
    cat.classList.add('cheering');
    clearTimeout(PetCat._t);
    PetCat._t = setTimeout(() => { bubble.classList.remove('show'); cat.classList.remove('cheering'); }, 2800);
    // 庆祝粒子
    PetCat._spawnParticles(7, ['🎉','✨','⭐','💫','🌟','❤️','🎊']);
  }
};

(function init() {
  // 应用主题
  const theme = DB.get('theme', '');
  if (theme) document.documentElement.dataset.theme = theme;
  // 注册已有自定义模块的渲染器
  DB.get('customModules', []).forEach(m => {
    PAGES[m.id] = () => CustomModule.render(m.id);
  });
  PetCat.init();
  Study.initTimer(); // 启动时恢复正在计时的科目（不重启计时，仅恢复状态）
  Nav.go('home');
})();
