/* multimodel-analysis documentation: behaviour.
   No dependencies. Data: window.API_DATA (assets/js/api-data.js) and assets/data/results.json. */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ toast */
  var toastEl = $('#toast'), toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    toastEl.style.animation = 'none'; void toastEl.offsetWidth; toastEl.style.animation = '';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.hidden = true; }, 1800);
  }

  /* -------------------------------------------------------------- clipboard */
  function copyText(text, onDone) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
      onDone(ok);
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { onDone(true); }, fallback);
    } else { fallback(); }
  }
  function flashCopied(btn, ok) {
    var old = btn.textContent;
    btn.textContent = ok ? 'Copied' : 'Copy failed';
    btn.classList.toggle('done', ok);
    toast(ok ? 'Copied to clipboard' : 'Could not copy, select the text manually');
    setTimeout(function () { btn.textContent = old; btn.classList.remove('done'); }, 1500);
  }

  /* ------------------------------------------------------ syntax highlighting */
  var PY_KW = /^(?:and|as|assert|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|None|nonlocal|not|or|pass|raise|return|try|True|False|while|with|yield)$/;
  var TOKEN = /(#[^\n]*)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')|(\b\d+(?:\.\d+)?(?:e-?\d+)?\b)|(\b[A-Za-z_]\w*\b)(\s*\()?/g;
  function highlight(code, lang) {
    var out = '', last = 0, m;
    var py = lang === 'python';
    TOKEN.lastIndex = 0;
    while ((m = TOKEN.exec(code))) {
      out += esc(code.slice(last, m.index));
      if (m[1]) out += '<span class="tk-com">' + esc(m[1]) + '</span>';
      else if (m[2]) out += '<span class="tk-str">' + esc(m[2]) + '</span>';
      else if (m[3]) out += py ? '<span class="tk-num">' + m[3] + '</span>' : m[3];
      else if (m[4]) {
        if (py && PY_KW.test(m[4])) out += '<span class="tk-kw">' + m[4] + '</span>' + esc(m[5] || '');
        else if (py && m[5]) out += '<span class="tk-fn">' + m[4] + '</span>' + esc(m[5]);
        else out += esc(m[4]) + esc(m[5] || '');
      }
      last = TOKEN.lastIndex;
    }
    return out + esc(code.slice(last));
  }
  function decorateCode(block) {
    if (block.dataset.ready) return;
    var pre = $('pre', block), codeEl = $('code', pre);
    var raw = codeEl.textContent.replace(/^\n+|\s+$/g, '');
    var lang = block.dataset.lang || 'text';
    codeEl.innerHTML = highlight(raw, lang);
    var head = document.createElement('div');
    head.className = 'code-head';
    var label = block.dataset.file || ({ python: 'Python', bash: 'Shell', powershell: 'PowerShell' }[lang] || lang);
    head.innerHTML = '<span class="code-label">' + esc(label) + '</span><button type="button" class="copy-btn" aria-label="Copy code">Copy</button>';
    block.insertBefore(head, pre);
    $('.copy-btn', head).addEventListener('click', function (e) { var b = e.currentTarget; copyText(raw, function (ok) { flashCopied(b, ok); }); });
    block.dataset.ready = '1';
  }
  $$('.code').forEach(decorateCode);

  $$('.cmd').forEach(function (c) {
    $('.copy-btn', c).addEventListener('click', function (e) {
      var b = e.currentTarget; copyText(c.dataset.copy, function (ok) { flashCopied(b, ok); });
    });
  });

  /* ------------------------------------------------------------------ theme */
  var root = document.documentElement;
  function currentTheme() {
    var t = root.getAttribute('data-theme');
    if (t) return t;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  $('#theme-btn').addEventListener('click', function () {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('mma_theme', next); } catch (e) {}
  });

  /* --------------------------------------------------------- mobile sidebar */
  var sidebar = $('#sidebar'), menuBtn = $('#menu-btn'), scrim = $('#scrim');
  function setMenu(open) {
    sidebar.classList.toggle('open', open);
    scrim.hidden = !open;
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  menuBtn.addEventListener('click', function () { setMenu(!sidebar.classList.contains('open')); });
  scrim.addEventListener('click', function () { setMenu(false); });
  sidebar.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });

  /* ------------------------------------------------------------------- tabs */
  function activateTab(tab, focus) {
    var list = tab.parentElement;
    $$('[role="tab"]', list).forEach(function (t) {
      var sel = t === tab;
      t.setAttribute('aria-selected', sel ? 'true' : 'false');
      t.tabIndex = sel ? 0 : -1;
      var p = document.getElementById(t.getAttribute('aria-controls'));
      if (p) p.hidden = !sel;
    });
    if (focus) tab.focus();
  }
  $$('[data-tabs] [role="tablist"]').forEach(function (list) {
    list.addEventListener('click', function (e) { var t = e.target.closest('[role="tab"]'); if (t) activateTab(t); });
    list.addEventListener('keydown', function (e) {
      var tabs = $$('[role="tab"]', list), i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      var n = null;
      if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
      else if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') n = tabs[0];
      else if (e.key === 'End') n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); activateTab(n, true); }
    });
  });

  /* -------------------------------------------------------- overlay manager */
  var overlayStack = [];
  function focusables(el) {
    return $$('a[href], button:not([disabled]), input, select, textarea, summary, [tabindex]:not([tabindex="-1"])', el)
      .filter(function (n) { return n.offsetParent !== null; });
  }
  function openOverlay(ov, focusEl) {
    ov.classList.remove('closing');
    ov.hidden = false;
    overlayStack.push({ el: ov, returnTo: document.activeElement });
    document.body.style.overflow = 'hidden';
    setTimeout(function () { (focusEl || focusables(ov)[0] || ov).focus(); }, 0);
  }
  function closeOverlay(ov) {
    var idx = -1;
    overlayStack.forEach(function (o, i) { if (o.el === ov) idx = i; });
    if (idx < 0) return;
    var rec = overlayStack.splice(idx, 1)[0];
    function done() {
      ov.hidden = true; ov.classList.remove('closing');
      if (!overlayStack.length) document.body.style.overflow = '';
      if (rec.returnTo && rec.returnTo.focus && document.contains(rec.returnTo)) rec.returnTo.focus();
    }
    if (reduceMotion) done(); else { ov.classList.add('closing'); setTimeout(done, 140); }
  }
  document.addEventListener('keydown', function (e) {
    var top = overlayStack[overlayStack.length - 1];
    if (!top) return;
    if (e.key === 'Escape') { e.preventDefault(); closeOverlay(top.el); }
    else if (e.key === 'Tab') {
      var f = focusables(top.el);
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (!top.el.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    }
  });
  $$('.overlay').forEach(function (ov) {
    ov.addEventListener('mousedown', function (e) { if (e.target === ov) closeOverlay(ov); });
  });

  /* ------------------------------------------------------------ API reference */
  var API = window.API_DATA || [];
  var apiById = {};
  API.forEach(function (a) { apiById[a.id] = a; });
  var apiList = $('#api-list'), apiFilter = $('#api-filter'), apiCount = $('#api-count');
  function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function fullName(a) { return a.cls ? a.cls + '.' + a.name : a.name; }

  function renderApi(filter) {
    var q = (filter || '').trim().toLowerCase();
    var groups = [], map = {}, shown = 0;
    API.forEach(function (a) {
      if (q && (fullName(a) + ' ' + a.summary + ' ' + a.group).toLowerCase().indexOf(q) < 0) return;
      if (!map[a.group]) { map[a.group] = []; groups.push(a.group); }
      map[a.group].push(a); shown++;
    });
    if (!shown) { apiList.innerHTML = '<div class="api-empty">No API entry matches "' + esc(filter) + '".</div>'; }
    else {
      apiList.innerHTML = groups.map(function (g) {
        return '<div class="api-group"><h3 id="api-' + slug(g) + '">' + esc(g) + '</h3>' +
          map[g].map(function (a) {
            return '<button type="button" class="api-row" data-id="' + esc(a.id) + '" aria-haspopup="dialog">' +
              '<span class="api-name">' + esc(a.name) + '</span><span class="api-sum">' + esc(a.summary) + '</span></button>';
          }).join('') + '</div>';
      }).join('');
    }
    apiCount.textContent = q ? shown + ' of ' + API.length + ' entries' : API.length + ' entries';
  }
  renderApi('');
  apiFilter.addEventListener('input', function () { renderApi(apiFilter.value); });
  apiList.addEventListener('click', function (e) { var b = e.target.closest('.api-row'); if (b) openApi(b.dataset.id); });

  var apiOv = $('#api-overlay');
  $('#api-modal-close').addEventListener('click', function () { closeOverlay(apiOv); });
  function openApi(id) {
    var a = apiById[id]; if (!a) return;
    $('#api-modal-group').textContent = a.group;
    $('#api-modal-title').textContent = fullName(a);
    var html = '<p>' + esc(a.summary) + '</p>' +
      '<h4>Signature</h4><div class="code sig" data-lang="python"><pre><code>' + esc(a.sig) + '</code></pre></div>';
    if (a.params && a.params.length) {
      html += '<h4>Parameters</h4><div class="table-wrap"><table class="doc-table"><thead><tr><th>Name</th><th>Type</th><th>Default</th><th>Description</th></tr></thead><tbody>' +
        a.params.map(function (p) {
          return '<tr><td><code>' + esc(p[0]) + '</code></td><td>' + esc(p[1]) + '</td><td>' + (p[2] ? '<code>' + esc(p[2]) + '</code>' : '') + '</td><td>' + esc(p[3]) + '</td></tr>';
        }).join('') + '</tbody></table></div>';
    }
    html += '<h4>Returns</h4><p>' + esc(a.returns) + '</p>';
    if (a.example) html += '<h4>Example</h4><div class="code" data-lang="python"><pre><code>' + esc(a.example) + '</code></pre></div>';
    var body = $('#api-modal-body'); body.innerHTML = html; body.scrollTop = 0;
    $$('.code', body).forEach(decorateCode);
    openOverlay(apiOv, $('#api-modal-close'));
  }

  /* ----------------------------------------------------------- search palette */
  var sOv = $('#search-overlay'), sInput = $('#search-input'), sList = $('#search-results');
  var isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  $('#search-kbd').textContent = isMac ? '⌘ K' : 'Ctrl K';

  var searchIndex = [];
  $$('main section[id]').forEach(function (sec) {
    searchIndex.push({ kind: 'Section', title: sec.dataset.title || sec.id, hash: sec.id, text: '' });
    $$('h2[id], h3[id]', sec).forEach(function (h) {
      searchIndex.push({ kind: sec.dataset.title || 'Page', title: h.textContent.trim(), hash: h.id, text: '' });
    });
  });
  API.forEach(function (a) {
    searchIndex.push({ kind: 'API', title: fullName(a), hash: 'api', api: a.id, text: a.summary, mono: true });
  });
  var results = [], active = 0;

  function score(item, terms) {
    var t = item.title.toLowerCase(), s = 0;
    for (var i = 0; i < terms.length; i++) {
      var w = terms[i];
      if (t === w) s += 12;
      else if (t.indexOf(w) === 0) s += 8;
      else if (t.indexOf('.' + w) >= 0 || t.indexOf(' ' + w) >= 0) s += 6;
      else if (t.indexOf(w) >= 0) s += 4;
      else if (item.text && item.text.toLowerCase().indexOf(w) >= 0) s += 1;
      else return 0;
    }
    return s;
  }
  function renderResults() {
    if (!results.length) { sList.innerHTML = '<li class="r-empty" role="option" aria-selected="false">No results</li>'; return; }
    sList.innerHTML = results.map(function (r, i) {
      return '<li role="option" id="sr-' + i + '" data-i="' + i + '" aria-selected="' + (i === active) + '">' +
        '<span class="r-title' + (r.mono ? ' mono' : '') + '">' + esc(r.title) + '</span><span class="r-meta">' + esc(r.kind) + '</span></li>';
    }).join('');
    sInput.setAttribute('aria-activedescendant', 'sr-' + active);
    var el = $('#sr-' + active); if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
  }
  function runSearch() {
    var q = sInput.value.trim().toLowerCase();
    if (!q) {
      results = searchIndex.filter(function (i) { return i.kind === 'Section'; });
    } else {
      var terms = q.split(/\s+/);
      results = searchIndex.map(function (i) { return { i: i, s: score(i, terms) }; })
        .filter(function (x) { return x.s > 0; })
        .sort(function (a, b) { return b.s - a.s; })
        .slice(0, 14).map(function (x) { return x.i; });
    }
    active = 0; renderResults();
  }
  function choose(r) {
    if (!r) return;
    closeOverlay(sOv);
    setTimeout(function () {
      var target = document.getElementById(r.hash);
      if (target) { history.pushState(null, '', '#' + r.hash); target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' }); }
      if (r.api) setTimeout(function () { openApi(r.api); }, 200);
    }, 150);
  }
  function openSearch() {
    setMenu(false);
    sInput.value = ''; runSearch(); openOverlay(sOv, sInput);
  }
  $('#search-btn').addEventListener('click', openSearch);
  sInput.addEventListener('input', runSearch);
  sInput.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (results.length) { active = (active + 1) % results.length; renderResults(); } }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (results.length) { active = (active - 1 + results.length) % results.length; renderResults(); } }
    else if (e.key === 'Enter') { e.preventDefault(); choose(results[active]); }
  });
  sList.addEventListener('click', function (e) { var li = e.target.closest('li[data-i]'); if (li) choose(results[+li.dataset.i]); });
  sList.addEventListener('mousemove', function (e) {
    var li = e.target.closest('li[data-i]');
    if (li && +li.dataset.i !== active) { active = +li.dataset.i; $$('li', sList).forEach(function (n, i) { n.setAttribute('aria-selected', i === active); }); }
  });
  document.addEventListener('keydown', function (e) {
    var typing = /^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement || {}).tagName || '');
    if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (overlayStack.some(function (o) { return o.el === sOv; })) closeOverlay(sOv); else if (!overlayStack.length) openSearch();
    } else if (e.key === '/' && !typing && !overlayStack.length && !e.ctrlKey && !e.metaKey) {
      e.preventDefault(); openSearch();
    }
  });

  /* ----------------------------------------------------------- image viewer */
  var imgOv = $('#image-overlay');
  $('#gallery').addEventListener('click', function (e) {
    var t = e.target.closest('.thumb'); if (!t) return;
    var img = $('#image-full');
    img.src = t.dataset.full; img.alt = $('img', t).alt;
    $('#image-cap').textContent = t.dataset.cap;
    $('#image-orig').href = t.dataset.full;
    openOverlay(imgOv, $('#image-close'));
  });
  $('#image-close').addEventListener('click', function () { closeOverlay(imgOv); });

  /* --------------------------------------------------- navigation scroll-spy */
  var sections = $$('main section[id]');
  var navLinks = {};
  $$('.sidebar a').forEach(function (a) { navLinks[a.getAttribute('href').slice(1)] = a; });
  var tocList = $('#toc-list'), tocFor = null, tocLinks = [];

  function buildToc(sec) {
    if (tocFor === sec) return;
    tocFor = sec;
    var heads = $$('h2[id], h3[id], .api-group h3[id]', sec);
    var items = heads.map(function (h) { return { id: h.id, text: h.textContent.trim(), l3: h.tagName === 'H3' && !h.closest('.api-group'), el: h }; });
    if (!items.length) { tocList.innerHTML = ''; tocLinks = []; return; }
    tocList.innerHTML = items.map(function (it) {
      return '<li><a href="#' + it.id + '" class="' + (it.l3 ? 'l3' : '') + '">' + esc(it.text) + '</a></li>';
    }).join('');
    tocLinks = $$('a', tocList).map(function (a, i) { return { a: a, el: items[i].el }; });
  }
  var ticking = false;
  function spy() {
    ticking = false;
    var line = 120, current = sections[0];
    sections.forEach(function (s) { if (s.getBoundingClientRect().top <= line) current = s; });
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) current = sections[sections.length - 1];
    Object.keys(navLinks).forEach(function (k) { navLinks[k].classList.toggle('active', k === current.id); });
    var act = navLinks[current.id];
    if (act && sidebar.scrollHeight > sidebar.clientHeight) {
      var r = act.getBoundingClientRect(), sr = sidebar.getBoundingClientRect();
      if (r.top < sr.top + 20 || r.bottom > sr.bottom - 20) sidebar.scrollTop += r.top - sr.top - sr.height / 3;
    }
    buildToc(current);
    var cur = null;
    tocLinks.forEach(function (t) { if (t.el.getBoundingClientRect().top <= line + 10) cur = t; });
    tocLinks.forEach(function (t) { t.a.classList.toggle('active', t === cur); });
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(spy); } }, { passive: true });
  window.addEventListener('resize', spy);
  window.addEventListener('hashchange', function () {
    var el = document.getElementById(location.hash.slice(1));
    var panel = el && el.closest('[role="tabpanel"]');
    if (panel && panel.hidden) activateTab(document.getElementById(panel.getAttribute('aria-labelledby')));
  });
  spy();

  /* ----------------------------------------------------------- results explorer */
  var DATA = null, task = 'classification', dsId = null, sortKey = null, sortDir = 1;
  var tableEl = $('#results-table'), selectEl = $('#dataset-select');
  var LOWER_BETTER = { MAE: 1, MSE: 1, RMSE: 1, 'Davies-Bouldin': 1, 'Fit Time (s)': 1, 'Noise Points': 1 };

  var COUNT_COLS = { Components: 1, Clusters: 1, 'Noise Points': 1, Anomalies: 1 };
  function fmt(v, col) {
    if (v === null || v === undefined || (typeof v === 'number' && isNaN(v))) return 'n/a';
    if (typeof v !== 'number') return esc(v);
    if (COUNT_COLS[col] && Number.isInteger(v)) return String(v);
    return Math.abs(v) >= 100 ? v.toFixed(1) : v.toFixed(4);
  }
  function currentSet() { return DATA[task].filter(function (d) { return d.id === dsId; })[0]; }
  function renderTable() {
    var ds = currentSet(); if (!ds) return;
    var cols = Object.keys(ds.table[0]);
    var best = ds.table[0].Model;
    var rows = ds.table.slice();
    if (sortKey) {
      rows.sort(function (a, b) {
        var x = a[sortKey], y = b[sortKey];
        if (typeof x === 'string' || typeof y === 'string') return String(x).localeCompare(String(y)) * sortDir;
        x = x == null ? -Infinity : x; y = y == null ? -Infinity : y;
        return (x - y) * sortDir;
      });
    }
    tableEl.innerHTML = '<thead><tr>' + cols.map(function (c) {
      var s = c === sortKey ? ' aria-sort="' + (sortDir > 0 ? 'ascending' : 'descending') + '"' : '';
      return '<th scope="col" tabindex="0" data-col="' + esc(c) + '"' + s + '>' + esc(c) + (c === sortKey ? (sortDir > 0 ? ' ↑' : ' ↓') : '') + '</th>';
    }).join('') + '</tr></thead><tbody>' + rows.map(function (r) {
      return '<tr' + (r.Model === best ? ' class="best"' : '') + '>' + cols.map(function (c) {
        return typeof r[c] === 'string' ? '<td>' + esc(r[c]) + '</td>' : '<td class="num">' + fmt(r[c], c) + '</td>';
      }).join('') + '</tr>';
    }).join('') + '</tbody>';
    var info = ds.title + ' · ' + (ds.kind ? ds.kind + ' · ' : '') + ds.rows.toLocaleString() + ' rows × ' + ds.features + ' features' +
      (ds.classes ? ' · ' + ds.classes + ' classes' : '') + (ds.train ? ' · train ' + ds.train.toLocaleString() + ' / test ' + ds.test.toLocaleString() : '') +
      ' · ' + ds.seconds + ' s for all models' + (ds.unit ? ' · target: ' + ds.unit : '');
    $('#dataset-info').textContent = info;
    $('#console-out').textContent = ds.console.replace(/\s+$/, '');
  }
  function setTask(t) {
    task = t; sortKey = null; sortDir = 1;
    $$('#task-switch button').forEach(function (b) {
      var on = b.dataset.task === t; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1;
    });
    selectEl.innerHTML = DATA[t].map(function (d) { return '<option value="' + esc(d.id) + '">' + esc(d.title) + '</option>'; }).join('');
    dsId = DATA[t][0].id; selectEl.value = dsId; renderTable();
  }
  function initResults() {
    var m = DATA.meta;
    $('#run-meta').innerHTML = [
      ['package', m.package + ' ' + m.package_version], ['scikit-learn', m.scikit_learn], ['pandas', m.pandas], ['numpy', m.numpy], ['python', m.python],
      ['test_size', m.settings.test_size], ['scaled_data', m.settings.scaled_data ? 'True' : 'False'], ['random_state', m.settings.random_state]
    ].map(function (p) { return '<span class="chip">' + esc(p[0]) + ' <b>' + esc(p[1]) + '</b></span>'; }).join('');
    $('#task-switch').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b && b.dataset.task !== task) setTask(b.dataset.task); });
    selectEl.addEventListener('change', function () { dsId = selectEl.value; sortKey = null; sortDir = 1; renderTable(); });
    function sortBy(th) {
      var c = th.dataset.col; if (!c) return;
      if (sortKey === c) sortDir = -sortDir; else { sortKey = c; sortDir = LOWER_BETTER[c] || c === 'Model' ? 1 : -1; }
      renderTable();
      var again = $('th[data-col="' + c + '"]', tableEl); if (again) again.focus();
    }
    tableEl.addEventListener('click', function (e) { var th = e.target.closest('th'); if (th) sortBy(th); });
    tableEl.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('th')) { e.preventDefault(); sortBy(e.target); } });
    setTask('classification');
  }
  fetch('assets/data/results.json').then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (d) { DATA = d; initResults(); })
    .catch(function () {
      $('#dataset-info').textContent = 'The measured results could not be loaded. Serve this folder over http (for example python -m http.server) instead of opening the file directly.';
    });

  /* ---------------------------------------------------------------- calculator */
  var ids = ['tp', 'fp', 'fn', 'tn'];
  function num(id) { var v = parseFloat($('#c-' + id).value); return isFinite(v) && v > 0 ? v : 0; }
  function pct(n, d) { return d > 0 ? (n / d).toFixed(4) : 'n/a'; }
  function setOut(id, v) {
    var el = $('#o-' + id), box = el.parentElement;
    if (el.textContent !== v) { el.textContent = v; if (!reduceMotion) { box.classList.remove('pulse'); void box.offsetWidth; box.classList.add('pulse'); } }
  }
  function calc() {
    var tp = num('tp'), fp = num('fp'), fn = num('fn'), tn = num('tn'), total = tp + fp + fn + tn;
    var p = tp + fp > 0 ? tp / (tp + fp) : NaN, r = tp + fn > 0 ? tp / (tp + fn) : NaN;
    var f1 = isNaN(p) || isNaN(r) || p + r === 0 ? 'n/a' : (2 * p * r / (p + r)).toFixed(4);
    var den = Math.sqrt((tp + fp) * (tp + fn) * (tn + fp) * (tn + fn));
    setOut('acc', pct(tp + tn, total)); setOut('pre', pct(tp, tp + fp)); setOut('rec', pct(tp, tp + fn));
    setOut('spe', pct(tn, tn + fp)); setOut('f1', f1); setOut('mcc', den > 0 ? ((tp * tn - fp * fn) / den).toFixed(4) : 'n/a');
    $('#calc-note').textContent = total ? 'Total samples: ' + total.toLocaleString() + '. "n/a" means the denominator is zero.' : 'Enter at least one count.';
  }
  ids.forEach(function (i) { $('#c-' + i).addEventListener('input', calc); });
  calc();

  /* initial hash: open the right tab if the target sits in a hidden panel */
  if (location.hash) window.dispatchEvent(new Event('hashchange'));
})();
