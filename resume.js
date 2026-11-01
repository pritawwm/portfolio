(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  const clean = (node) => node.textContent.replace(/\s+/g, " ").trim();

  function readReferences() {
    return $$("#references .reference-list li").map((li) => {
      const links = $$(".ref-links a", li);
      return {
        label:
          clean($(".ref-authors", li)).split(",")[0].split(" ").pop() +
          " et al.",
        title: clean($(".ref-title", li)),
        venue: clean($(".ref-venue", li)),
        year: clean($(".ref-year", li)),
        url: links[0].href,
        links,
      };
    });
  }

  function legacyCopy(text) {
    const previouslyFocused = document.activeElement;
    const host = $("dialog[open]") || document.body;
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:-1000px;opacity:0;";
    host.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (e) {
      ok = false;
    }
    ta.remove();
    if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
    return ok;
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (e) {

      }
    }
    return legacyCopy(text);
  }

  function initEmail() {
    $$("[data-mail-user]").forEach((node) => {
      const address = node.dataset.mailUser + "@" + node.dataset.mailDomain;
      node.setAttribute("href", "mailto:" + address);
      if (node.dataset.mailText === "true") node.textContent = address;
    });
  }

  function initTheme() {
    const btn = $("#theme-toggle");
    if (!btn) return;
    const root = document.documentElement;
    const isDark = () => root.getAttribute("data-theme") === "dark";
    const sync = () => btn.setAttribute("aria-pressed", String(isDark()));

    btn.addEventListener("click", () => {
      if (isDark()) root.removeAttribute("data-theme");
      else root.setAttribute("data-theme", "dark");
      sync();
    });
    sync();
  }

  function initTabs() {
    const tabs = $$('[role="tab"]');
    if (!tabs.length) return null;

    function select(tab, focus) {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
    }

    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => select(tab, false));
      tab.addEventListener("keydown", (e) => {
        let next = null;
        if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
        else if (e.key === "ArrowLeft")
          next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === "Home") next = tabs[0];
        else if (e.key === "End") next = tabs[tabs.length - 1];
        if (next) {
          e.preventDefault();
          select(next, true);
        }
      });
    });

    return { select, tabs };
  }

  function buildSectionNav() {
    const list = $("#sections-list");
    if (!list) return;
    $$(".content-section").forEach((section) => {
      const heading = $("h2", section);
      if (!heading) return;
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = "#" + section.id;
      a.textContent = heading.textContent.replace(/\s+/g, " ").trim();
      li.appendChild(a);
      list.appendChild(li);
    });
  }

  function buildSidebarRefs(references) {
    const ol = $("#sidebar-refs");
    if (!ol) return;

    references.forEach((r) => {
      const li = document.createElement("li");
      li.append(`${r.label} (${r.year}). ${r.title}. ${r.venue}.`);
      const links = el("div", "ref-links");
      r.links.forEach((a) => links.appendChild(a.cloneNode(true)));
      li.appendChild(links);
      ol.appendChild(li);
    });
  }

  function initCitationPopovers(references) {
    $$("#results sup > a.citation-link[href^='#ref-']").forEach((link) => {
      const index = Number(link.hash.replace("#ref-", "")) - 1;
      const ref = references[index];
      if (!ref) return;

      const sup = link.parentElement;
      sup.classList.add("has-cite");

      const pop = el("span", "cite-popover");
      const card = el("span", "cite-card");
      card.appendChild(el("span", "cite-label", "Reference " + (index + 1)));
      card.appendChild(el("span", "cite-title", ref.title));
      card.appendChild(
        el(
          "span",
          "cite-meta",
          ref.label + " · " + ref.venue + " · " + ref.year,
        ),
      );

      const isDoi = ref.url.startsWith("https://doi.org/");
      const doi = el(
        "a",
        "cite-doi",
        isDoi ? "DOI: " + ref.url.slice(16) : "View publication",
      );
      doi.href = ref.url;
      doi.target = "_blank";
      doi.rel = "noopener noreferrer";
      card.appendChild(doi);

      pop.appendChild(card);
      sup.appendChild(pop);

      function position() {
        pop.classList.remove("above");
        pop.style.left = "-8px";
        const margin = 8;
        const r = card.getBoundingClientRect();
        let shift = 0;
        if (r.right > window.innerWidth - margin)
          shift = window.innerWidth - margin - r.right;
        if (r.left + shift < margin) shift = margin - r.left;
        pop.style.left = -8 + shift + "px";

        if (r.bottom > window.innerHeight - margin) {
          const linkRect = link.getBoundingClientRect();
          if (linkRect.top > r.height + margin + 16) pop.classList.add("above");
        }
      }

      const open = () => {
        sup.classList.add("open");
        position();
      };
      const close = () => sup.classList.remove("open");

      sup.addEventListener("mouseenter", open);
      sup.addEventListener("mouseleave", close);
      sup.addEventListener("focusin", open);
      sup.addEventListener("focusout", (e) => {
        if (!sup.contains(e.relatedTarget)) close();
      });
      sup.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && sup.classList.contains("open")) {
          close();
          link.focus();
          e.stopPropagation();
        }
      });
    });
  }

  function initScrollSpy() {
    const sections = $$(".content-section");
    const navLinks = $$("#panel-sections a");
    if (!sections.length) return;

    const visible = new Set();
    let atBottom = false;

    function setActive(id) {
      navLinks.forEach((link) => {
        if (link.hash === "#" + id) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    }

    function update() {
      let id = null;
      if (atBottom) id = sections[sections.length - 1].id;
      else {
        const first = sections.find((s) => visible.has(s));
        if (first) id = first.id;
      }
      if (id) setActive(id);
    }

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        });
        update();
      },
      { rootMargin: "-100px 0px -60% 0px" },
    );
    sections.forEach((s) => sectionObserver.observe(s));

    const sentinel = $("#page-end");
    if (sentinel) {
      new IntersectionObserver((entries) => {
        atBottom = entries[0].isIntersecting;
        update();
      }).observe(sentinel);
    }

    setActive(sections[0].id);
  }

  function initStickyBar() {
    const title = $(".article-title");
    const bar = $("#sticky-bar");
    if (!title || !bar) return;

    new IntersectionObserver(([entry]) => {
      const past = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      bar.classList.toggle("visible", past);
      document.body.classList.toggle("scrolled-past-title", past);
    }).observe(title);
  }

  function initProgress() {
    const bar = $("#reading-progress");
    if (!bar) return;
    let ticking = false;

    function paint() {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const progress = max > 0 ? Math.min(doc.scrollTop / max, 1) : 0;
      bar.style.transform = "scaleX(" + progress + ")";
      ticking = false;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(paint);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    paint();
  }

  function initDialogs() {
    $$("[data-dialog]").forEach((trigger) => {
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        const dialog = document.getElementById(trigger.dataset.dialog);
        if (dialog && typeof dialog.showModal === "function")
          dialog.showModal();
      });
    });

    $$(".btn-close-popup").forEach((btn) => {
      btn.addEventListener("click", () => btn.closest("dialog").close());
    });

    $$("dialog").forEach((dialog) => {
      dialog.addEventListener("click", (e) => {
        if (e.target !== dialog) return;
        const r = dialog.getBoundingClientRect();
        const outside =
          e.clientX < r.left ||
          e.clientX > r.right ||
          e.clientY < r.top ||
          e.clientY > r.bottom;
        if (outside) dialog.close();
      });
    });
  }

  function initCiteCopy() {
    const btn = $("#btn-copy-cite");
    if (!btn) return;

    btn.addEventListener("click", async () => {
      const text = $$("#citePopup .citation-box")
        .map(
          (box) =>
            box.dataset.label +
            ": " +
            box.textContent.replace(/\s+/g, " ").trim(),
        )
        .join("\n\n");

      const original = btn.textContent;
      const ok = await copyText(text);
      btn.textContent = ok ? "Copied!" : "Copy failed";
      btn.classList.toggle("is-success", ok);
      setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove("is-success");
      }, 2000);
    });
  }

  function attachFigureTooltips(frame) {
    const tip = el("div", "fig-tooltip");
    tip.setAttribute("aria-hidden", "true");
    tip.hidden = true;
    frame.appendChild(tip);

    function row(label, value) {
      return el("span", "", label + ": " + value);
    }

    function place(group) {
      const f = frame.getBoundingClientRect();
      const b = group.getBoundingClientRect();
      const tw = tip.offsetWidth;
      const th = tip.offsetHeight;
      let left = b.left - f.left + b.width / 2 - tw / 2;
      left = Math.max(4, Math.min(left, f.width - tw - 4));
      let top = b.top - f.top - th - 8;
      if (top < 4) top = b.top - f.top + 8;
      tip.style.left = left + "px";
      tip.style.top = top + "px";
    }

    function show(group) {
      tip.replaceChildren(
        el("span", "fig-tip-title", group.dataset.year),
        row("Papers", group.dataset.papers),
        row("Preprints", group.dataset.preprints),
        row("Caffeine", group.dataset.caffeine),
      );
      tip.hidden = false;
      place(group);
    }

    const hide = () => {
      tip.hidden = true;
    };

    $$(".fig-bar-group", frame).forEach((group) => {
      group.addEventListener("mouseenter", () => show(group));
      group.addEventListener("mouseleave", hide);
      group.addEventListener("focus", () => show(group));
      group.addEventListener("blur", hide);
    });

    frame.addEventListener("keydown", (e) => {
      if (e.key === "Escape") hide();
    });

    return { hide };
  }

  function initFigureViewer() {
    const inlineFrame = $("#fig-1 .fig-frame");
    const dialog = $("#figureViewer");
    const body = $("#fig-viewer-body");
    if (!inlineFrame || !dialog || !body) return;

    const svg = $(".fig-svg", inlineFrame);
    const inlineTips = attachFigureTooltips(inlineFrame);

    function open() {
      inlineTips.hide();
      body.replaceChildren(svg.cloneNode(true));
      attachFigureTooltips(body);
      dialog.showModal();
    }

    inlineFrame.addEventListener("click", open);
    $$("[data-fig-open]").forEach((node) => node.addEventListener("click", open));
  }

  function buildSidebarFigure() {
    const thumb = $("#sidebar-fig-thumb");
    const svg = $("#fig-1 .fig-svg");
    if (!thumb || !svg) return;

    const copy = svg.cloneNode(true);
    ["role", "aria-label"].forEach((name) => copy.removeAttribute(name));
    copy.setAttribute("aria-hidden", "true");
    $$(".fig-bar-group", copy).forEach((group) => {
      ["tabindex", "role", "aria-label"].forEach((name) =>
        group.removeAttribute(name),
      );
    });
    thumb.replaceChildren(copy);
  }

  function initCounters() {
    const counters = $$("[data-count]");
    if (!counters.length || prefersReducedMotion()) return;

    const duration = 1200;
    counters.forEach((node) => {
      const target = Number(node.dataset.count);
      const start = performance.now();
      node.textContent = "0";

      function tick(now) {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        node.textContent = String(Math.round(target * eased));
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  function initShortcut(tabsApi) {
    document.addEventListener("keydown", (e) => {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.target.closest("input, textarea, select, [contenteditable='true']"))
        return;
      if ($("dialog[open]")) return;

      const sidebar = $(".sidebar-right");
      if (!sidebar || sidebar.offsetParent === null || !tabsApi) return;

      e.preventDefault();
      tabsApi.select(tabsApi.tabs[0], false);
      const target =
        $("#panel-sections a[aria-current='true']") || $("#panel-sections a");
      if (target) target.focus();
    });
  }

  initEmail();
  initTheme();
  const tabsApi = initTabs();
  buildSectionNav();
  const references = readReferences();
  buildSidebarRefs(references);
  initCitationPopovers(references);
  initScrollSpy();
  initStickyBar();
  initProgress();
  initDialogs();
  initCiteCopy();
  buildSidebarFigure();
  initFigureViewer();
  initCounters();
  initShortcut(tabsApi);
})();
