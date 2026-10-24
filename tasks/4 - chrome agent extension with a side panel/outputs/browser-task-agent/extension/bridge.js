(() => {
  const existingNonce = globalThis.__BROWSER_TASK_AGENT_DOCUMENT_NONCE__ || globalThis.__SHOPEE_AGENT_DOCUMENT_NONCE__;
  const documentNonce = String(existingNonce || `doc-${globalThis.performance?.timeOrigin || Math.random().toString(36).slice(2)}`).slice(0, 200);
  if (!existingNonce) { try { globalThis.__BROWSER_TASK_AGENT_DOCUMENT_NONCE__ = documentNonce; } catch {} }
  const state = { nonce: documentNonce, seq: 0, registry: new Map(), lastSnapshot: null };
  const clean = (value, max = 300) => String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, max);
  const labelOf = (el) => clean(el?.getAttribute?.('aria-label') || el?.innerText || el?.textContent || el?.getAttribute?.('placeholder') || el?.name || '');
  const fingerprint = (el, label, href) => [el?.tagName, el?.getAttribute?.('type') || '', label, href || ''].join('|').slice(0, 500);
  const localContext = (el) => clean(el?.closest?.('form,section,article,main,li,[role="dialog"]')?.innerText || el?.parentElement?.innerText || '', 500);
  const sensitiveContext = (el, label, context) => /password|otp|one[- ]time|verification|verify|card|cvv|billing|payment|checkout|buy\s*now|confirm\s*order|order\s*confirmation|login|sign\s*in|identity|address|contact|phone|mobile|email/i.test(`${label} ${el?.name || ''} ${el?.id || ''} ${el?.getAttribute?.('autocomplete') || ''} ${context}`);
  const autocompleteSensitive = (el) => /current-password|new-password|one-time-code|cc-|name|email|tel|address|street|postal|country|organization/i.test(el?.getAttribute?.('autocomplete') || '');
  const nativeDialogControl = (el, inputType) => inputType === 'file' || el?.getAttribute?.('role') === 'file';
  const enabledOf = (el) => !el?.disabled && el?.getAttribute?.('aria-disabled') !== 'true';
  const inViewportOf = (el) => { try { const r = el.getBoundingClientRect(); const style = globalThis.getComputedStyle?.(el); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth && style?.display !== 'none' && style?.visibility !== 'hidden'; } catch { return false; } };
  const publicControl = (label, href, role, inputType, sensitive, sameOrigin, nativeDialog) => !sensitive && !nativeDialog && sameOrigin && (role === 'button' || role === 'textbox' || (role === 'link' && !/delete|remove|checkout|payment|login|sign\s*in/i.test(label)));
  const productCard = (root, anchor, index) => {
    const raw = clean(root?.innerText || anchor?.innerText || '');
    const href = anchor?.href || '';
    const lines = raw.split(/\n| {2,}/).map((x) => clean(x, 160)).filter(Boolean);
    const price = lines.find((x) => /(?:RM|MYR|₱|฿|Rp|₫)\s*[\d,.]+|[\d,.]+\s*(?:RM|MYR)/i.test(x)) || '';
    const label = clean(anchor?.getAttribute?.('aria-label') || lines.find((x) => x !== price && x.length > 2) || anchor?.textContent || '', 240);
    const variants = [...(root?.querySelectorAll?.('[role="option"],button,[aria-pressed="true"],[aria-selected="true"]') || [])].map((el, i) => ({ id: clean(el.getAttribute?.('data-option-id') || el.id || `variant-${i}`, 100), label: labelOf(el, 160), renderedEvidence: clean(el.getAttribute?.('aria-selected') || el.getAttribute?.('aria-pressed') || 'rendered') })).filter((v) => v.label).slice(0, 24);
    return { itemId: clean(anchor?.getAttribute?.('data-product-id') || root?.getAttribute?.('data-product-id') || href || `rendered-${index}`, 160), label, href, priceText: clean(price, 120), currencyText: /MYR|RM/i.test(price) ? 'MYR' : clean((price.match(/[A-Z₱฿₫]+/i) || [''])[0], 20), variants, fingerprint: clean(`${href}|${label}|${price}`, 500) };
  };
  function observe(intent = '') {
    const doc = globalThis.document; const pageUrl = globalThis.location?.href || '';
    if (!doc?.body) return { documentNonce: state.nonce, snapshotId: 'empty', url: pageUrl, title: doc?.title || '', text: '', targets: [], productCards: [], selectedOptions: [], quantityEvidence: null, cartEvidence: { fingerprint: 'empty', messages: [] }, contentFingerprint: 'empty' };
    state.registry = new Map(); const targets = []; let index = 0;
    const pageContext = clean(`${doc.title || ''} ${doc.body.innerText || ''}`, 700);
    const els = [...doc.querySelectorAll('a[href],button,input,textarea,[role="button"],[role="link"],[role="option"]')].slice(0, 120);
    for (const el of els) {
      const type = el.getAttribute('type') || ''; const label = labelOf(el); const role = el.tagName === 'A' || el.getAttribute('role') === 'link' ? 'link' : el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' ? 'textbox' : 'button';
      const context = localContext(el); const sensitive = ['password', 'hidden'].includes(type) || sensitiveContext(el, label, context); const href = el.tagName === 'A' ? el.href : ''; const fp = fingerprint(el, label, href);
      if (!label && role !== 'textbox') continue;
      const sameOrigin = !href || (() => { try { return new URL(href, location.href).origin === location.origin; } catch { return false; } })();
      const nativeDialog = nativeDialogControl(el, type); const enabled = enabledOf(el); const inViewport = inViewportOf(el); const targetId = `t${++index}`; const target = { targetId, role, label, tag: el.tagName, inputType: type, href, fingerprint: fp, actionable: !sensitive && !nativeDialog && enabled, enabled, sensitive, sensitiveContext: sensitive, nativeDialog, autocompleteSensitive: autocompleteSensitive(el), context, sameOrigin, opensNewTab: el.target === '_blank', publicControl: publicControl(label, href, role, type, sensitive, sameOrigin, nativeDialog), publicShoppingControl: publicControl(label, href, role, type, sensitive, sameOrigin, nativeDialog) || /add\s*(?:to\s*)?cart|加入购物车/i.test(label), cartRole: /add\s*(?:to\s*)?cart|加入购物车/i.test(label) ? 'add-to-cart' : undefined, inViewport };
      state.registry.set(targetId, { el, fingerprint: fp }); targets.push(target);
    }
    const anchors = [...doc.querySelectorAll('a[href*="/product/"],a[href*="/Product/"]')].slice(0, 40); const seen = new Set(); const productCards = anchors.map((a, i) => { const root = a.closest?.('[data-sqe="item"],[data-testid*="product"],article,li') || a; return productCard(root, a, i); }).filter((p) => { const k = `${p.href}|${p.label}`; if (seen.has(k) || !p.label || !p.href || !p.priceText) return false; seen.add(k); return true; });
    const selectedOptions = [...doc.querySelectorAll('[aria-selected="true"],[aria-pressed="true"],input:checked,[data-selected="true"]')].map((el, i) => ({ id: clean(el.getAttribute?.('data-option-id') || el.id || `selected-${i}`, 100), label: labelOf(el, 160), renderedEvidence: 'selected' })).filter((x) => x.label).slice(0, 24);
    const quantityEl = doc.querySelector('input[name*="quantity" i],input[name*="qty" i],input[aria-label*="quantity" i],input[aria-label*="qty" i]'); const quantityEvidence = quantityEl && /^\d+$/.test(quantityEl.value || '') ? { value: Number(quantityEl.value), source: 'rendered quantity control' } : null;
    const cartMessages = [...doc.querySelectorAll('[data-testid*="cart" i],[class*="cart" i],[aria-label*="cart" i],[role="alert"]')].map(labelOf).filter(Boolean).slice(0, 20); const cartText = cartMessages.join('|');
    const text = clean(doc.body.innerText || '', 16000); const contentFingerprint = `${pageUrl}|${text.slice(0, 800)}|${targets.map((t) => t.fingerprint).join(',')}|${productCards.map((p) => p.fingerprint).join(',')}|${selectedOptions.map((o) => `${o.id}:${o.label}:${o.renderedEvidence}`).join(',')}|${quantityEvidence?.value ?? ''}|${cartText}`.slice(0, 1200); const snapshotId = `${state.nonce}|${contentFingerprint}`.slice(0, 200);
    const snapshot = { tabId: null, documentNonce: state.nonce, snapshotId, url: pageUrl, title: doc.title || '', text, truncated: (doc.body.innerText || '').length > 16000, targets, productCards, selectedOptions, quantityEvidence, cartEvidence: { fingerprint: `${cartText}|${cartMessages.length}`, messages: cartMessages }, contentFingerprint };
    state.lastSnapshot = snapshot; return snapshot;
  }
  function execute(command) {
    const entry = state.registry.get(command?.targetId);
    if (command?.type === 'observe') return { status: 'verified', evidence: ['observation refreshed'], nextSnapshot: observe() };
    if (command?.type === 'scroll') { const before = scrollY; scrollBy({ top: command.direction === 'up' ? -Math.min(command.pixels || 500, 1000) : Math.min(command.pixels || 500, 1000), behavior: 'instant' }); const changed = scrollY !== before; return { status: changed ? 'verified' : 'unknown', evidence: [changed ? 'viewport changed' : 'action sent; outcome unverified'], nextSnapshot: observe() }; }
    if (!entry?.el || fingerprint(entry.el, labelOf(entry.el), entry.el.href || '') !== entry.fingerprint || !entry.el.isConnected) return { status: 'blocked', evidence: ['target is stale or changed'] };
    const nativeDialog = nativeDialogControl(entry.el, entry.el.getAttribute?.('type') || '');
    if ((command.type === 'fill' || command.type === 'click') && nativeDialog) return { status: 'blocked', evidence: ['native file chooser controls require manual handling'] };
    if ((command.type === 'fill' || command.type === 'click') && (!enabledOf(entry.el) || !inViewportOf(entry.el))) return { status: 'blocked', evidence: ['target is not visibly rendered and enabled at dispatch'] };
    if (command.type === 'fill') { if (entry.el.type === 'password' || autocompleteSensitive(entry.el)) return { status: 'blocked', evidence: ['sensitive field blocked'] }; const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(entry.el), 'value')?.set; setter?.call(entry.el, command.value); if (!setter) entry.el.value = command.value; entry.el.dispatchEvent(new Event('input', { bubbles: true })); entry.el.dispatchEvent(new Event('change', { bubbles: true })); return { status: 'unknown', valueVerified: entry.el.value === command.value, evidence: entry.el.value === command.value ? ['requested value set; awaiting fresh observation'] : ['action sent; outcome unverified'] }; }
    if (command.type === 'click') { entry.el.click(); return { status: 'unknown', evidence: ['action sent; awaiting fresh post-action observation'] }; }
    return { status: 'blocked', evidence: ['unsupported command'] };
  }
  globalThis.__BROWSER_TASK_AGENT_BRIDGE__ = Object.freeze({ observe, execute });
  globalThis.__SHOPEE_AGENT_BRIDGE__ = globalThis.__BROWSER_TASK_AGENT_BRIDGE__;
})();
