(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  /* Mobile navigation */
  const menuButton = $(".menu-toggle");
  const mobileMenu = $("#mobile-menu");
  let menuReturnFocus = null;

  const setMenu = (open, restoreFocus = false) => {
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    mobileMenu.hidden = !open;
    document.body.classList.toggle("menu-open", open);
    if (open) {
      menuReturnFocus = document.activeElement;
      $("a", mobileMenu)?.focus();
    } else if (restoreFocus && menuReturnFocus instanceof HTMLElement) {
      menuReturnFocus.focus();
    }
  };

  menuButton?.addEventListener("click", () => {
    setMenu(menuButton.getAttribute("aria-expanded") !== "true", true);
  });
  $$("a", mobileMenu || document.createElement("div")).forEach((link) => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuButton?.getAttribute("aria-expanded") === "true") setMenu(false, true);
    if (event.key !== "Tab" || menuButton?.getAttribute("aria-expanded") !== "true" || !mobileMenu) return;
    const focusable = $$("a, button", mobileMenu).filter((element) => !element.hasAttribute("disabled"));
    focusable.push(menuButton);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  window.addEventListener("resize", () => { if (window.innerWidth > 1100) setMenu(false); });

  /* Same-page navigation with focus-safe scrolling */
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = $(id);
      if (!target) return;
      event.preventDefault();
      setMenu(false);
      target.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "start" });
      history.replaceState(null, "", id);
    });
  });

  /* Accessible case-study tabs */
  const tabs = $$('[role="tab"][data-case-tab]');
  const panels = $$('[role="tabpanel"][data-case-panel]');
  const dmaicMarkup = `<ol class="case-logic" aria-label="DMAIC plus Results structure"><li><b>D</b><span>Define</span></li><li><b>M</b><span>Measure</span></li><li><b>A</b><span>Analyze</span></li><li><b>I</b><span>Improve</span></li><li><b>C</b><span>Control</span></li><li class="case-logic-result"><b>R</b><span>Result</span></li></ol>`;
  panels.forEach((panel) => {
    const story = $(".case-story", panel);
    if (story && !$(".case-logic", story)) story.insertAdjacentHTML("afterbegin", dmaicMarkup);
  });
  const onlineEvidence = $("#online-cme .case-evidence");
  if (onlineEvidence && !$("[data-expanded-evidence]", onlineEvidence)) {
    onlineEvidence.insertAdjacentHTML("beforeend", `<div data-expanded-evidence><hr><b>50+</b><p>Multilingual landing pages connected to the delivery workflow.</p><hr><b class="evidence-label">Near-zero-cost stack</b><p>Built to reduce manual work and third-party dependency.</p></div>`);
  }
  const activateCase = (id, options = {}) => {
    const tab = tabs.find((item) => item.dataset.caseTab === id);
    const panel = panels.find((item) => item.id === id);
    if (!tab || !panel) return;
    tabs.forEach((item) => {
      const active = item === tab;
      item.setAttribute("aria-selected", String(active));
      item.tabIndex = active ? 0 : -1;
    });
    panels.forEach((item) => { item.hidden = item !== panel; });
    if (options.updateHash !== false) {
      try { history.replaceState(null, "", `#${id}`); }
      catch { window.location.hash = id; }
    }
    if (options.focusTab) tab.focus();
    if (options.scroll) panel.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "start" });
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateCase(tab.dataset.caseTab, { scroll: true }));
    tab.addEventListener("keydown", (event) => {
      const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
      if (!keys.includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      activateCase(tabs[next].dataset.caseTab, { focusTab: true });
    });
  });

  const initialCase = window.location.hash.slice(1);
  if (tabs.some((tab) => tab.dataset.caseTab === initialCase)) activateCase(initialCase, { updateHash: false });

  /* Contact form: app-owned validation, stable busy state, async feedback */
  const form = $("#contact-form");
  if (!form) return;
  const formOpenedAt = Date.now();
  const cooldownKey = "kg-contact-last-sent";
  const readLastSent = () => {
    try { return Number(sessionStorage.getItem(cooldownKey) || 0); }
    catch { return 0; }
  };
  const rememberSent = () => {
    try { sessionStorage.setItem(cooldownKey, String(Date.now())); }
    catch { /* The server-side CAPTCHA and honeypot remain active. */ }
  };

  const summary = $("#form-summary", form);
  const status = $("#form-status", form);
  const submit = $(".form-submit", form);
  const fields = [$("#name", form), $("#email", form), $("#inquiry-type", form), $("#message", form)].filter(Boolean);

  const errorMessage = (field) => {
    const value = field.value.trim();
    if (!value) return field.tagName === "SELECT" ? "Choose how you would like to connect." : "Complete this field.";
    if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a complete email address, such as name@company.com.";
    if (field.id === "message" && value.length < 12) return "Add a short note (at least 12 characters).";
    return "";
  };

  const validateField = (field) => {
    const error = errorMessage(field);
    const target = $(`#${CSS.escape(field.id)}-error`, form);
    field.setAttribute("aria-invalid", String(Boolean(error)));
    if (target) target.textContent = error;
    return !error;
  };

  fields.forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => { if (field.getAttribute("aria-invalid") === "true") validateField(field); });
    field.addEventListener("change", () => { if (field.getAttribute("aria-invalid") === "true") validateField(field); });
  });

  const setBusy = (busy) => {
    if (!submit) return;
    submit.disabled = busy;
    submit.classList.toggle("is-busy", busy);
    submit.setAttribute("aria-busy", String(busy));
    const label = $(".submit-label", submit);
    if (label) label.textContent = busy ? "Sending…" : "Start the conversation";
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if ($('[name="_honey"]', form)?.value) return;
    if (Date.now() - formOpenedAt < 2500) {
      if (status) { status.textContent = "Please take a moment to review your message, then send it again."; status.classList.add("is-error"); }
      return;
    }
    const lastSent = readLastSent();
    if (lastSent && Date.now() - lastSent < 60000) {
      if (status) { status.textContent = "Your previous inquiry was sent. Please wait a minute before sending another."; status.classList.add("is-error"); }
      return;
    }
    const invalid = fields.filter((field) => !validateField(field));
    if (invalid.length) {
      if (summary) { summary.hidden = false; summary.textContent = `Review ${invalid.length} ${invalid.length === 1 ? "field" : "fields"} before sending.`; summary.focus(); }
      invalid[0].focus();
      return;
    }
    if (summary) summary.hidden = true;
    if (status) { status.textContent = ""; status.classList.remove("is-error"); }

    const endpoint = form.dataset.formEndpoint?.trim();
    if (!endpoint) {
      if (status) { status.textContent = "This form still needs its secure delivery endpoint. Please use the resume contact details for now."; status.classList.add("is-error"); }
      return;
    }

    setBusy(true);
    try {
      const response = await fetch(endpoint, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error("The form service did not accept the message.");
      form.reset();
      rememberSent();
      fields.forEach((field) => { field.removeAttribute("aria-invalid"); const error = $(`#${CSS.escape(field.id)}-error`, form); if (error) error.textContent = ""; });
      if (status) status.textContent = "Your inquiry was sent. I’ll respond within 1–2 business days.";
    } catch {
      if (status) { status.textContent = "The message could not be sent. Your information is still here—please try again or use the contact details in the resume."; status.classList.add("is-error"); }
    } finally {
      setBusy(false);
    }
  });
})();
