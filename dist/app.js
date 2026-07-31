(() => {
  'use strict';

  const STORAGE_KEYS = {
    banks: 'mc-study-banks-v1',
    settings: 'mc-study-settings-v1'
  };
  const supabaseConfig = window.MC_SUPABASE_CONFIG;
  const supabase = supabaseConfig && window.supabase
    ? window.supabase.createClient(supabaseConfig.url, supabaseConfig.publishableKey)
    : null;
  let currentUser = null;
  let syncTimer = null;
  const LETTERS = ['A', 'B', 'C', 'D'];
  const uid = (prefix = 'id') => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const today = () => new Date().toISOString().slice(0, 10);

  const ICONS = {
    book: '<path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v17H7.5A3.5 3.5 0 0 0 4 22V5.5Z"/><path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H13v17h3.5A3.5 3.5 0 0 1 20 22V5.5Z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    upload: '<path d="M12 16V4m0 0 4 4m-4-4L8 8"/><path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/>',
    table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 4v16M15 4v16"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.1A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.1A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.1A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.13.39.36.73.67 1 .31.27.7.4 1.1.4H21v4h-.1a1.7 1.7 0 0 0-1.5.6Z"/>',
    play: '<path d="m8 5 11 7-11 7V5Z"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2m-9 0 1 15h8l1-15M10 10v7M14 10v7"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    flag: '<path d="M5 21V4m0 1h10l-1 4 1 4H5"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    chevronLeft: '<path d="m15 18-6-6 6-6"/>',
    chevronRight: '<path d="m9 18 6-6-6-6"/>',
    download: '<path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M4 17v3h16v-3"/>',
    save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
    refresh: '<path d="M20 6v5h-5"/><path d="M4 18v-5h5"/><path d="M18.5 9A7 7 0 0 0 6 6.5L4 11m16 2-2 4.5A7 7 0 0 1 5.5 15"/>',
    database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    sparkles: '<path d="m12 3 1.4 3.6L17 8l-3.6 1.4L12 13l-1.4-3.6L7 8l3.6-1.4L12 3Z"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15ZM5 13l.8 2.2L8 16l-2.2.8L5 19l-.8-2.2L2 16l2.2-.8L5 13Z"/>',
    alert: '<path d="M12 3 2 21h20L12 3Z"/><path d="M12 9v5m0 3h.01"/>',
    trophy: '<path d="M8 4h8v4a4 4 0 0 1-8 0V4Z"/><path d="M8 6H4v1a4 4 0 0 0 4 4m8-5h4v1a4 4 0 0 1-4 4M12 12v5m-4 4h8m-6-4h4"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    type: '<path d="M4 5V3h16v2M9 21h6M12 3v18"/>',
    shuffle: '<path d="M16 3h5v5M4 20l5-5m7-6 5-5M4 4l5 5m7 6 5 5v-5"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    file: '<path d="M6 2h8l4 4v16H6V2Z"/><path d="M14 2v5h5"/>'
  };

  function icon(name, cls = 'icon') {
    return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.book}</svg>`;
  }
  function h(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));
  }
  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
  function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
  function formatTime(seconds) {
    const safe = Math.max(0, Math.floor(seconds || 0));
    const m = Math.floor(safe / 60).toString().padStart(2, '0');
    const s = (safe % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
  function formatDate(dateString) {
    try { return new Intl.DateTimeFormat('zh-HK', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(dateString)); }
    catch { return dateString || ''; }
  }
  function downloadBlob(filename, blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function deepClone(value) { return JSON.parse(JSON.stringify(value)); }

  const DEFAULT_SETTINGS = {
    fontSize: 'medium',
    quizMinutes: 20,
    timerEnabled: true,
    shuffleQuestions: true,
    shuffleOptions: false,
    showAnswers: true,
    darkMode: false
  };

  const makeQuestion = (text, options, correctIndex, explanation = '') => ({ id: uid('q'), text, options, correctIndex, explanation });
  const DEFAULT_BANKS = [
    {
      id: 'biology', title: '生物學單元測驗', subject: '生物學', description: '細胞結構、遺傳及人體系統基礎練習', createdAt: '2026-07-20', updatedAt: '2026-07-30',
      questions: [
        makeQuestion('細胞膜的主要功能是？', ['合成蛋白質', '控制物質進出細胞', '儲存遺傳物質', '提供細胞能量'], 1, '細胞膜具有選擇性通透性，可調節物質進出細胞。'),
        makeQuestion('以下哪一項是植物細胞所特有的構造？', ['細胞壁', '中心體', '溶小體', '核糖體'], 0, '植物細胞具有由纖維素構成的細胞壁。'),
        makeQuestion('細胞進行光合作用的主要場所是？', ['細胞核', '葉綠體', '粒線體', '液泡'], 1, '葉綠體內的葉綠素負責吸收光能。'),
        makeQuestion('DNA 的主要功能是？', ['運送氧氣', '儲存遺傳資訊', '分解食物', '維持體溫'], 1, 'DNA 儲存生物的遺傳資訊，並指導蛋白質合成。'),
        makeQuestion('紅血球最主要的功能是？', ['製造抗體', '運送氧氣', '消化脂肪', '傳遞神經訊號'], 1, '血紅蛋白能與氧結合，將氧氣運送至全身。'),
        makeQuestion('人體最大的器官是？', ['肝臟', '肺部', '皮膚', '腸道'], 2, '皮膚是人體面積最大的器官。')
      ]
    },
    {
      id: 'english', title: '英文文法', subject: '英文', description: '時態、詞性與句式練習', createdAt: '2026-07-22', updatedAt: '2026-07-29',
      questions: [
        makeQuestion('Choose the correct sentence.', ['She go to school every day.', 'She goes to school every day.', 'She going to school every day.', 'She gone to school every day.'], 1, 'Third-person singular subjects take “-s” in the simple present tense.'),
        makeQuestion('Which word is an adjective?', ['Quickly', 'Beauty', 'Beautiful', 'Beautify'], 2, '“Beautiful” describes a noun and is therefore an adjective.'),
        makeQuestion('I ___ the report before the meeting started.', ['finish', 'had finished', 'am finishing', 'will finish'], 1, 'Past perfect describes an earlier past action before another past action.')
      ]
    },
    {
      id: 'social-work', title: '香港社會工作', subject: '社會工作', description: '社會工作價值、倫理及服務知識', createdAt: '2026-07-25', updatedAt: '2026-07-28',
      questions: [
        makeQuestion('社會工作專業最重視下列哪一項核心原則？', ['控制服務使用者', '尊重人的尊嚴與價值', '只處理經濟問題', '避免跨專業合作'], 1, '尊重人的尊嚴與價值是社會工作的重要核心價值。'),
        makeQuestion('個案工作中的「自決」主要指甚麼？', ['由社工代替決定', '服務使用者有權作知情選擇', '只依從機構規則', '避免向服務使用者提供資料'], 1, '自決強調服務使用者在充分資訊下參與及作出選擇。')
      ]
    },
    {
      id: 'psychology', title: '心理學基礎', subject: '心理學', description: '學習、記憶與發展心理學', createdAt: '2026-07-27', updatedAt: '2026-07-30',
      questions: [
        makeQuestion('古典制約理論最常與哪位心理學家相關？', ['皮亞傑', '巴夫洛夫', '馬斯洛', '班杜拉'], 1, '巴夫洛夫以狗的唾液反應研究古典制約。'),
        makeQuestion('短期記憶亦常被稱為？', ['感覺記憶', '工作記憶', '程序記憶', '情節記憶'], 1, '工作記憶強調暫時保存及處理資訊的功能。')
      ]
    }
  ];

  function loadJson(key, fallback) {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : deepClone(fallback);
    } catch { return deepClone(fallback); }
  }

  let banks = loadJson(STORAGE_KEYS.banks, DEFAULT_BANKS);
  let settings = { ...DEFAULT_SETTINGS, ...loadJson(STORAGE_KEYS.settings, DEFAULT_SETTINGS) };
  let timerId = null;
  const state = {
    view: 'banks',
    selectedBankId: banks[0]?.id || null,
    search: '',
    sort: 'default',
    page: 1,
    perPage: 8,
    modal: null,
    quiz: null,
    result: null,
    settingsSection: 'general',
    toast: null
  };

  const app = document.getElementById('app');

  function scheduleCloudSync() {
    if (!supabase || !currentUser) return;
    window.clearTimeout(syncTimer);
    syncTimer = window.setTimeout(syncCloudData, 450);
  }
  async function syncCloudData() {
    if (!supabase || !currentUser) return;
    const { error } = await supabase.from('mc_study_data').upsert({
      user_id: currentUser.id, banks, settings, updated_at: new Date().toISOString()
    });
    if (error) toast('雲端同步失敗；資料仍保留在這部裝置。', 'error');
  }
  function saveBanks() { localStorage.setItem(STORAGE_KEYS.banks, JSON.stringify(banks)); scheduleCloudSync(); }
  function saveSettings() { localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings)); scheduleCloudSync(); }

  async function loadCloudData() {
    const { data, error } = await supabase.from('mc_study_data').select('banks, settings').eq('user_id', currentUser.id).maybeSingle();
    if (error) { toast('無法讀取雲端資料，暫時使用本機資料。', 'error'); return; }
    if (data) {
      banks = Array.isArray(data.banks) ? data.banks : [];
      settings = { ...DEFAULT_SETTINGS, ...(data.settings || {}) };
      state.selectedBankId = banks[0]?.id || null;
      localStorage.setItem(STORAGE_KEYS.banks, JSON.stringify(banks));
      localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
    } else {
      await syncCloudData();
    }
    applySettings();
  }

  function renderAuth() {
    app.innerHTML = `<main class="page-wrap"><section class="empty-state main-panel" style="max-width:460px;margin:10vh auto"><div class="empty-icon">${icon('database')}</div><h1>登入以同步題庫</h1><p>登入後，題庫和設定會安全地儲存在雲端，並可在其他裝置使用。</p><form id="authForm" style="display:grid;gap:12px;text-align:left;margin-top:20px"><label class="form-field"><span>電郵地址</span><input name="email" type="email" autocomplete="email" required /></label><label class="form-field"><span>密碼</span><input name="password" type="password" autocomplete="current-password" minlength="6" required /></label><div class="header-actions"><button class="btn btn-primary" type="submit" data-auth-mode="signin">登入</button><button class="btn" type="submit" data-auth-mode="signup">建立帳戶</button></div></form><p class="panel-meta" style="margin-top:16px">首次登入會上傳這部裝置上的現有題庫。</p></section></main>`;
    const form = document.getElementById('authForm');
    form?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const submitter = event.submitter;
      const values = new FormData(form);
      const email = String(values.get('email') || '').trim();
      const password = String(values.get('password') || '');
      const isSignup = submitter?.dataset.authMode === 'signup';
      const response = isSignup
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });
      if (response.error) { toast(response.error.message, 'error'); return; }
      if (isSignup && !response.data.session) { toast('帳戶已建立，請到電郵信箱確認後再登入。'); return; }
      currentUser = response.data.user || response.data.session?.user;
      await loadCloudData();
      render();
      toast('已登入，雲端同步已啟用。');
    });
  }
  function selectedBank() { return banks.find((bank) => bank.id === state.selectedBankId) || banks[0] || null; }
  function applySettings() {
    document.documentElement.dataset.fontSize = settings.fontSize;
    document.documentElement.classList.toggle('dark', Boolean(settings.darkMode));
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', settings.darkMode ? '#0e1726' : '#f5f8fd');
  }
  function toast(message, type = 'success') {
    state.toast = { message, type };
    renderToast();
    window.clearTimeout(toast.timeout);
    toast.timeout = window.setTimeout(() => { state.toast = null; renderToast(); }, 2800);
  }
  function renderToast() {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    container.innerHTML = state.toast ? `<div class="toast ${h(state.toast.type)}">${icon(state.toast.type === 'error' ? 'alert' : 'check')}<span>${h(state.toast.message)}</span></div>` : '';
  }

  function topNavButton(view, label, iconName) {
    return `<button class="nav-button ${state.view === view || (view === 'quiz' && state.view === 'results') ? 'active' : ''}" data-view="${view}">${icon(iconName)}<span>${label}</span></button>`;
  }
  function renderShell(content) {
    return `
      <div class="app-shell">
        <header class="topbar">
          <div class="brand">
            <div class="brand-mark">${icon('book', 'icon')}</div>
            <div><div class="brand-title">MC 自我溫習平台</div><div class="brand-subtitle">建立題庫・專注測驗・掌握進度</div></div>
          </div>
          <nav class="topnav" aria-label="主要導覽">
            ${topNavButton('banks', '題庫管理', 'book')}
            ${topNavButton('quiz', '開始測驗', 'play')}
            ${topNavButton('settings', '設定', 'settings')}
          </nav>
          <div class="user-chip"><div class="avatar">學</div><span>學習者</span></div>
        </header>
        ${content}
        <nav class="mobile-nav" aria-label="手機導覽">
          ${topNavButton('banks', '題庫', 'book')}
          ${topNavButton('quiz', '測驗', 'play')}
          ${topNavButton('settings', '設定', 'settings')}
        </nav>
      </div>`;
  }

  function render() {
    if (timerId) { clearInterval(timerId); timerId = null; }
    applySettings();
    let content;
    if (state.view === 'quiz') content = renderQuizPage();
    else if (state.view === 'results') content = renderResultsPage();
    else if (state.view === 'settings') content = renderSettingsPage();
    else content = renderBanksPage();
    app.innerHTML = renderShell(content) + renderModal();
    bindEvents();
    if (state.view === 'quiz') startQuizTimer();
  }

  function renderBankRail() {
    return `<aside class="bank-rail">
      <div class="rail-actions">
        <button class="btn btn-primary" data-action="new-bank">${icon('plus')}<span>新增題庫</span></button>
        <button class="btn" data-action="bulk-import" ${banks.length ? '' : 'disabled'}>${icon('upload')}<span>批量輸入</span></button>
        <button class="btn" data-action="excel-import">${icon('table')}<span>Excel 匯入</span></button>
      </div>
      <div><div class="rail-label">我的題庫</div>
        <div class="bank-list">
          ${banks.map((bank) => `<button class="bank-item ${bank.id === state.selectedBankId ? 'active' : ''}" data-bank-id="${h(bank.id)}">
            <span class="bank-item-icon">${icon('book')}</span>
            <span><span class="bank-item-title">${h(bank.title)}</span><span class="bank-item-meta">${bank.questions.length} 題・${h(bank.subject || '未分類')}</span></span>
            <span aria-hidden="true">›</span>
          </button>`).join('')}
        </div>
      </div>
    </aside>`;
  }

  function filteredQuestions(bank) {
    let list = bank ? [...bank.questions] : [];
    const term = state.search.trim().toLowerCase();
    if (term) list = list.filter((q) => [q.text, ...q.options, q.explanation].join(' ').toLowerCase().includes(term));
    if (state.sort === 'az') list.sort((a, b) => a.text.localeCompare(b.text, 'zh-Hant'));
    if (state.sort === 'za') list.sort((a, b) => b.text.localeCompare(a.text, 'zh-Hant'));
    return list;
  }

  function renderQuestionCard(question, displayIndex) {
    return `<article class="question-card">
      <div class="question-top">
        <div class="question-number">${displayIndex}</div>
        <div class="question-copy">
          <div class="type-tag">單選題</div>
          <div class="question-text">${h(question.text)}</div>
          <div class="options-grid">
            ${question.options.map((option, index) => `<div class="option-preview ${index === question.correctIndex ? 'correct' : ''}"><span class="option-letter">${LETTERS[index]}</span><span>${h(option)}</span>${index === question.correctIndex ? icon('check') : ''}</div>`).join('')}
          </div>
          ${question.explanation ? `<div class="explanation"><strong>解析：</strong>${h(question.explanation)}</div>` : ''}
        </div>
        <div class="question-tools">
          <button class="btn btn-icon btn-ghost" data-action="edit-question" data-question-id="${h(question.id)}" aria-label="編輯題目">${icon('edit')}</button>
          <button class="btn btn-icon btn-ghost" data-action="copy-question" data-question-id="${h(question.id)}" aria-label="複製題目">${icon('copy')}</button>
          <button class="btn btn-icon btn-ghost" data-action="delete-question" data-question-id="${h(question.id)}" aria-label="刪除題目">${icon('trash')}</button>
        </div>
      </div>
    </article>`;
  }

  function renderBanksPage() {
    const bank = selectedBank();
    if (!bank) {
      return `<main class="page-wrap"><div class="page-header"><div><h1 class="page-title">題庫管理</h1><p class="page-description">建立你的第一個題庫，開始個人化溫習。</p></div></div><div class="bank-layout">${renderBankRail()}<section class="main-panel"><div class="empty-state"><div class="empty-icon">${icon('book')}</div><h3>未有任何題庫</h3><p>建立題庫後，可以逐題新增、批量貼上或從 Excel 匯入 MC 題目。</p><button class="btn btn-primary btn-lg" data-action="new-bank">${icon('plus')}建立題庫</button></div></section></div></main>`;
    }
    const all = filteredQuestions(bank);
    const pages = Math.max(1, Math.ceil(all.length / state.perPage));
    state.page = clamp(state.page, 1, pages);
    const start = (state.page - 1) * state.perPage;
    const pageItems = all.slice(start, start + state.perPage);
    return `<main class="page-wrap">
      <div class="page-header"><div><h1 class="page-title">題庫管理</h1><p class="page-description">建立、整理及匯入你的個人 MC 題目。</p></div><div class="header-actions"><button class="btn btn-soft" data-action="download-template">${icon('download')}下載匯入範本</button></div></div>
      <div class="bank-layout">
        ${renderBankRail()}
        <section class="main-panel">
          <div class="panel-head">
            <div><div class="panel-title-row"><h2 class="panel-title">${h(bank.title)}</h2><span class="type-tag">${h(bank.subject || '未分類')}</span></div><div class="panel-meta">${bank.questions.length} 題・建立於 ${formatDate(bank.createdAt)}・最後更新 ${formatDate(bank.updatedAt)}</div>${bank.description ? `<div class="panel-meta">${h(bank.description)}</div>` : ''}</div>
            <div class="panel-actions"><button class="btn" data-action="edit-bank">${icon('edit')}編輯</button><button class="btn btn-danger" data-action="delete-bank">${icon('trash')}刪除</button><button class="btn btn-primary" data-action="start-quiz" ${bank.questions.length ? '' : 'disabled'}>${icon('play')}開始測驗</button></div>
          </div>
          <div class="toolbar">
            <div class="search-field">${icon('search')}<input class="input" id="questionSearch" value="${h(state.search)}" placeholder="搜尋題目、選項或解析…" /></div>
            <select class="select" id="sortQuestions" aria-label="題目排序"><option value="default" ${state.sort === 'default' ? 'selected' : ''}>原有次序</option><option value="az" ${state.sort === 'az' ? 'selected' : ''}>題目 A–Z</option><option value="za" ${state.sort === 'za' ? 'selected' : ''}>題目 Z–A</option></select>
            <button class="btn btn-primary" data-action="new-question">${icon('plus')}新增題目</button>
          </div>
          ${pageItems.length ? `<div class="question-list">${pageItems.map((q, i) => renderQuestionCard(q, start + i + 1)).join('')}</div>` : `<div class="empty-state"><div class="empty-icon">${icon(state.search ? 'search' : 'file')}</div><h3>${state.search ? '找不到相關題目' : '題庫暫時未有題目'}</h3><p>${state.search ? '嘗試使用其他關鍵字。' : '可以逐題新增、批量貼上或從 Excel 匯入。'}</p>${state.search ? '' : `<button class="btn btn-primary" data-action="new-question">${icon('plus')}新增第一題</button>`}</div>`}
          <div class="panel-footer"><div class="pagination">${Array.from({ length: pages }, (_, i) => i + 1).slice(0, 10).map((page) => `<button class="page-dot ${page === state.page ? 'active' : ''}" data-page="${page}">${page}</button>`).join('')}</div><span class="panel-meta">顯示 ${all.length ? start + 1 : 0}–${Math.min(start + state.perPage, all.length)}，共 ${all.length} 題</span></div>
        </section>
      </div>
    </main>`;
  }

  function createQuizQuestion(question) {
    const optionObjects = question.options.map((text, index) => ({ text, isCorrect: index === question.correctIndex }));
    const arranged = settings.shuffleOptions ? shuffle(optionObjects) : optionObjects;
    return {
      id: question.id,
      sourceId: question.id,
      text: question.text,
      options: arranged.map((item) => item.text),
      correctIndex: arranged.findIndex((item) => item.isCorrect),
      explanation: question.explanation || ''
    };
  }

  function startQuiz(bankId = state.selectedBankId) {
    const bank = banks.find((item) => item.id === bankId);
    if (!bank || !bank.questions.length) { toast('此題庫暫時未有題目。', 'error'); return; }
    let questions = bank.questions.map(createQuizQuestion);
    if (settings.shuffleQuestions) questions = shuffle(questions);
    state.selectedBankId = bank.id;
    state.quiz = {
      bankId: bank.id,
      bankTitle: bank.title,
      questions,
      answers: Array(questions.length).fill(null),
      current: 0,
      flagged: [],
      remainingSeconds: settings.timerEnabled ? Number(settings.quizMinutes) * 60 : null,
      elapsedSeconds: 0,
      submittedByTimer: false
    };
    state.result = null;
    state.view = 'quiz';
    render();
  }

  function currentQuizQuestion() { return state.quiz?.questions[state.quiz.current] || null; }
  function renderQuizPage() {
    if (!state.quiz) {
      const bank = selectedBank();
      return `<main class="page-wrap"><div class="quiz-page"><div class="empty-state main-panel"><div class="empty-icon">${icon('play')}</div><h3>準備開始測驗</h3><p>${bank ? `目前選擇「${h(bank.title)}」，共有 ${bank.questions.length} 題。` : '請先建立或選擇題庫。'}</p><div class="header-actions" style="justify-content:center"><button class="btn" data-view="banks">返回題庫</button><button class="btn btn-primary btn-lg" data-action="start-quiz" ${bank?.questions.length ? '' : 'disabled'}>${icon('play')}開始測驗</button></div></div></div></main>`;
    }
    const quiz = state.quiz;
    const q = currentQuizQuestion();
    const answered = quiz.answers.filter((answer) => answer !== null).length;
    const progress = ((quiz.current + 1) / quiz.questions.length) * 100;
    const timerLabel = settings.timerEnabled ? '剩餘時間' : '已用時間';
    const timerValue = settings.timerEnabled ? quiz.remainingSeconds : quiz.elapsedSeconds;
    return `<main class="page-wrap"><div class="quiz-page">
      <div class="page-header"><div><h1 class="page-title">${h(quiz.bankTitle)}</h1><p class="page-description">專注作答，完成後可檢視分數及每題正確答案。</p></div><button class="btn btn-danger" data-action="submit-quiz">結束測驗</button></div>
      <section class="quiz-topbar">
        <div class="stat-card"><div class="stat-label">${timerLabel}</div><div id="quizTimer" class="stat-value timer-value">${formatTime(timerValue)}</div></div>
        <div class="stat-card"><div class="stat-label">進度</div><div class="progress-row"><strong>第 ${quiz.current + 1} / ${quiz.questions.length} 題</strong><div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div></div></div>
        <div class="stat-card"><div class="stat-label">已作答</div><div class="stat-value">${answered} <small>/ ${quiz.questions.length}</small></div></div>
      </section>
      <section class="quiz-card">
        <div class="quiz-card-head"><span class="type-tag">單選題</span><button class="btn btn-ghost" data-action="toggle-flag">${icon('flag')} ${quiz.flagged.includes(quiz.current) ? '取消標記' : '標記本題'}</button></div>
        <h2 class="quiz-question">${h(q.text)}</h2>
        <div class="quiz-options">${q.options.map((option, index) => `<button class="quiz-option ${quiz.answers[quiz.current] === index ? 'selected' : ''}" data-answer="${index}"><span class="option-letter">${LETTERS[index]}</span><span>${h(option)}</span></button>`).join('')}</div>
        <div class="quiz-actions">
          <button class="btn" data-action="prev-question" ${quiz.current === 0 ? 'disabled' : ''}>${icon('chevronLeft')}上一題</button>
          <div class="quiz-actions-middle"><button class="btn btn-soft" data-action="toggle-flag">${icon('flag')}標記本題</button></div>
          ${quiz.current === quiz.questions.length - 1 ? `<button class="btn btn-success" data-action="submit-quiz">${icon('check')}提交測驗</button>` : `<button class="btn btn-primary" data-action="next-question">下一題${icon('chevronRight')}</button>`}
        </div>
      </section>
      <section class="question-nav"><div class="nav-grid">${quiz.questions.map((_, index) => `<button class="q-nav-btn ${quiz.answers[index] !== null ? 'answered' : ''} ${index === quiz.current ? 'current' : ''} ${quiz.flagged.includes(index) ? 'flagged' : ''}" data-quiz-index="${index}">${index + 1}</button>`).join('')}</div><div class="legend"><span><i class="legend-dot green"></i>已作答</span><span><i class="legend-dot blue"></i>目前題目</span><span><i class="legend-dot"></i>未作答</span><span><i class="legend-dot orange"></i>已標記</span></div></section>
    </div></main>`;
  }

  function startQuizTimer() {
    if (!state.quiz) return;
    timerId = window.setInterval(() => {
      if (!state.quiz || state.view !== 'quiz') return;
      state.quiz.elapsedSeconds += 1;
      if (settings.timerEnabled) {
        state.quiz.remainingSeconds = Math.max(0, state.quiz.remainingSeconds - 1);
        if (state.quiz.remainingSeconds === 0) {
          state.quiz.submittedByTimer = true;
          submitQuiz(true);
          return;
        }
      }
      const timer = document.getElementById('quizTimer');
      if (timer) timer.textContent = formatTime(settings.timerEnabled ? state.quiz.remainingSeconds : state.quiz.elapsedSeconds);
    }, 1000);
  }

  function submitQuiz(force = false) {
    if (!state.quiz) return;
    const unanswered = state.quiz.answers.filter((answer) => answer === null).length;
    if (!force && unanswered && !window.confirm(`仍有 ${unanswered} 題未作答，確定提交測驗？`)) return;
    const items = state.quiz.questions.map((question, index) => ({
      question,
      userAnswer: state.quiz.answers[index],
      isCorrect: state.quiz.answers[index] === question.correctIndex
    }));
    const correct = items.filter((item) => item.isCorrect).length;
    state.result = {
      bankId: state.quiz.bankId,
      bankTitle: state.quiz.bankTitle,
      total: items.length,
      correct,
      wrong: items.filter((item) => item.userAnswer !== null && !item.isCorrect).length,
      unanswered,
      elapsedSeconds: state.quiz.elapsedSeconds,
      timedOut: state.quiz.submittedByTimer,
      items
    };
    state.view = 'results';
    render();
  }

  function renderResultsPage() {
    const result = state.result;
    if (!result) return `<main class="page-wrap"><div class="empty-state main-panel"><h3>未有測驗結果</h3><button class="btn btn-primary" data-view="banks">返回題庫</button></div></main>`;
    const percent = Math.round((result.correct / result.total) * 100);
    return `<main class="page-wrap">
      <div class="page-header"><div><h1 class="page-title">測驗結果</h1><p class="page-description">${h(result.bankTitle)}${result.timedOut ? '・時間到，系統已自動提交' : ''}</p></div><button class="btn" data-view="banks">返回題庫</button></div>
      <div class="result-grid">
        <section class="summary-card"><div class="result-icon">${icon('trophy', 'icon')}</div><h2 class="result-title">測驗完成</h2><p class="result-subtitle">${percent >= 80 ? '表現很好，繼續保持！' : percent >= 60 ? '已有不錯基礎，再溫習錯題會更穩。' : '先集中重溫錯題及解析，再挑戰一次。'}</p><div class="score">${result.correct}<small> / ${result.total}</small></div><div class="accuracy">正確率 ${percent}%</div><div class="summary-stats"><div class="summary-stat"><strong>${result.correct}</strong><span>答對</span></div><div class="summary-stat"><strong>${result.wrong}</strong><span>答錯</span></div><div class="summary-stat"><strong>${result.unanswered}</strong><span>未作答</span></div></div><p class="panel-meta">作答時間 ${formatTime(result.elapsedSeconds)}</p><div class="summary-buttons"><button class="btn" data-view="banks">返回題庫</button><button class="btn btn-primary" data-action="retry-quiz">${icon('refresh')}重新測驗</button></div></section>
        <section class="review-card"><div class="review-head"><div><h2>答案檢視</h2><div class="panel-meta">逐題比較你的答案及正確答案</div></div><span class="type-tag">${result.correct}/${result.total}</span></div>
          ${settings.showAnswers ? `<div class="review-list">${result.items.map((item, index) => {
            const ua = item.userAnswer;
            const correctLetter = LETTERS[item.question.correctIndex];
            return `<article class="review-item ${item.isCorrect ? 'correct' : 'wrong'}"><div class="review-question">${index + 1}. ${h(item.question.text)}</div><div class="answer-lines"><div class="answer-line ${item.isCorrect ? 'correct-answer' : 'user-wrong'}">${icon(item.isCorrect ? 'check' : 'x')}<span><strong>你的答案：</strong>${ua === null ? '未作答' : `${LETTERS[ua]}. ${h(item.question.options[ua])}`}</span></div><div class="answer-line correct-answer">${icon('check')}<span><strong>正確答案：</strong>${correctLetter}. ${h(item.question.options[item.question.correctIndex])}</span></div>${item.question.explanation ? `<div class="answer-line">${icon('book')}<span><strong>解析：</strong>${h(item.question.explanation)}</span></div>` : ''}</div></article>`;
          }).join('')}</div>` : `<div class="empty-state"><div class="empty-icon">${icon('eye')}</div><h3>答案顯示已關閉</h3><p>你可以在「設定」中開啟完成測驗後顯示答案及解析。</p><button class="btn" data-view="settings">前往設定</button></div>`}
        </section>
      </div>
    </main>`;
  }

  function settingNavButton(section, label, iconName) {
    return `<button class="${state.settingsSection === section ? 'active' : ''}" data-settings-section="${section}">${icon(iconName)}${label}</button>`;
  }
  function toggleButton(key, value) {
    return `<button type="button" class="toggle" data-toggle-setting="${key}" aria-pressed="${value ? 'true' : 'false'}" aria-label="${key}"><span></span></button>`;
  }
  function renderSettingsPage() {
    return `<main class="page-wrap"><div class="page-header"><div><h1 class="page-title">設定</h1><p class="page-description">自訂最適合你的閱讀與測驗環境。</p></div></div>
      <div class="settings-layout">
        <aside class="settings-nav">${settingNavButton('general', '一般設定', 'settings')}${settingNavButton('quiz', '測驗設定', 'clock')}${settingNavButton('data', '資料與備份', 'database')}</aside>
        <form class="settings-content" id="settingsForm">
          <section class="settings-section" id="generalSettings"><h2 class="section-heading">介面設定</h2><p class="section-copy">調整文字大小及網站顯示模式。</p>
            <div class="setting-row"><div><div class="setting-label">字體大小</div><div class="setting-help">調整網站內所有文字及控制項的大小。</div></div><div class="setting-control"><select class="select" name="fontSize"><option value="small" ${settings.fontSize === 'small' ? 'selected' : ''}>小</option><option value="medium" ${settings.fontSize === 'medium' ? 'selected' : ''}>中</option><option value="large" ${settings.fontSize === 'large' ? 'selected' : ''}>大</option></select></div></div>
            <div class="setting-row"><div><div class="setting-label">深色模式</div><div class="setting-help">在光線較暗的環境減少畫面亮度。</div></div><div class="setting-control">${toggleButton('darkMode', settings.darkMode)}</div></div>
          </section>
          <section class="settings-section" id="quizSettings"><h2 class="section-heading">測驗設定</h2><p class="section-copy">設定每次開始測驗時採用的預設規則。</p>
            <div class="setting-row"><div><div class="setting-label">預設測驗時間</div><div class="setting-help">倒數計時器開啟時使用。</div></div><div class="setting-control"><select class="select" name="quizMinutes">${[5,10,15,20,30,45,60,90].map((value) => `<option value="${value}" ${Number(settings.quizMinutes) === value ? 'selected' : ''}>${value} 分鐘</option>`).join('')}</select></div></div>
            <div class="setting-row"><div><div class="setting-label">開啟倒數計時器</div><div class="setting-help">關閉後仍會顯示已用時間，但不會自動提交。</div></div><div class="setting-control">${toggleButton('timerEnabled', settings.timerEnabled)}</div></div>
            <div class="setting-row"><div><div class="setting-label">題目每次不同次序</div><div class="setting-help">每次開始測驗時隨機排列題目。</div></div><div class="setting-control">${toggleButton('shuffleQuestions', settings.shuffleQuestions)}</div></div>
            <div class="setting-row"><div><div class="setting-label">選項每次不同次序</div><div class="setting-help">隨機排列 A、B、C、D 選項，系統會同步更新正確答案。</div></div><div class="setting-control">${toggleButton('shuffleOptions', settings.shuffleOptions)}</div></div>
            <div class="setting-row"><div><div class="setting-label">完成後顯示正確答案</div><div class="setting-help">顯示你的答案、正確答案及題目解析。</div></div><div class="setting-control">${toggleButton('showAnswers', settings.showAnswers)}</div></div>
          </section>
          <section class="settings-section" id="dataSettings"><h2 class="section-heading">資料與備份</h2><p class="section-copy">所有題庫預設只儲存在目前瀏覽器，建議定期匯出備份。</p><div class="data-actions"><button type="button" class="btn" data-action="export-backup">${icon('download')}匯出 JSON 備份</button><button type="button" class="btn" data-action="import-backup">${icon('upload')}還原備份</button><button type="button" class="btn btn-danger" data-action="reset-data">${icon('refresh')}重設示範資料</button><input id="backupFile" type="file" accept="application/json,.json" class="sr-only" /></div></section>
          <div class="settings-save"><button type="submit" class="btn btn-success btn-lg">${icon('save')}儲存設定</button></div>
        </form>
      </div>
    </main>`;
  }

  function renderModal() {
    const modal = state.modal;
    if (!modal) return '';
    let body = '';
    let title = '';
    let wide = false;
    let footer = '';

    if (modal.type === 'bank') {
      const bank = modal.bank || { title: '', subject: '', description: '' };
      title = modal.bank ? '編輯題庫' : '新增題庫';
      body = `<form id="bankForm" class="form-grid">
        <div class="form-field full"><label class="form-label" for="bankTitle">題庫名稱</label><input class="input" id="bankTitle" name="title" value="${h(bank.title)}" placeholder="例如：生物學單元測驗" required maxlength="80" autofocus /></div>
        <div class="form-field full"><label class="form-label" for="bankSubject">科目／分類</label><input class="input" id="bankSubject" name="subject" value="${h(bank.subject)}" placeholder="例如：生物學" maxlength="40" /></div>
        <div class="form-field full"><label class="form-label" for="bankDescription">簡介</label><textarea class="textarea" id="bankDescription" name="description" placeholder="簡單描述題庫內容…" maxlength="240">${h(bank.description)}</textarea></div>
      </form>`;
      footer = `<button class="btn" data-action="close-modal">取消</button><button class="btn btn-primary" data-submit-form="bankForm">${icon('save')}儲存題庫</button>`;
    }

    if (modal.type === 'question') {
      const q = modal.question || { text: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' };
      title = modal.question ? '編輯題目' : '新增題目';
      wide = true;
      body = `<form id="questionForm" class="form-grid">
        <div class="form-field full"><label class="form-label" for="questionText">題目</label><textarea class="textarea" id="questionText" name="text" required placeholder="輸入 MC 題目…" autofocus>${h(q.text)}</textarea></div>
        ${q.options.map((option, index) => `<div class="form-field"><label class="form-label">選項 ${LETTERS[index]}</label><div class="option-edit-row"><span class="option-edit-letter">${LETTERS[index]}</span><input class="input" name="option${index}" value="${h(option)}" required placeholder="選項 ${LETTERS[index]}" /></div></div>`).join('')}
        <div class="form-field"><label class="form-label" for="correctIndex">正確答案</label><select class="select" id="correctIndex" name="correctIndex">${LETTERS.map((letter, index) => `<option value="${index}" ${q.correctIndex === index ? 'selected' : ''}>${letter}</option>`).join('')}</select></div>
        <div class="form-field full"><label class="form-label" for="explanation">答案解析（選填）</label><textarea class="textarea" id="explanation" name="explanation" placeholder="解釋正確答案或補充溫習重點…">${h(q.explanation)}</textarea></div>
      </form>`;
      footer = `<button class="btn" data-action="close-modal">取消</button><button class="btn btn-primary" data-submit-form="questionForm">${icon('save')}儲存題目</button>`;
    }

    if (modal.type === 'bulk') {
      title = '批量輸入題目';
      wide = true;
      body = `<form id="bulkForm" class="form-grid"><div class="form-field full"><label class="form-label" for="bulkText">貼上題目內容</label><textarea class="textarea" id="bulkText" name="bulkText" style="min-height:300px" required placeholder="1. 題目…&#10;A. 選項 A&#10;B. 選項 B&#10;C. 選項 C&#10;D. 選項 D&#10;答案: B"></textarea><div class="form-help">每題之間留一個空行；亦支援每題一行的 Tab 分隔格式。</div><div class="bulk-example">1. 細胞膜的主要功能是？
A. 合成蛋白質
B. 控制物質進出細胞
C. 儲存遺傳物質
D. 提供細胞能量
答案: B
解析: 細胞膜具有選擇性通透性。</div></div></form>`;
      footer = `<button class="btn" data-action="close-modal">取消</button><button class="btn btn-primary" data-submit-form="bulkForm">${icon('upload')}匯入題目</button>`;
    }

    if (modal.type === 'excel') {
      title = 'Excel／CSV 匯入';
      body = `<form id="excelForm" class="form-grid">
        <div class="form-field full"><label class="form-label">匯入至題庫</label><select class="select" name="bankId" required>${banks.map((bank) => `<option value="${h(bank.id)}" ${bank.id === state.selectedBankId ? 'selected' : ''}>${h(bank.title)}</option>`).join('')}<option value="__new__">＋ 根據檔名建立新題庫</option></select></div>
        <div class="form-field full"><label class="import-drop" for="excelFile">${icon('table', 'empty-icon icon')}<strong>選擇 Excel、CSV 或 TSV 檔案</strong><p>支援 .xlsx、.xls、.csv、.tsv。欄位：題目、A、B、C、D、答案、解析。</p><span class="btn btn-soft">選擇檔案</span><input id="excelFile" name="excelFile" type="file" accept=".xlsx,.xls,.csv,.tsv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" required /></label><div id="fileName" class="form-help">尚未選擇檔案</div></div>
        <div class="form-field full"><button type="button" class="btn" data-action="download-template">${icon('download')}下載 CSV 範本</button></div>
      </form>`;
      footer = `<button class="btn" data-action="close-modal">取消</button><button class="btn btn-primary" data-submit-form="excelForm">${icon('upload')}開始匯入</button>`;
    }

    return `<div class="modal-backdrop" data-action="backdrop-close"><section class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-labelledby="modalTitle"><header class="modal-head"><h2 class="modal-title" id="modalTitle">${title}</h2><button class="btn btn-icon btn-ghost" data-action="close-modal" aria-label="關閉">${icon('x')}</button></header><div class="modal-body">${body}</div><footer class="modal-footer">${footer}</footer></section></div>`;
  }

  function parseBulkText(text) {
    const normalized = String(text || '').replace(/\r/g, '').trim();
    if (!normalized) return [];
    const lines = normalized.split('\n').filter((line) => line.trim());
    const tabRows = lines.filter((line) => line.includes('\t'));
    if (tabRows.length === lines.length) {
      return tabRows.map((line) => line.split('\t').map((cell) => cell.trim())).filter((row) => row.length >= 6).map((row) => {
        const answer = String(row[5] || '').trim().toUpperCase();
        const correctIndex = LETTERS.indexOf(answer);
        if (!row[0] || row.slice(1, 5).some((cell) => !cell) || correctIndex < 0) throw new Error(`無法識別題目或答案：${row[0] || line}`);
        return makeQuestion(row[0], row.slice(1, 5), correctIndex, row[6] || '');
      });
    }

    const blocks = normalized.split(/\n\s*\n|\n(?=\s*(?:\d+[.)、]|Q\s*[:：]))/i).map((block) => block.trim()).filter(Boolean);
    return blocks.map((block) => {
      const blockLines = block.split('\n').map((line) => line.trim()).filter(Boolean);
      let question = '';
      const options = Array(4).fill('');
      let answer = '';
      let explanation = '';
      for (const line of blockLines) {
        const optionMatch = line.match(/^([A-D])\s*[.、):：-]\s*(.+)$/i);
        const answerMatch = line.match(/^(?:答案|正確答案|Answer)\s*[:：]\s*([A-D])/i);
        const explanationMatch = line.match(/^(?:解析|解釋|Explanation)\s*[:：]\s*(.+)$/i);
        if (optionMatch) options[LETTERS.indexOf(optionMatch[1].toUpperCase())] = optionMatch[2].trim();
        else if (answerMatch) answer = answerMatch[1].toUpperCase();
        else if (explanationMatch) explanation = explanationMatch[1].trim();
        else if (!question) question = line.replace(/^\s*(?:\d+[.)、]|Q\s*[:：])\s*/i, '').trim();
        else explanation += `${explanation ? ' ' : ''}${line}`;
      }
      const correctIndex = LETTERS.indexOf(answer);
      if (!question || options.some((option) => !option) || correctIndex < 0) throw new Error(`格式有誤：${question || block.slice(0, 30)}`);
      return makeQuestion(question, options, correctIndex, explanation);
    });
  }

  function parseCsv(text, delimiter = ',') {
    const rows = [];
    let row = [], cell = '', quoted = false;
    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      if (char === '"') {
        if (quoted && text[i + 1] === '"') { cell += '"'; i += 1; }
        else quoted = !quoted;
      } else if (char === delimiter && !quoted) { row.push(cell); cell = ''; }
      else if ((char === '\n' || char === '\r') && !quoted) {
        if (char === '\r' && text[i + 1] === '\n') i += 1;
        row.push(cell); if (row.some((value) => value.trim())) rows.push(row); row = []; cell = '';
      } else cell += char;
    }
    row.push(cell); if (row.some((value) => value.trim())) rows.push(row);
    if (!rows.length) return [];
    const headers = rows[0].map((value) => value.replace(/^\uFEFF/, '').trim());
    return rows.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])));
  }

  function rowValue(row, aliases) {
    const entries = Object.entries(row);
    for (const alias of aliases) {
      const found = entries.find(([key]) => key.trim().toLowerCase() === alias.toLowerCase());
      if (found) return String(found[1] ?? '').trim();
    }
    return '';
  }
  function rowsToQuestions(rows) {
    const questions = [];
    rows.forEach((row, rowIndex) => {
      const text = rowValue(row, ['題目', '問題', 'question', 'title']);
      if (!text) return;
      const options = [
        rowValue(row, ['A', '選項A', 'option a', 'option_a']),
        rowValue(row, ['B', '選項B', 'option b', 'option_b']),
        rowValue(row, ['C', '選項C', 'option c', 'option_c']),
        rowValue(row, ['D', '選項D', 'option d', 'option_d'])
      ];
      const answerRaw = rowValue(row, ['答案', '正確答案', 'answer', 'correct answer', 'correct_answer']).toUpperCase().replace(/[^A-D0-3]/g, '');
      let correctIndex = LETTERS.indexOf(answerRaw[0]);
      if (correctIndex < 0 && /^[0-3]$/.test(answerRaw)) correctIndex = Number(answerRaw);
      if (options.some((option) => !option) || correctIndex < 0) throw new Error(`第 ${rowIndex + 2} 行缺少選項或答案。`);
      questions.push(makeQuestion(text, options, correctIndex, rowValue(row, ['解析', '解釋', 'explanation', 'notes'])));
    });
    return questions;
  }

  async function importQuestionFile(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    if (extension === 'csv' || extension === 'tsv' || extension === 'txt') {
      const text = await file.text();
      const rows = parseCsv(text, extension === 'tsv' || text.split('\n')[0].includes('\t') ? '\t' : ',');
      return rowsToQuestions(rows);
    }
    if (!window.XLSX) throw new Error('Excel 解析程式尚未載入。請檢查網絡連線，或將檔案另存為 CSV 再匯入。');
    const workbook = window.XLSX.read(await file.arrayBuffer(), { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return rowsToQuestions(window.XLSX.utils.sheet_to_json(sheet, { defval: '' }));
  }

  function downloadTemplate() {
    const rows = [
      ['題目', 'A', 'B', 'C', 'D', '答案', '解析'],
      ['細胞膜的主要功能是？', '合成蛋白質', '控制物質進出細胞', '儲存遺傳物質', '提供細胞能量', 'B', '細胞膜具有選擇性通透性。']
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    downloadBlob('MC題庫匯入範本.csv', new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }));
    toast('已下載匯入範本。');
  }

  function handleBankForm(form) {
    const data = new FormData(form);
    const values = {
      title: String(data.get('title') || '').trim(),
      subject: String(data.get('subject') || '').trim(),
      description: String(data.get('description') || '').trim()
    };
    if (!values.title) { toast('請輸入題庫名稱。', 'error'); return; }
    if (state.modal.bank) {
      const index = banks.findIndex((bank) => bank.id === state.modal.bank.id);
      banks[index] = { ...banks[index], ...values, updatedAt: today() };
      toast('題庫已更新。');
    } else {
      const bank = { id: uid('bank'), ...values, createdAt: today(), updatedAt: today(), questions: [] };
      banks.unshift(bank); state.selectedBankId = bank.id; state.page = 1; toast('題庫已建立。');
    }
    saveBanks(); state.modal = null; render();
  }

  function handleQuestionForm(form) {
    const bank = selectedBank();
    if (!bank) return;
    const data = new FormData(form);
    const question = {
      id: state.modal.question?.id || uid('q'),
      text: String(data.get('text') || '').trim(),
      options: [0, 1, 2, 3].map((index) => String(data.get(`option${index}`) || '').trim()),
      correctIndex: Number(data.get('correctIndex')),
      explanation: String(data.get('explanation') || '').trim()
    };
    if (!question.text || question.options.some((option) => !option)) { toast('請填寫題目及四個選項。', 'error'); return; }
    const bankIndex = banks.findIndex((item) => item.id === bank.id);
    if (state.modal.question) {
      const questionIndex = banks[bankIndex].questions.findIndex((item) => item.id === question.id);
      banks[bankIndex].questions[questionIndex] = question; toast('題目已更新。');
    } else {
      banks[bankIndex].questions.push(question); toast('題目已新增。');
    }
    banks[bankIndex].updatedAt = today(); saveBanks(); state.modal = null; render();
  }

  function handleBulkForm(form) {
    try {
      const questions = parseBulkText(new FormData(form).get('bulkText'));
      if (!questions.length) throw new Error('未能識別任何題目。');
      const bankIndex = banks.findIndex((item) => item.id === state.selectedBankId);
      banks[bankIndex].questions.push(...questions);
      banks[bankIndex].updatedAt = today(); saveBanks(); state.modal = null; render(); toast(`已匯入 ${questions.length} 題。`);
    } catch (error) { toast(error.message || '批量輸入格式有誤。', 'error'); }
  }

  async function handleExcelForm(form) {
    const button = document.querySelector('[data-submit-form="excelForm"]');
    try {
      const data = new FormData(form);
      const file = data.get('excelFile');
      if (!(file instanceof File) || !file.name) throw new Error('請選擇檔案。');
      if (button) { button.disabled = true; button.textContent = '匯入中…'; }
      const questions = await importQuestionFile(file);
      if (!questions.length) throw new Error('檔案內未找到有效題目。');
      let bankId = String(data.get('bankId') || '');
      if (bankId === '__new__') {
        const title = file.name.replace(/\.[^.]+$/, '') || '匯入題庫';
        const bank = { id: uid('bank'), title, subject: '匯入題庫', description: `由 ${file.name} 匯入`, createdAt: today(), updatedAt: today(), questions: [] };
        banks.unshift(bank); bankId = bank.id;
      }
      const bankIndex = banks.findIndex((item) => item.id === bankId);
      if (bankIndex < 0) throw new Error('找不到目標題庫。');
      banks[bankIndex].questions.push(...questions); banks[bankIndex].updatedAt = today();
      state.selectedBankId = bankId; saveBanks(); state.modal = null; render(); toast(`成功從 ${file.name} 匯入 ${questions.length} 題。`);
    } catch (error) {
      if (button) { button.disabled = false; button.innerHTML = `${icon('upload')}開始匯入`; }
      toast(error.message || '匯入失敗。', 'error');
    }
  }

  function exportBackup() {
    const payload = { version: 1, exportedAt: new Date().toISOString(), banks, settings };
    downloadBlob(`MC題庫備份-${today()}.json`, new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' }));
    toast('已匯出完整備份。');
  }

  async function restoreBackup(file) {
    try {
      const payload = JSON.parse(await file.text());
      if (!Array.isArray(payload.banks)) throw new Error('備份檔案格式不正確。');
      banks = payload.banks;
      settings = { ...DEFAULT_SETTINGS, ...(payload.settings || {}) };
      state.selectedBankId = banks[0]?.id || null;
      saveBanks(); saveSettings(); render(); toast('題庫及設定已還原。');
    } catch (error) { toast(error.message || '無法還原備份。', 'error'); }
  }

  function goToView(view) {
    if (view === 'quiz') {
      if (state.quiz) { state.view = 'quiz'; render(); }
      else startQuiz();
      return;
    }
    state.view = view; render();
  }

  function bindEvents() {
    app.querySelectorAll('[data-view]').forEach((button) => button.addEventListener('click', () => goToView(button.dataset.view)));
    app.querySelectorAll('[data-bank-id]').forEach((button) => button.addEventListener('click', () => {
      state.selectedBankId = button.dataset.bankId; state.search = ''; state.page = 1; state.view = 'banks'; render();
    }));
    app.querySelectorAll('[data-page]').forEach((button) => button.addEventListener('click', () => { state.page = Number(button.dataset.page); render(); }));
    app.querySelectorAll('[data-quiz-index]').forEach((button) => button.addEventListener('click', () => { state.quiz.current = Number(button.dataset.quizIndex); render(); }));
    app.querySelectorAll('[data-answer]').forEach((button) => button.addEventListener('click', () => { state.quiz.answers[state.quiz.current] = Number(button.dataset.answer); render(); }));
    app.querySelectorAll('[data-settings-section]').forEach((button) => button.addEventListener('click', () => {
      state.settingsSection = button.dataset.settingsSection;
      const map = { general: 'generalSettings', quiz: 'quizSettings', data: 'dataSettings' };
      document.getElementById(map[state.settingsSection])?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      app.querySelectorAll('[data-settings-section]').forEach((item) => item.classList.toggle('active', item.dataset.settingsSection === state.settingsSection));
    }));
    app.querySelectorAll('[data-toggle-setting]').forEach((button) => button.addEventListener('click', () => {
      const key = button.dataset.toggleSetting;
      settings[key] = !settings[key];
      button.setAttribute('aria-pressed', String(settings[key]));
      if (key === 'darkMode') applySettings();
    }));
    app.querySelectorAll('[data-submit-form]').forEach((button) => button.addEventListener('click', () => {
      const form = document.getElementById(button.dataset.submitForm);
      if (!form?.reportValidity()) return;
      form.requestSubmit();
    }));

    const search = document.getElementById('questionSearch');
    if (search) search.addEventListener('input', (event) => { state.search = event.target.value; state.page = 1; window.clearTimeout(search.timeout); search.timeout = window.setTimeout(render, 180); });
    const sort = document.getElementById('sortQuestions');
    if (sort) sort.addEventListener('change', (event) => { state.sort = event.target.value; state.page = 1; render(); });
    const excelFile = document.getElementById('excelFile');
    if (excelFile) excelFile.addEventListener('change', () => { const el = document.getElementById('fileName'); if (el) el.textContent = excelFile.files[0]?.name || '尚未選擇檔案'; });
    const backupFile = document.getElementById('backupFile');
    if (backupFile) backupFile.addEventListener('change', () => { if (backupFile.files[0]) restoreBackup(backupFile.files[0]); });

    const bankForm = document.getElementById('bankForm');
    if (bankForm) bankForm.addEventListener('submit', (event) => { event.preventDefault(); handleBankForm(bankForm); });
    const questionForm = document.getElementById('questionForm');
    if (questionForm) questionForm.addEventListener('submit', (event) => { event.preventDefault(); handleQuestionForm(questionForm); });
    const bulkForm = document.getElementById('bulkForm');
    if (bulkForm) bulkForm.addEventListener('submit', (event) => { event.preventDefault(); handleBulkForm(bulkForm); });
    const excelForm = document.getElementById('excelForm');
    if (excelForm) excelForm.addEventListener('submit', (event) => { event.preventDefault(); handleExcelForm(excelForm); });
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) settingsForm.addEventListener('submit', (event) => {
      event.preventDefault(); const data = new FormData(settingsForm);
      settings.fontSize = String(data.get('fontSize')); settings.quizMinutes = Number(data.get('quizMinutes'));
      saveSettings(); applySettings(); toast('設定已儲存。'); render();
    });

    app.querySelectorAll('[data-action]').forEach((button) => button.addEventListener('click', async (event) => {
      const action = button.dataset.action;
      const bank = selectedBank();
      if (action === 'new-bank') { state.modal = { type: 'bank', bank: null }; render(); }
      if (action === 'edit-bank' && bank) { state.modal = { type: 'bank', bank: deepClone(bank) }; render(); }
      if (action === 'delete-bank' && bank && window.confirm(`確定刪除「${bank.title}」及其中 ${bank.questions.length} 題？`)) {
        banks = banks.filter((item) => item.id !== bank.id); state.selectedBankId = banks[0]?.id || null; saveBanks(); render(); toast('題庫已刪除。');
      }
      if (action === 'new-question') { state.modal = { type: 'question', question: null }; render(); }
      if (action === 'edit-question') { const q = bank?.questions.find((item) => item.id === button.dataset.questionId); state.modal = { type: 'question', question: deepClone(q) }; render(); }
      if (action === 'copy-question' && bank) {
        const bankIndex = banks.findIndex((item) => item.id === bank.id); const q = bank.questions.find((item) => item.id === button.dataset.questionId);
        const copy = { ...deepClone(q), id: uid('q'), text: `${q.text}（副本）` }; banks[bankIndex].questions.push(copy); banks[bankIndex].updatedAt = today(); saveBanks(); render(); toast('已複製題目。');
      }
      if (action === 'delete-question' && bank) {
        const q = bank.questions.find((item) => item.id === button.dataset.questionId);
        if (q && window.confirm('確定刪除此題？')) { const bankIndex = banks.findIndex((item) => item.id === bank.id); banks[bankIndex].questions = banks[bankIndex].questions.filter((item) => item.id !== q.id); banks[bankIndex].updatedAt = today(); saveBanks(); render(); toast('題目已刪除。'); }
      }
      if (action === 'bulk-import') { state.modal = { type: 'bulk' }; render(); }
      if (action === 'excel-import') {
        if (!banks.length) { const newBank = { id: uid('bank'), title: '新題庫', subject: '未分類', description: '', createdAt: today(), updatedAt: today(), questions: [] }; banks.push(newBank); state.selectedBankId = newBank.id; saveBanks(); }
        state.modal = { type: 'excel' }; render();
      }
      if (action === 'download-template') downloadTemplate();
      if (action === 'start-quiz') startQuiz();
      if (action === 'prev-question' && state.quiz) { state.quiz.current = Math.max(0, state.quiz.current - 1); render(); }
      if (action === 'next-question' && state.quiz) { state.quiz.current = Math.min(state.quiz.questions.length - 1, state.quiz.current + 1); render(); }
      if (action === 'toggle-flag' && state.quiz) {
        const index = state.quiz.current; state.quiz.flagged = state.quiz.flagged.includes(index) ? state.quiz.flagged.filter((item) => item !== index) : [...state.quiz.flagged, index]; render();
      }
      if (action === 'submit-quiz') submitQuiz(false);
      if (action === 'retry-quiz') startQuiz(state.result?.bankId);
      if (action === 'close-modal') { state.modal = null; render(); }
      if (action === 'backdrop-close' && event.target === button) { state.modal = null; render(); }
      if (action === 'export-backup') exportBackup();
      if (action === 'import-backup') document.getElementById('backupFile')?.click();
      if (action === 'reset-data' && window.confirm('確定重設所有題庫及設定？現有資料會被示範資料取代。')) {
        banks = deepClone(DEFAULT_BANKS); settings = deepClone(DEFAULT_SETTINGS); state.selectedBankId = banks[0].id; saveBanks(); saveSettings(); render(); toast('已重設示範資料。');
      }
    }));

    document.removeEventListener('keydown', handleKeyboard);
    document.addEventListener('keydown', handleKeyboard);
  }

  function handleKeyboard(event) {
    if (event.key === 'Escape' && state.modal) { state.modal = null; render(); return; }
    if (state.view === 'quiz' && state.quiz && !state.modal) {
      if (['1', '2', '3', '4'].includes(event.key)) { state.quiz.answers[state.quiz.current] = Number(event.key) - 1; render(); return; }
      if (event.key === 'ArrowLeft') { state.quiz.current = Math.max(0, state.quiz.current - 1); render(); return; }
      if (event.key === 'ArrowRight') { state.quiz.current = Math.min(state.quiz.questions.length - 1, state.quiz.current + 1); render(); return; }
    }
  }

  async function startApp() {
    if (!supabase) {
      app.innerHTML = '<main class="page-wrap"><section class="empty-state main-panel"><h1>雲端設定未完成</h1><p>找不到 Supabase 設定，請檢查 supabase-config.js。</p></section></main>';
      return;
    }
    const { data } = await supabase.auth.getSession();
    currentUser = data.session?.user || null;
    if (!currentUser) { renderAuth(); return; }
    await loadCloudData();
    render();
  }

  startApp();
})();
