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
};

/* ============================================
   Module registry — 便于动态增删
   ============================================ */
const MODULES = [
  { id: 'home', icon: ICONS.home, color: '#7cb342', title: '首页', desc: '今日概览', group: 'main', builtIn: true },
  { id: 'donelist', icon: ICONS.list, color: '#66bb6a', title: 'Donelist', desc: '今日待办+回溯', group: 'daily', builtIn: true },
  { id: 'dailyread', icon: ICONS.news, color: '#4fc3f7', title: '每日必读', desc: '时政+申论背诵', group: 'study', builtIn: true, badge: '新' },
  { id: 'study', icon: ICONS.book, color: '#0ea5e9', title: '自考备考', desc: '14科·进度·重点难点', group: 'study', builtIn: true },
  { id: 'sleep', icon: ICONS.moon, color: '#ab47bc', title: '作息打卡', desc: '睡眠+精力评分', group: 'health', builtIn: true },
  { id: 'sport', icon: ICONS.run, color: '#ef5350', title: '运动记录', desc: '运动类型+时长', group: 'health', builtIn: true },
  { id: 'cycle', icon: ICONS.heart, color: '#ec407a', title: '生理期管理', desc: '日历+智能预测', group: 'health', builtIn: true },
  { id: 'habits', icon: ICONS.flame, color: '#ffa726', title: '习惯打卡', desc: '长期坚持+连续天数', group: 'daily', builtIn: true },
  { id: 'backlog', icon: ICONS.check, color: '#26a69a', title: '待办池', desc: '不急但要完成', group: 'work', builtIn: true },
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
    if (!isWide()) { $('#sidebar').innerHTML = ''; return; }
    const mods = getModules();
    const groups = {};
    mods.forEach(m => { (groups[m.group] = groups[m.group] || []).push(m); });
    const groupOrder = ['main', 'daily', 'study', 'health', 'work', 'life', 'custom'];
    let html = `<div class="sb-header">
      <div class="logo"><span class="dora">🍃</span>妮妮的工作台</div>
      <div class="sub">All in One · 抹茶版</div>
    </div>`;
    groupOrder.forEach(g => {
      if (!groups[g]) return;
      html += `<div class="sb-section">${GROUP_LABELS[g] || g}</div>`;
      groups[g].forEach(m => {
        html += `<div class="sidebar-item ${Nav.current === m.id ? 'active' : ''}" onclick="Nav.go('${m.id}')">${m.icon}<span>${esc(m.title)}${m.badge ? ' <span style="font-size:9px;color:var(--accent)">●</span>' : ''}</span></div>`;
      });
    });
    html += `<div class="sb-section">系统</div>`;
    html += `<div class="sidebar-item ${Nav.current === 'settings' ? 'active' : ''}" onclick="Nav.go('settings')">${ICONS.settings}<span>设置</span></div>`;
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
        <h1>妮妮的工作台 🍃</h1>
        <div class="actions">
          <button class="icon-btn" onclick="Nav.go('settings')">${ICONS.settings}</button>
        </div>
      </div>`;
    } else {
      topbar = `<div class="topbar">
        <button class="back-btn" onclick="Nav.go('home')">${ICONS.chevL}</button>
        <h1>${esc(title)}</h1>
        <div style="width:34px"></div>
      </div>`;
    }
    $('#app').innerHTML = topbar + `<div class="page active">${render()}</div>` + Nav.renderBottomNav();
  },
  renderBottomNav() {
    if (isWide()) return '';
    const items = [
      { id: 'home', icon: ICONS.home, label: '首页' },
      { id: 'donelist', icon: ICONS.list, label: '待办' },
      { id: 'dailyread', icon: ICONS.news, label: '必读' },
      { id: 'study', icon: ICONS.book, label: '自考' },
      { id: 'cycle', icon: ICONS.heart, label: '经期' },
    ];
    return `<div class="bottomnav">${items.map(i => `
      <div class="nav-item ${Nav.current === i.id ? 'active' : ''}" onclick="Nav.go('${i.id}')">${i.icon}<span>${i.label}</span>
      </div>`).join('')}</div>`;
  }
};

window.addEventListener('resize', () => { Nav.refresh(); });

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
        <div class="desc">${esc(m.desc)}</div>
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
    const todos = DB.get('donelist', []).filter(t => t.date === date);
    const done = todos.filter(t => t.done).length;
    const dt = new Date(date);
    const isToday = date === todayStr();

    const items = todos.length ? todos.map(t => `
      <div class="task-item ${t.done ? 'done' : ''}">
        <div class="checkbox ${t.done ? 'checked' : ''}" onclick="Donelist.toggle('${t.id}')">${ICONS.check}</div>
        <div class="task-text" onclick="Donelist.toggle('${t.id}')">${esc(t.text)}</div>
        <button class="task-delete" onclick="Donelist.del('${t.id}')">${ICONS.trash}</button>
      </div>`).join('') : `<div class="empty"><div class="emoji">📝</div><div>${isToday ? '今天还没有任务' : '这一天没有记录'}</div></div>`;

    return `
      <div class="card">
        <div class="calendar-header">
          <button onclick="Donelist.shift(-1)">${ICONS.chevL}</button>
          <div class="month">${isToday ? '今天' : fmtDate(dt)}</div>
          <button onclick="Donelist.shift(1)">${ICONS.chevR}</button>
        </div>
        ${!isToday ? `<div style="text-align:center;margin-bottom:8px"><button class="btn small ghost" onclick="Donelist.viewDate='${todayStr()}';Nav.refresh()">回到今天</button></div>` : ''}
      </div>
      <div class="card">
        <div class="card-title"><span>${done}/${todos.length} 已完成</span>${isToday ? `<a onclick="Donelist.add()">+ 添加</a>` : ''}</div>
        ${items}
      </div>
    `;
  },
  shift(n) {
    const d = new Date(Donelist.viewDate || todayStr());
    d.setDate(d.getDate() + n);
    Donelist.viewDate = d.toISOString().slice(0, 10);
    Nav.refresh();
  },
  add() {
    openModal(`<h3>添加今日任务</h3>
      <textarea class="textarea" id="taskInput" placeholder="今天要做什么？一行一个，可批量添加" autofocus></textarea>
      <button class="btn" onclick="Donelist.save()">保存</button>`);
  },
  save() {
    const text = $('#taskInput').value.trim();
    if (!text) return toast('请输入内容');
    const todos = DB.get('donelist', []);
    text.split('\n').filter(Boolean).forEach(line => {
      todos.push({ id: uid(), text: line.trim(), date: todayStr(), done: false, createdAt: Date.now() });
    });
    DB.set('donelist', todos);
    closeModal(); Nav.refresh(); toast('已添加');
  },
  toggle(id) {
    const todos = DB.get('donelist', []);
    const t = todos.find(x => x.id === id);
    if (t) { t.done = !t.done; DB.set('donelist', todos); Nav.refresh(); }
  },
  del(id) {
    DB.set('donelist', DB.get('donelist', []).filter(t => t.id !== id));
    Nav.refresh();
  }
};

/* ============================================
   DAILY READ — 每日必读（时政+申论）
   ============================================ */
const DailyRead = {
  _tab: 'politics',
  _viewDate: null,
  API_BASE: '',  // same origin
  _cache: {},
  render() {
    const date = DailyRead._viewDate || todayStr();
    const isToday = date === todayStr();
    const cached = DailyRead._cache[date];
    if (cached) {
      return DailyRead._renderContent(date, cached);
    }
    // async load then refresh
    DailyRead._load(date);
    return `<div class="card"><div class="calendar-header">
        <button onclick="DailyRead.shift(-1)">${ICONS.chevL}</button>
        <div class="month">${isToday ? '今日必读' : fmtDate(date)}</div>
        <button onclick="DailyRead.shift(1)">${ICONS.chevR}</button>
      </div>
      ${!isToday ? `<div style="text-align:center;margin-bottom:8px"><button class="btn small ghost" onclick="DailyRead._viewDate='${todayStr()}';Nav.refresh()">回到今天</button></div>` : ''}
      </div>
      <div class="card"><div style="text-align:center;padding:20px;color:var(--text-2)"><div class="emoji">\ud83d\udc4b</div>正在加载今日内容...</div></div>`;
  },
  _renderContent(date, data) {
    const isToday = date === todayStr();
    return `
      <div class="card">
        <div class="calendar-header">
          <button onclick="DailyRead.shift(-1)">${ICONS.chevL}</button>
          <div class="month">${isToday ? '今日必读' : fmtDate(date)}</div>
          <button onclick="DailyRead.shift(1)">${ICONS.chevR}</button>
        </div>
        ${!isToday ? `<div style="text-align:center;margin-bottom:8px"><button class="btn small ghost" onclick="DailyRead._viewDate='${todayStr()}';Nav.refresh()">回到今天</button></div>` : ''}
      </div>
      <div class="card">
        <div class="segmented" id="readTab">
          <button class="${DailyRead._tab === 'politics' ? 'active' : ''}" onclick="DailyRead.setTab('politics')">\ud83d\udcf0 时政常识（${(data.politics || []).length}条）</button>
          <button class="${DailyRead._tab === 'essay' ? 'active' : ''}" onclick="DailyRead.setTab('essay')">\u270d\ufe0f 申论好词好句</button>
        </div>
        ${DailyRead._tab === 'politics' ? DailyRead._renderPolitics(data.politics || []) : DailyRead._renderEssay(data.essay || {})}
      </div>
    `;
  },
  _renderPolitics(items) {
    if (!items.length) return `<div class="empty"><div class="emoji">📰</div><div>暂无时政内容</div></div>`;
    return items.map((item, i) => `
      <div class="read-item" style="padding:16px 0">
        <div class="read-body" style="font-size:15px;line-height:1.85;color:var(--text)">${DailyRead._renderBoldText(item.body || item.title || '')}</div>
      </div>`).join('') + `
      <div style="margin-top:12px;display:flex;gap:8px">
        <button class="btn secondary small" onclick="DailyRead.refresh('${DailyRead._viewDate || todayStr()}')">${ICONS.refresh} 重新抓取最新内容</button>
      </div>`;
  },
  _renderBoldText(text) {
    if (!text) return '';
    // 把 **text** 渲染为带下划线的样式（和图片格式一致）
    return text.replace(/\*\*(.+?)\*\*/g, '<u style="text-decoration:underline;text-decoration-color:var(--primary);text-underline-offset:3px;text-decoration-thickness:2px;font-weight:600">$1</u>');
  },
  _renderEssay(essay) {
    if (!essay || !essay.topic) return `<div class="empty"><div class="emoji">\u270d\ufe0f</div><div>暂无申论内容</div></div>`;
    return `
      <div class="essay-box">
        <div class="topic-label">\ud83d\udcdc 今日话题</div>
        <div class="topic">${esc(essay.topic)}</div>
      </div>
      ${essay.source || essay.background ? `<div class="card" style="margin-top:8px">
        <div class="card-title"><span>\ud83d\udcf0 出处 / 背景</span></div>
        ${essay.source ? `<div style="font-size:13px;color:var(--primary-dark);font-weight:600;margin-bottom:8px;line-height:1.7">${esc(essay.source)}</div>` : ''}
        ${essay.background ? `<div style="font-size:13px;line-height:1.8;color:var(--text)">${esc(essay.background)}</div>` : ''}
      </div>` : ''}
      ${essay.core_quote ? `<div class="card" style="margin-top:8px">
        <div class="card-title"><span>\ud83d\udcd6 核心表述 / 原话</span></div>
        <div style="font-size:14px;line-height:1.9;color:var(--primary-dark);font-style:italic;padding:8px 12px;background:var(--primary-soft);border-radius:10px;border-left:3px solid var(--primary)">${esc(essay.core_quote)}</div>
      </div>` : ''}
      ${essay.significance ? `<div class="card" style="margin-top:8px">
        <div class="card-title"><span>\ud83c\udf1f 政策意义</span></div>
        <div style="font-size:13px;line-height:1.8">${esc(essay.significance)}</div>
      </div>` : ''}
      ${(essay.measures || []).length ? `<div class="card" style="margin-top:8px">
        <div class="card-title"><span>\ud83d\udccc 对策措施 / 规范表述</span></div>
        <div style="font-size:13px;line-height:2">${(essay.measures || []).map((m, i) => `<div>${i+1}. ${esc(m)}</div>`).join('')}</div>
      </div>` : ''}
      <div style="margin-top:12px;display:flex;gap:8px">
        <button class="btn secondary small" onclick="DailyRead.refresh('${DailyRead._viewDate || todayStr()}')">${ICONS.refresh} 重新抓取</button>
      </div>
    `;
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
    opts.forEach((o, j) => { o.classList.remove('correct', 'wrong'); });
    opts[oi].classList.add(oi === correct ? 'correct' : 'wrong');
    if (oi !== correct) opts[correct].classList.add('correct');
    $(`#ans-${qi}`).style.display = 'block';
  },
  async _load(date) {
    // 优先使用内置数据（不依赖后端服务器）
    if (typeof generateBuiltinDaily === 'function') {
      try {
        const data = generateBuiltinDaily(date);
        DailyRead._cache[date] = data;
        Nav.refresh();
        return;
      } catch (e) {
        console.error('builtin data failed', e);
      }
    }
    // 后备：尝试从后端API加载
    try {
      const resp = await fetch(`${DailyRead.API_BASE}/api/daily?date=${date}`);
      const json = await resp.json();
      if (json.status === 'ok') {
        DailyRead._cache[date] = json.data;
        Nav.refresh();
      }
    } catch (e) {
      console.error('load daily failed', e);
    }
  },
  async refresh(date) {
    toast('正在刷新内容...');
    // 使用内置数据重新生成
    if (typeof generateBuiltinDaily === 'function') {
      try {
        const data = generateBuiltinDaily(date);
        DailyRead._cache[date] = data;
        Nav.refresh();
        toast('已更新为最新内容');
        return;
      } catch (e) {
        console.error('refresh failed', e);
      }
    }
    // 后备：尝试后端API
    try {
      const resp = await fetch(`${DailyRead.API_BASE}/api/refresh?date=${date}`);
      const json = await resp.json();
      if (json.status === 'ok') {
        DailyRead._cache[date] = json.data;
        Nav.refresh();
        toast('已更新为最新内容');
      } else {
        toast('更新失败');
      }
    } catch (e) {
      toast('更新失败：' + e.message);
    }
  }
};

/* ============================================
   STUDY / 自考备考 — 14 科
   ============================================ */
const Study = {
  DEFAULT_SUBJECTS: [
    '马克思主义基本原理',
    '中国近现代史纲要',
    '英语（二）',
    '高等数学（工本）',
    '线性代数（经管类）',
    '概率论与数理统计（经管类）',
    '管理学原理',
    '财务管理学',
    '国际贸易理论与实务',
    '组织行为学',
    '市场营销学',
    '人力资源管理（一）',
    '企业会计学',
    '毕业论文',
  ],
  ensureSubjects() {
    let subs = DB.get('subjects', null);
    if (!subs) {
      subs = Study.DEFAULT_SUBJECTS.map((name, i) => ({
        id: uid(), name, order: i, examDate: '', targetHours: 0, progress: 0, logs: [], createdAt: Date.now(),
      }));
      DB.set('subjects', subs);
    }
    return subs;
  },
  render() {
    const subs = Study.ensureSubjects();
    const allLogs = subs.flatMap(s => s.logs || []);
    const totalHours = allLogs.reduce((s, l) => s + (l.hours || 0), 0);
    const totalSessions = allLogs.length;
    const reviewedCount = allLogs.filter(l => l.reviewed).length;
    const avgProgress = subs.length ? Math.round(subs.reduce((s, x) => s + (x.progress || 0), 0) / subs.length) : 0;
    const upcoming = subs.filter(s => s.examDate).map(s => ({ s, days: Math.ceil((new Date(s.examDate) - new Date(new Date().toDateString())) / 86400000) })).filter(x => x.days >= 0).sort((a, b) => a.days - b.days)[0];

    const statCard = `
      <div class="card">
        <div class="card-title"><span>备考总览 · ${subs.length} 科</span></div>
        <div class="stat-row">
          <div class="stat-box"><div class="num">${totalHours}</div><div class="lbl">累计学时</div></div>
          <div class="stat-box"><div class="num">${totalSessions}</div><div class="lbl">学习次数</div></div>
          <div class="stat-box"><div class="num">${avgProgress}%</div><div class="lbl">平均进度</div></div>
        </div>
        ${upcoming ? `<div style="margin-top:12px;padding:10px 12px;background:#fff3e0;border-radius:10px;font-size:13px">
          <span style="color:var(--warning);font-weight:700">⏰ ${esc(upcoming.s.name)}</span>
          <span style="color:var(--text-2)"> · ${fmtDate(upcoming.s.examDate)} · </span>
          <span style="color:${upcoming.days < 14 ? 'var(--danger)' : 'var(--warning)'};font-weight:700">还有 ${upcoming.days} 天</span>
        </div>` : ''}
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
            <div style="font-size:15px;font-weight:700">${esc(s.name)}</div>
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
      </div>`;
    }).join('');

    return statCard + list + `
      <button class="btn secondary" onclick="Study.addSubject()" style="margin-top:8px">+ 添加自定义科目</button>
      <div style="font-size:11px;color:var(--text-3);text-align:center;margin-top:12px;padding:0 16px;line-height:1.6">
        已预置 14 个常见自考科目，点击任意科目可记录学习内容、时长、进度与重点难点。
      </div>`;
  },
  addSubject() {
    openModal(`<h3>添加自定义科目</h3>
      <span class="label">科目名称</span>
      <input class="input" id="subName" placeholder="如：数据结构">
      <span class="label">考试日期（可选）</span>
      <input type="date" class="input" id="subDate">
      <span class="label">目标学习时长（小时）</span>
      <input type="number" class="input" id="subHours" placeholder="如 50">
      <button class="btn" onclick="Study.saveSubject()">保存</button>`);
  },
  saveSubject() {
    const name = $('#subName').value.trim();
    if (!name) return toast('请输入科目名称');
    const subs = Study.ensureSubjects();
    subs.push({ id: uid(), name, order: subs.length, examDate: $('#subDate').value, targetHours: +$('#subHours').value || 0, progress: 0, logs: [], createdAt: Date.now() });
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
        <button class="icon-btn" onclick="Study.editSubject('${id}')">${ICONS.edit}</button>
      </div>
      ${s.examDate ? `<div style="font-size:13px;color:var(--text-2);margin-bottom:10px">考试日期：${fmtDateFull(s.examDate)}${daysLeft !== null ? (daysLeft < 0 ? '（已过）' : ` · <strong style="color:${daysLeft < 14 ? 'var(--danger)' : 'var(--warning)'}">还有 ${daysLeft} 天</strong>`) : ''}</div>` : '<div style="font-size:12px;color:var(--text-3);margin-bottom:10px">未设考试日期</div>'}
      <div style="display:flex;gap:8px;margin-bottom:14px">
        <div class="stat-box"><div class="num" style="font-size:18px">${hours}</div><div class="lbl">累计学时</div></div>
        <div class="stat-box"><div class="num" style="font-size:18px">${logs.length}</div><div class="lbl">学习次数</div></div>
        <div class="stat-box"><div class="num" style="font-size:18px">${pct}%</div><div class="lbl">当前进度</div></div>
      </div>
      <button class="btn" onclick="Study.addLog('${id}')">+ 记录本次学习</button>
      <div style="margin-top:16px"><div class="card-title"><span>学习记录</span></div>${logHtml}</div>
      <button class="btn secondary" onclick="Study.delSubject('${id}');closeModal()" style="margin-top:16px">删除该科目</button>
    `);
  },
  addLog(id) {
    const s = Study.ensureSubjects().find(x => x.id === id);
    const curProgress = s ? (s.progress || 0) : 0;
    openModal(`<h3>记录本次学习</h3>
      <span class="label">日期</span>
      <input type="date" class="input" id="logDate" value="${todayStr()}">
      <span class="label">学习内容</span>
      <textarea class="textarea" id="logContent" placeholder="学了哪个章节/知识点/做了什么题"></textarea>
      <div class="row">
        <div><span class="label">时长（小时）</span>
        <input type="number" class="input" id="logHours" placeholder="如 2" step="0.5" min="0"></div>
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
  _energy: null,
  render() {
    const sleep = DB.get('sleep', {});
    const today = todayStr();
    const todaySleep = sleep[today] || {};
    const dates = Object.keys(sleep).sort().reverse().slice(0, 14);
    const avgEnergy = dates.length ? (dates.reduce((s, d) => s + (sleep[d].energy || 0), 0) / dates.length).toFixed(1) : '—';
    const history = dates.slice(0, 7).map(d => {
      const s = sleep[d];
      return `<div class="list-item"><div class="main"><div class="title">${fmtDate(d)}</div><div class="sub">${s.wake ? '起床 ' + s.wake : ''} ${s.bed ? '　入睡 ' + s.bed : ''} ${s.energy ? '　精力 ' + s.energy + '/10' : ''}</div></div></div>`;
    }).join('') || `<div class="empty"><div class="emoji">😴</div><div>还没有作息记录</div></div>`;
    Sleep._energy = todaySleep.energy || null;
    return `
      <div class="card">
        <div class="card-title"><span>今日作息 · ${fmtDateFull(new Date())}</span></div>
        <div class="row">
          <div><span class="label">起床时间</span><input type="time" class="input" id="wakeTime" value="${todaySleep.wake || ''}"></div>
          <div><span class="label">入睡时间</span><input type="time" class="input" id="bedTime" value="${todaySleep.bed || ''}"></div>
        </div>
        <span class="label">今日精力评分</span>
        <div class="chips" id="energyChips">${[1,2,3,4,5,6,7,8,9,10].map(n => `<div class="chip ${todaySleep.energy === n ? 'active' : ''}" onclick="Sleep.setEnergy(${n})">${n}</div>`).join('')}</div>
        <button class="btn" onclick="Sleep.save()">保存今日记录</button>
      </div>
      <div class="card">
        <div class="card-title"><span>近14天统计</span></div>
        <div class="stat-row">
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
    const wake = $('#wakeTime').value;
    const bed = $('#bedTime').value;
    const energy = Sleep._energy !== null ? Sleep._energy : (sleep[todayStr()] || {}).energy;
    if (!wake && !bed && !energy) return toast('请填写内容');
    sleep[todayStr()] = { wake, bed, energy, updatedAt: Date.now() };
    DB.set('sleep', sleep);
    Sleep._energy = null;
    Nav.refresh(); toast('已记录今日作息');
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
  del(id) { DB.set('backlog', DB.get('backlog', []).filter(i => i.id !== id)); Nav.refresh(); }
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
    Nav.refresh(); toast('已记账');
  },
  del(id) { DB.set('money', DB.get('money', []).filter(i => i.id !== id)); Nav.refresh(); }
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
  del(id) { DB.set('sport', DB.get('sport', []).filter(i => i.id !== id)); Nav.refresh(); }
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
  del(id) { DB.set('wishes', DB.get('wishes', []).filter(i => i.id !== id)); Nav.refresh(); }
};

/* ============================================
   CYCLE
   ============================================ */
const Cycle = {
  AVG_CYCLE: 28, AVG_PERIOD: 5,
  _viewYear: null, _viewMonth: null,
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
      <div class="card"><div class="card-title"><span>日历视图</span><a onclick="Cycle.logPeriod()">+ 标记经期</a></div>
        ${cal}
        <div style="display:flex;gap:12px;font-size:11px;color:var(--text-2);margin-top:12px;flex-wrap:wrap">
          <span><span style="display:inline-block;width:10px;height:10px;background:var(--pink);border-radius:3px;vertical-align:middle"></span> 经期</span>
          <span><span style="display:inline-block;width:10px;height:10px;background:rgba(236,64,122,0.3);border-radius:3px;vertical-align:middle"></span> 预测</span>
          <span><span style="display:inline-block;width:10px;height:10px;background:var(--warning);border-radius:3px;vertical-align:middle"></span> 排卵期</span>
        </div>
      </div>
      ${periods.length ? `<div class="card"><div class="card-title"><span>历史记录</span></div>
        ${periods.slice().reverse().map(p => `<div class="list-item"><div class="main"><div class="title">${fmtDateFull(p)}</div></div><button class="task-delete" onclick="Cycle.delPeriod('${p}')">${ICONS.trash}</button></div>`).join('')}
      </div>` : ''}
    `;
  },
  logPeriod() {
    openModal(`<h3>标记经期开始日期</h3>
      <span class="label">选择本次经期的开始日期</span>
      <input type="date" class="input" id="periodDate" value="${todayStr()}">
      <span class="label">持续天数（默认5天）</span>
      <input type="number" class="input" id="periodLen" value="5" min="1" max="10">
      <button class="btn" onclick="Cycle.savePeriod()">保存</button>`);
  },
  savePeriod() {
    const date = $('#periodDate').value;
    if (!date) return toast('请选择日期');
    const periods = DB.get('periods', []);
    if (!periods.includes(date)) periods.push(date);
    DB.set('periods', periods.sort());
    const lens = DB.get('periodLens', {});
    lens[date] = +$('#periodLen').value || 5;
    DB.set('periodLens', lens);
    closeModal(); Nav.refresh(); toast('已记录');
  },
  delPeriod(date) { DB.set('periods', DB.get('periods', []).filter(p => p !== date)); Nav.refresh(); },
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
    return `<div class="calendar-header"><button onclick="Cycle.shiftMonth(-1)">${ICONS.chevL}</button><div class="month">${y}年${m + 1}月</div><button onclick="Cycle.shiftMonth(1)">${ICONS.chevR}</button></div><div class="calendar-grid">${cells}</div>`;
  },
  shiftMonth(n) {
    let y = Cycle._viewYear ?? new Date().getFullYear();
    let m = (Cycle._viewMonth ?? new Date().getMonth()) + n;
    while (m < 0) { m += 12; y--; }
    while (m > 11) { m -= 12; y++; }
    Cycle._viewYear = y; Cycle._viewMonth = m;
    Nav.refresh();
  },
  getMarks(y, m) {
    const periods = DB.get('periods', []).sort();
    const lens = DB.get('periodLens', {});
    const marks = {};
    if (!periods.length) return marks;
    periods.forEach(p => {
      const len = lens[p] || Cycle.AVG_PERIOD;
      const start = new Date(p);
      for (let i = 0; i < len; i++) {
        const d = new Date(start); d.setDate(start.getDate() + i);
        marks[d.toISOString().slice(0, 10)] = 'period';
      }
    });
    const last = periods[periods.length - 1];
    const cycles = [];
    for (let i = 1; i < periods.length; i++) cycles.push((new Date(periods[i]) - new Date(periods[i - 1])) / 86400000);
    const avgCycle = cycles.length ? Math.round(cycles.reduce((s, c) => s + c, 0) / cycles.length) : Cycle.AVG_CYCLE;
    const lastLen = lens[last] || Cycle.AVG_PERIOD;
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
    const avgCycle = cycles.length ? Math.round(cycles.reduce((s, c) => s + c, 0) / cycles.length) : Cycle.AVG_CYCLE;
    const last = periods[periods.length - 1];
    const lastLen = lens[last] || Cycle.AVG_PERIOD;
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
          <div style="font-size:11px;color:var(--text-2)"><span class="habit-streak">🔥 ${streak} 天连续</span> · 本月 ${monthDone} 次</div>
        </div>
        <button class="task-delete" onclick="Habits.del('${h.id}')">${ICONS.trash}</button>
      </div>`;
    }).join('') : `<div class="empty"><div class="emoji">🔥</div><div>还没有习惯，添加一个想长期坚持的事</div></div>`;
    const todayDone = habits.filter(h => (h.logs || []).includes(today)).length;
    return `
      <div class="card"><div class="card-title"><span>今日 · ${todayDone}/${habits.length} 已完成</span><a onclick="Habits.add()">+ 新建</a></div>${list}</div>
      <div style="font-size:11px;color:var(--text-3);text-align:center;padding:0 16px;line-height:1.6">习惯是长期坚持的事（喝水、读书、冥想），点击方框即可打卡。</div>
    `;
  },
  add() { openModal(`<h3>新建习惯</h3><span class="label">习惯名称</span><input class="input" id="habitName" placeholder="如：每天喝水8杯"><button class="btn" onclick="Habits.save()">创建</button>`); },
  save() {
    const name = $('#habitName').value.trim();
    if (!name) return toast('请输入名称');
    const habits = DB.get('habits', []);
    habits.push({ id: uid(), name, logs: [], createdAt: Date.now() });
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
    else h.logs.push(today);
    DB.set('habits', habits);
    Nav.refresh();
  },
  del(id) { DB.set('habits', DB.get('habits', []).filter(h => h.id !== id)); Nav.refresh(); }
};

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
      <div class="card"><div class="card-title"><span>数据管理</span></div>
        <button class="btn secondary" onclick="Settings.export()" style="margin-bottom:8px">${ICONS.download} 导出备份</button>
        <button class="btn secondary" onclick="Settings.import()">导入备份</button>
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
(function init() {
  // 注册已有自定义模块的渲染器
  DB.get('customModules', []).forEach(m => {
    PAGES[m.id] = () => CustomModule.render(m.id);
  });
  Nav.go('home');
})();
