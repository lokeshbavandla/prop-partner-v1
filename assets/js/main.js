/* The Prop Partner — homepage interactions
   Native scrolling + restrained scroll reveals (GSAP/ScrollTrigger).
   Everything degrades gracefully without JS or with reduced motion. */

(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const doc = document.documentElement;

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Sticky header state ---------- */
  const header = document.getElementById("siteHeader");
  const onScroll = () => {
    if (window.scrollY > 8) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile nav ---------- */
  const toggle = document.getElementById("navToggle");
  const mobileNav = document.getElementById("mobileNav");
  if (toggle && mobileNav) {
    const closeNav = () => {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      mobileNav.hidden = true;
    };
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      if (open) {
        closeNav();
      } else {
        toggle.setAttribute("aria-expanded", "true");
        toggle.setAttribute("aria-label", "Close menu");
        mobileNav.hidden = false;
      }
    });
    mobileNav.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeNav));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        closeNav();
        toggle.focus();
      }
    });
  }

  /* ---------- GSAP reveals (native scrolling, no scroll hijack) ----------
     We deliberately use the browser's native scroll. Smooth-scroll libraries
     (Lenis et al.) intercept the wheel and, tuned wrong, feel laggy and rough.
     Native scroll is the most natural feel; ScrollTrigger rides on top of it. */
  const hasGsap = typeof window.gsap !== "undefined";

  if (hasGsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ---------- Reveal-on-scroll (enhances an already-visible default) ---------- */
  if (!prefersReduced && hasGsap && window.ScrollTrigger) {
    doc.classList.add("js-anim"); // only now do we hide-then-reveal

    const items = Array.from(document.querySelectorAll("[data-reveal]"));
    // Group reveals by their nearest section so each section staggers its own children.
    const groups = new Map();
    items.forEach((el) => {
      const section = el.closest("section, footer") || document.body;
      if (!groups.has(section)) groups.set(section, []);
      groups.get(section).push(el);
    });

    groups.forEach((els) => {
      gsap.to(els, {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: {
          trigger: els[0],
          start: "top 86%",
          once: true,
        },
      });
    });

    // Safety net: if anything is still hidden after load (offscreen edge cases), reveal it.
    window.addEventListener("load", () => ScrollTrigger.refresh());
  }

  /* ---------- In-page anchor links ----------
     Native smooth scroll handles the motion (html { scroll-behavior: smooth }),
     and scroll-padding-top offsets the sticky header. No JS scroll needed. */

  /* ---------- Consultation form (client-side validation + thank-you state) ---------- */
  const form = document.getElementById("consultForm");
  const status = document.getElementById("formStatus");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      // Honeypot: if filled, silently pretend success (bot).
      const hp = form.querySelector('input[name="company_url"]');
      if (hp && hp.value) { showThanks(); return; }

      const required = ["name", "company", "phone"];
      let firstInvalid = null;
      required.forEach((n) => {
        const f = form.elements[n];
        const ok = f && f.value.trim().length > 0;
        if (f) f.classList.toggle("invalid", !ok);
        if (!ok && !firstInvalid) firstInvalid = f;
      });

      if (firstInvalid) {
        status.textContent = "Please fill in your name, company, and a number we can reach you on.";
        status.className = "form-status err";
        firstInvalid.focus();
        return;
      }

      // NOTE: no backend yet. In production this POSTs to a monitored inbox/CRM,
      // fires the /thank-you conversion event, and sends an auto-acknowledgement.
      showThanks();
    });

    form.addEventListener("input", (e) => {
      if (e.target.classList && e.target.classList.contains("invalid")) {
        e.target.classList.remove("invalid");
      }
    });
  }

  function showThanks() {
    const name = (form.elements["name"] && form.elements["name"].value.trim().split(" ")[0]) || "there";
    form.classList.add("sent");
    form.innerHTML =
      '<svg class="burst-mark lg" aria-hidden="true" style="margin:0 auto 1rem"><use href="#burst"/></svg>' +
      '<h3 style="color:var(--on-dark);font-size:1.6rem;margin-bottom:0.6rem">Thanks, ' + escapeHtml(name) + ".</h3>" +
      '<p style="color:var(--on-dark-2);max-width:34ch">We\'ve got your details and will respond within one business day to set up the conversation.</p>';
    form.setAttribute("aria-live", "polite");
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
})();
