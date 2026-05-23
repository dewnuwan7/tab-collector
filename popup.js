(() => {
  let allTabs = [];
  let checkedIds = new Set();

  const tabList      = document.getElementById('tabList');
  const selectAll    = document.getElementById('selectAll');
  const tabCount     = document.getElementById('tabCount');
  const selectedCount = document.getElementById('selectedCount');
  const copyBtn      = document.getElementById('copyBtn');
  const saveBtn      = document.getElementById('saveBtn');
  const toast        = document.getElementById('toast');

  // ── Load tabs ──────────────────────────────────────────────────────────────
  chrome.tabs.query({}, (tabs) => {
    allTabs = tabs;
    tabCount.textContent = `${tabs.length} tab${tabs.length !== 1 ? 's' : ''}`;
    tabList.innerHTML = '';

    if (tabs.length === 0) {
      tabList.innerHTML = '<div class="empty-state">No tabs found.</div>';
      return;
    }

    tabs.forEach((tab, i) => {
      const item = buildTabItem(tab, i);
      tabList.appendChild(item);
    });

    updateUI();
  });

  // ── Build tab row ──────────────────────────────────────────────────────────
  function buildTabItem(tab, index) {
    const item = document.createElement('div');
    item.className = 'tab-item';
    item.dataset.id = tab.id;
    item.style.animationDelay = `${index * 22}ms`;

    // Favicon
    let faviconEl;
    if (tab.favIconUrl && !tab.favIconUrl.startsWith('chrome://')) {
      faviconEl = document.createElement('img');
      faviconEl.className = 'tab-favicon';
      faviconEl.src = tab.favIconUrl;
      faviconEl.width = 16;
      faviconEl.height = 16;
      faviconEl.onerror = () => {
        faviconEl.replaceWith(placeholderFavicon());
      };
    } else {
      faviconEl = placeholderFavicon();
    }

    // Custom checkbox
    const check = document.createElement('div');
    check.className = 'tab-check';

    // Info
    const info = document.createElement('div');
    info.className = 'tab-info';

    const title = document.createElement('div');
    title.className = 'tab-title';
    title.textContent = tab.title || 'Untitled';
    title.title = tab.title || '';

    const url = document.createElement('div');
    url.className = 'tab-url';
    url.textContent = tab.url || '';
    url.title = tab.url || '';

    info.appendChild(title);
    info.appendChild(url);

    item.appendChild(check);
    item.appendChild(faviconEl);
    item.appendChild(info);

    // Active badge
    if (tab.active) {
      const badge = document.createElement('span');
      badge.className = 'tab-active-badge';
      badge.textContent = 'Active';
      item.appendChild(badge);
    }

    // Click handler
    item.addEventListener('click', () => {
      toggleTab(tab.id, item, check);
    });

    return item;
  }

  function placeholderFavicon() {
    const wrap = document.createElement('div');
    wrap.className = 'tab-favicon-placeholder';
    wrap.innerHTML = `<svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <rect x="1" y="1" width="8" height="8" rx="1.5" stroke="#3a3a45" stroke-width="1.5"/>
      <path d="M1 4h8" stroke="#3a3a45" stroke-width="1"/>
    </svg>`;
    return wrap;
  }

  // ── Toggle individual tab ──────────────────────────────────────────────────
  function toggleTab(id, item, check) {
    if (checkedIds.has(id)) {
      checkedIds.delete(id);
      item.classList.remove('checked');
    } else {
      checkedIds.add(id);
      item.classList.add('checked');
    }
    updateUI();
  }

  // ── Select All ─────────────────────────────────────────────────────────────
  selectAll.addEventListener('change', () => {
    const items = tabList.querySelectorAll('.tab-item');
    if (selectAll.checked) {
      allTabs.forEach(t => checkedIds.add(t.id));
      items.forEach(item => item.classList.add('checked'));
    } else {
      checkedIds.clear();
      items.forEach(item => item.classList.remove('checked'));
    }
    updateUI();
  });

  // ── Update UI state ────────────────────────────────────────────────────────
  function updateUI() {
    const count = checkedIds.size;
    const total = allTabs.length;

    // Selected count label
    selectedCount.textContent = `${count} selected`;
    selectedCount.classList.toggle('has-selection', count > 0);

    // Select-all checkbox state
    if (count === 0) {
      selectAll.checked = false;
      selectAll.indeterminate = false;
    } else if (count === total) {
      selectAll.checked = true;
      selectAll.indeterminate = false;
    } else {
      selectAll.checked = false;
      selectAll.indeterminate = true;
    }

    // Buttons
    copyBtn.disabled = count === 0;
    saveBtn.disabled = count === 0;
  }

  // ── Get selected URLs ──────────────────────────────────────────────────────
  function getSelectedUrls() {
    return allTabs
      .filter(t => checkedIds.has(t.id))
      .map(t => t.url)
      .filter(Boolean);
  }

  // ── Copy ───────────────────────────────────────────────────────────────────
  copyBtn.addEventListener('click', async () => {
    const urls = getSelectedUrls();
    if (!urls.length) return;

    try {
      await navigator.clipboard.writeText(urls.join('\n'));
      showToast(`✓ Copied ${urls.length} link${urls.length !== 1 ? 's' : ''}`);
    } catch {
      // Fallback for older Chrome
      const ta = document.createElement('textarea');
      ta.value = urls.join('\n');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      showToast(`✓ Copied ${urls.length} link${urls.length !== 1 ? 's' : ''}`);
    }
  });

  // ── Save ───────────────────────────────────────────────────────────────────
  saveBtn.addEventListener('click', () => {
    const urls = getSelectedUrls();
    if (!urls.length) return;

    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    //const header = `Tab Collector Export — ${now.toLocaleString()}\n${'─'.repeat(50)}\n\n`;
    const content = urls.join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `tabs-${timestamp}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    showToast(`✓ Saved ${urls.length} link${urls.length !== 1 ? 's' : ''} to .txt`);
  });

  // ── Toast ──────────────────────────────────────────────────────────────────
  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }
})();
