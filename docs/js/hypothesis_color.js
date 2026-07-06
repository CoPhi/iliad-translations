/**
 * hypothesis_color.js — v9 «english UI» · GlauCo AI
 * =====================================================================
 * Behavior (Federico's specification):
 *   • 3x2 grid of fluo circles TO THE LEFT of «Annotate»:
 *     it is a SELECTOR, not an activator;
 *   • the chosen color stays set (dark ring + slight enlargement on the
 *     active circle; the choice persists in localStorage across
 *     sessions);
 *   • «Annotate» and «Highlight» both stay in their place and are the
 *     ONLY activators: pressing them, the annotation or the highlight
 *     is created by Hypothesis and colored with the set color;
 *   • CONVENTION: the color lives in an annotation TAG, in the form
 *     «#RRGGBB» (e.g. #FF9933). Backward compatibility: the old legacy
 *     first line «cat_color: #RRGGBB» is also read.
 *   • re-reading: local map {quote → color} + color tag via API
 *     (PUBLIC annotations are read without a token);
 *   • WRITING AT CREATION TIME (without a token!): the Hypothesis guest
 *     runs on THIS page and sends the annotation to the sidebar with a
 *     «createAnnotation» RPC over MessagePort. We intercept
 *     MessagePort.prototype.postMessage and inject the #RRGGBB tag into
 *     the object in transit: the annotation is BORN already with the
 *     tag, saved with the logged-in user's session. For Annotate, the
 *     tag appears precompiled in the sidebar editor.
 *   • READING ON REOPEN (without a token!): the sidebar, after login,
 *     sends the guest the «loadAnnotations» RPC with ALL annotations
 *     visible to the user (including private and group ones). We also
 *     intercept INCOMING messages and collect their #RRGGBB tags:
 *     recoloring happens as soon as the highlights are anchored. The
 *     apiToken remains optional (read-only, via API).
 *   • COLOR CHANGE = UPDATE: at creation time, any pre-existing color
 *     tags are REPLACED (never accumulated); the local map overwrites
 *     the entry for the same quote.
 *
 * Optional config (before this script):
 *   window.CAT_COLOR_CONFIG = { apiToken: "6879-...", group: "abc123" };
 */
(function () {
  "use strict";

  /* ------------------------------------------------------------------ */
  /* Configuration                                                      */
  /* ------------------------------------------------------------------ */

  const CFG = Object.assign(
    {
      apiUrl: "https://api.hypothes.is/api",
      apiToken: null,
      group: null,
      alpha: 0.5,
      storageKey: "catColorMap:" + location.pathname,
      selectedKey: "catColorSelected",
    },
    window.CAT_COLOR_CONFIG || {}
  );

  const PALETTE = [
    { name: "Ca.’s Venetian",  hex: "#FFFF33" },
    { name: "Ca.’s Tuscan", hex: "#FF9933" },
    { name: "Pope’s Eng",   hex: "#39FF14" },
    { name: "Ven2Eng Transl.", hex: "#00FFFF" },
    { name: "Tusc2Eng Transl.",    hex: "#FF6EC7" },
    { name: "Free Note",   hex: "#BF00FF" },
  ];

  const HL_SEL = "hypothesis-highlight, .hypothesis-highlight";
  const CAT_RE = /^\s*cat_color\s*:\s*(#[0-9A-Fa-f]{6})\s*$/; // legacy (first line)
  const TAG_RE = /^#[0-9A-Fa-f]{6}$/;                          // tag convention

  /* ------------------------------------------------------------------ */
  /* Utilities                                                          */
  /* ------------------------------------------------------------------ */

  const norm = s => (s || "").replace(/\s+/g, " ").trim();

  function hexToRgba(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
  }

  function paint(el, hex) {
    el.style.backgroundColor = hexToRgba(hex, CFG.alpha);
    el.dataset.catColor = hex;
    el.title = `cat_color: ${hex}`;
  }

  function lsGet(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  }
  function lsSet(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); }
    catch (e) { console.warn("[cat-color] localStorage:", e); }
  }

  /* ------------------------------------------------------------------ */
  /* State                                                              */
  /* ------------------------------------------------------------------ */

  let colorMap = lsGet(CFG.storageKey, {});          // {quote → hex}
  // per-browser token (entered once by the user, never in the HTML)
  if (!CFG.apiToken) CFG.apiToken = lsGet("catColorToken", null);
  let currentColor = lsGet(CFG.selectedKey, PALETTE[0].hex);
  let pending = null;                                // { hex, t } for new highlights

  /* ------------------------------------------------------------------ */
  /* RPC interceptor: tag injected AT ANNOTATION CREATION TIME           */
  /* ------------------------------------------------------------------ */
  // The guest (on this page) sends messages of the form
  // { method: "createAnnotation", arguments: [annotation], ... } to the
  // sidebar over a MessagePort. We patch the prototype: method
  // resolution is dynamic, so this works even if the client is already
  // loaded.
  (function interceptCreateAnnotation() {
    const orig = MessagePort.prototype.postMessage;
    MessagePort.prototype.postMessage = function (msg, ...rest) {
      try {
        if (msg && msg.method === "createAnnotation" &&
            Array.isArray(msg.arguments)) {
          const ann = msg.arguments[0];
          if (ann && typeof ann === "object") {
            const tags = Array.isArray(ann.tags) ? ann.tags : [];
            // update, don't append: only one color tag per annotation
            ann.tags = tags.filter(t => !TAG_RE.test(t)).concat(currentColor);
            console.info("[cat-color] tag injected at creation:", currentColor);
            // immediate local memory for recoloring
            const q = quoteOf(ann);
            if (q) { colorMap[q] = currentColor; lsSet(CFG.storageKey, colorMap); }
          }
        }
      } catch (e) { /* never block the RPC */ }
      return orig.call(this, msg, ...rest);
    };
  })();

  /* ------------------------------------------------------------------ */
  /* Incoming interceptor: harvesting tags from «loadAnnotations»       */
  /* ------------------------------------------------------------------ */
  // The sidebar sends the guest the annotations to anchor (including
  // the logged-in user's private/group ones): this is the perfect
  // source for recoloring on reopen, without any API or token.
  function harvestList(anns) {
    let changed = false;
    for (const ann of anns) {
      if (!ann || typeof ann !== "object") continue;
      const tag = (ann.tags || []).find(t => TAG_RE.test(t));
      const q = tag && quoteOf(ann);
      if (q && colorMap[q] !== tag.toUpperCase()) {
        colorMap[q] = tag.toUpperCase();
        changed = true;
        console.info("[cat-color] tag read", tag, "for:", q.slice(0, 40) + "…");
      }
    }
    if (changed) {
      lsSet(CFG.storageKey, colorMap);
      // highlights are anchored right after: a few short passes
      [300, 1000, 2500].forEach(ms => setTimeout(recolorAll, ms));
    }
  }

  // agnostic about the RPC name: harvests from any message objects
  // that "look like" annotations (they have a target and tags)
  function harvest(data) {
    if (!data || !Array.isArray(data.arguments)) return;
    for (const arg of data.arguments) {
      if (Array.isArray(arg)) {
        harvestList(arg.filter(a => a && a.target));
      } else if (arg && typeof arg === "object" && arg.target && arg.tags) {
        harvestList([arg]);
      }
    }
  }

  (function interceptIncoming() {
    const origAdd = MessagePort.prototype.addEventListener;
    MessagePort.prototype.addEventListener = function (type, listener, ...rest) {
      if (type === "message" && typeof listener === "function") {
        const wrapped = function (ev) {
          try { harvest(ev.data); } catch (e) { /* transparent */ }
          return listener.call(this, ev);
        };
        return origAdd.call(this, type, wrapped, ...rest);
      }
      return origAdd.call(this, type, listener, ...rest);
    };
    // also covers direct assignment port.onmessage = ...
    const desc = Object.getOwnPropertyDescriptor(MessagePort.prototype, "onmessage");
    if (desc && desc.set) {
      Object.defineProperty(MessagePort.prototype, "onmessage", {
        get: desc.get,
        set(fn) {
          desc.set.call(this, typeof fn === "function"
            ? ev => { try { harvest(ev.data); } catch (e) {} return fn.call(this, ev); }
            : fn);
        },
        configurable: true,
      });
    }
  })();

  /* ------------------------------------------------------------------ */
  /* Recoloring of existing highlights                                  */
  /* ------------------------------------------------------------------ */

  function recolorAll() {
    const quotes = Object.keys(colorMap);
    if (!quotes.length) return;
    document.querySelectorAll(HL_SEL).forEach(el => {
      if (el.dataset.catColor) return;
      const t = norm(el.textContent);
      if (!t) return;
      let best = null;
      for (const q of quotes) {
        if (q.indexOf(t) !== -1 && (!best || q.length > best.length)) best = q;
      }
      if (best) paint(el, colorMap[best]);
    });
  }

  /* ------------------------------------------------------------------ */
  /* API                                                                */
  /* ------------------------------------------------------------------ */

  async function apiFetch(path, opts = {}) {
    const headers = Object.assign(
      { Accept: "application/json" }, opts.headers || {});
    if (CFG.apiToken) headers.Authorization = "Bearer " + CFG.apiToken;
    const res = await fetch(CFG.apiUrl + path, Object.assign({}, opts, { headers }));
    if (!res.ok) throw new Error("API " + res.status);
    return res.json();
  }

  function quoteOf(ann) {
    const tq = ((ann.target || [])[0]?.selector || [])
      .find(s => s.type === "TextQuoteSelector");
    return tq ? norm(tq.exact) : null;
  }

  async function syncWithApi() {
    try {
      const uri = location.href.split("#")[0];
      const params = new URLSearchParams({ uri, limit: "200" });
      if (CFG.group) params.set("group", CFG.group);
      const data = await apiFetch("/search?" + params);
      const rows = data.rows || [];
      let changed = false;

      // 1) reading: «#RRGGBB» color tag (or, legacy, first-line cat_color)
      for (const ann of rows) {
        const tag = (ann.tags || []).find(t => TAG_RE.test(t));
        const m = tag
          ? [null, tag]
          : (ann.text || "").split(/\r?\n/, 1)[0].match(CAT_RE);
        if (!m) continue;
        const q = quoteOf(ann);
        if (q && colorMap[q] !== m[1].toUpperCase()) {
          colorMap[q] = m[1].toUpperCase();
          changed = true;
        }
      }


      if (changed) lsSet(CFG.storageKey, colorMap);
      console.info("[cat-color] API sync:", rows.length, "annotations,",
        Object.keys(colorMap).length, "colors in map");
      recolorAll();
    } catch (e) {
      console.warn("[cat-color] API sync failed:", e,
        "(401 = missing/wrong token; without a token only public annotations are readable)");
    }
  }

  /* ------------------------------------------------------------------ */
  /* Coloring of new highlights (after Annotate/Highlight)              */
  /* ------------------------------------------------------------------ */

  const newHlObserver = new MutationObserver(muts => {
    if (!pending || Date.now() - pending.t > 4000) return;
    for (const m of muts) {
      for (const n of m.addedNodes) {
        if (n.nodeType !== 1) continue;
        const els = n.matches?.(HL_SEL)
          ? [n]
          : [...(n.querySelectorAll?.(HL_SEL) || [])];
        els.forEach(el => paint(el, pending.hex));
      }
    }
  });

  /* ------------------------------------------------------------------ */
  /* UI inside the adder: selector to the left of Annotate               */
  /* ------------------------------------------------------------------ */

  const ADDER_CSS = `
    .cat-grid {
      display: grid;
      grid-template-columns: repeat(3, 18px);
      grid-auto-rows: 18px;
      gap: 6px;
      align-content: center;
      justify-content: center;
      padding: 6px 8px 6px 10px;
      align-self: stretch;
      border-right: 1px solid rgba(0,0,0,.12);
    }
    .cat-swatch {
      width: 18px; height: 18px;
      border-radius: 50%;
      border: 1.5px solid rgba(0,0,0,.25);
      cursor: pointer;
      padding: 0;
      transition: transform .12s ease, box-shadow .12s ease;
    }
    .cat-swatch:hover { transform: scale(1.2); }
    .cat-swatch:focus-visible { outline: 2px solid #333; }
    .cat-swatch.selected {
      transform: scale(1.2);
      box-shadow: 0 0 0 2.5px #333;
    }
    @media (prefers-reduced-motion: reduce) { .cat-swatch { transition: none; } }
  `;

  const isAnnotateBtn = b => /annotate/i.test(b.textContent || "");
  const isHighlightBtn = b => /highlight/i.test(b.textContent || "");
  const isSwatch = b => b.classList && b.classList.contains("cat-swatch");

  function refreshSelection(root) {
    root.querySelectorAll(".cat-swatch").forEach(b => {
      b.classList.toggle("selected", b.dataset.hex === currentColor);
    });
  }

  function buildGrid(root) {
    const grid = document.createElement("div");
    grid.className = "cat-grid";
    PALETTE.forEach(({ name, hex }) => {
      const b = document.createElement("button");
      b.className = "cat-swatch";
      b.type = "button";
      b.dataset.hex = hex;
      b.style.backgroundColor = hex;
      b.title = name + " " + hex;
      // no default mousedown: it must NOT clear the text selection
      b.addEventListener("mousedown", ev => ev.preventDefault());
      b.addEventListener("click", ev => {
        ev.stopPropagation();
        ev.preventDefault();
        currentColor = hex;
        lsSet(CFG.selectedKey, currentColor);
        refreshSelection(root);
      });
      grid.appendChild(b);
    });
    return grid;
  }

  /** Idempotent: inserts the grid BEFORE Annotate on every render. */
  function ensureGrid(root) {
    const annotateBtn = [...root.querySelectorAll("button")]
      .find(b => isAnnotateBtn(b) && !isSwatch(b));
    if (!annotateBtn) return;
    const row = annotateBtn.parentElement;
    if (row.querySelector(".cat-grid")) { refreshSelection(root); return; }
    row.insertBefore(buildGrid(root), annotateBtn);
    refreshSelection(root);
  }

  function hookAdder(adder) {
    const root = adder.shadowRoot;
    if (!root || adder.dataset.catColorHooked) return;
    adder.dataset.catColorHooked = "1";

    const style = document.createElement("style");
    style.textContent = ADDER_CSS;
    root.appendChild(style);

    ensureGrid(root);
    new MutationObserver(() => ensureGrid(root))
      .observe(root, { childList: true, subtree: true });

    // Annotate and Highlight are the only activators: on their click
    // we record the current color + quote, without interfering.
    root.addEventListener(
      "click",
      ev => {
        const btn = ev.composedPath().find(
          n => n.nodeType === 1 && n.tagName === "BUTTON");
        if (!btn || isSwatch(btn)) return;
        if (!isAnnotateBtn(btn) && !isHighlightBtn(btn)) return;
        const quote = norm(String(window.getSelection() || ""));
        pending = { hex: currentColor, t: Date.now() };
        if (quote) {
          colorMap[quote] = currentColor;
          lsSet(CFG.storageKey, colorMap);
          setTimeout(syncWithApi, 2500); // re-reads/confirms from the server
        }
      },
      true
    );
  }

  function watchAdder() {
    const tryHook = () => {
      const adder = document.querySelector("hypothesis-adder");
      if (adder && adder.shadowRoot) { hookAdder(adder); return true; }
      return false;
    };
    if (tryHook()) return;
    new MutationObserver(tryHook)
      .observe(document.documentElement, { childList: true, subtree: true });
  }

  /* ------------------------------------------------------------------ */
  /* Startup                                                            */
  /* ------------------------------------------------------------------ */

  function buildTokenChip() {
    const chip = document.createElement("button");
    chip.id = "cat-color-token-chip";
    chip.type = "button";
    const setFace = () => {
      chip.textContent = CFG.apiToken ? "\u{1F3A8}\u2713" : "\u{1F3A8}\u2699";
      chip.title = (CFG.apiToken
        ? "cat-color: API token set (click to change or remove it"
        : "cat-color: click to enter your Hypothesis API token, needed to re-read colors of private/group annotations")
        + "; double-click to hide this button until reload)";
    };
    setFace();
    Object.assign(chip.style, {
      position: "fixed", bottom: "14px", left: "14px", zIndex: 2147483646,
      width: "34px", height: "34px", borderRadius: "50%",
      border: "1px solid rgba(0,0,0,.25)", background: "rgba(255,255,255,.9)",
      cursor: "pointer", font: "14px/1 sans-serif",
      boxShadow: "0 1px 5px rgba(0,0,0,.25)",
    });
    // single click = token prompt (deferred, so a double click can cancel it)
    let clickTimer = null;
    chip.addEventListener("click", () => {
      if (clickTimer) return;
      clickTimer = setTimeout(() => {
        clickTimer = null;
        const t = window.prompt(
          "Hypothesis API token (hypothes.is \u2192 Account settings \u2192 Developer).\n" +
          "It is stored ONLY in this browser (localStorage). Leave empty to remove it.",
          CFG.apiToken || "");
        if (t === null) return;
        CFG.apiToken = t.trim() || null;
        lsSet("catColorToken", CFG.apiToken);
        setFace();
        if (CFG.apiToken) syncWithApi();
      }, 280);
    });
    // double click = hide until page reload
    chip.addEventListener("dblclick", () => {
      if (clickTimer) { clearTimeout(clickTimer); clickTimer = null; }
      chip.remove();
    });
    document.body.appendChild(chip);
  }

  function boot() {
    console.info("[cat-color] plugin active; interceptors installed" +
      (CFG.apiToken ? "; token set" : "; no token (only public/local re-reading)"));
    buildTokenChip();
    watchAdder();
    newHlObserver.observe(document.body, { childList: true, subtree: true });
    recolorAll();
    syncWithApi();
    new MutationObserver(recolorAll)
      .observe(document.body, { childList: true, subtree: true });
    setInterval(syncWithApi, 8000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
