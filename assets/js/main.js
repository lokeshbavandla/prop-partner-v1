/* The Prop Partner — interactions. Restrained: progress, reveal, nav, FAQ, lifecycle, count-up. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- sticky header shadow ---- */
  var header = document.querySelector(".site-header");
  var progress = document.querySelector(".scroll-progress");
  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (header) header.classList.toggle("is-stuck", y > 8);
    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = "scaleX(" + (h > 0 ? y / h : 0) + ")";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- mobile nav ---- */
  var toggle = document.querySelector(".nav__toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      document.body.classList.toggle("menu-open");
      var open = document.body.classList.contains("menu-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.querySelectorAll(".mobile-nav a").forEach(function (a) {
      a.addEventListener("click", function () { document.body.classList.remove("menu-open"); });
    });
  }

  /* ---- reveal on scroll is handled by the self-contained script in <head>
     so it can never be blocked by an error elsewhere in this file. ---- */

  /* ---- lifecycle spine light-up ---- */
  var spine = document.querySelector(".spine");
  if (spine) {
    if (reduce) { spine.classList.add("lit"); }
    else {
      var so = new IntersectionObserver(function (ents) {
        ents.forEach(function (e) { if (e.isIntersecting) { spine.classList.add("lit"); so.disconnect(); } });
      }, { threshold: 0.5 });
      so.observe(spine);
    }
  }

  /* ---- orbit arc draw ---- */
  var arc = document.querySelector(".orbit .arc");
  if (arc) {
    var len = arc.getTotalLength ? arc.getTotalLength() : 0;
    if (len && !reduce) {
      arc.style.strokeDasharray = len;
      arc.style.strokeDashoffset = len;
      var ao = new IntersectionObserver(function (ents) {
        ents.forEach(function (e) {
          if (e.isIntersecting) {
            arc.style.transition = "stroke-dashoffset 1.6s cubic-bezier(.22,1,.36,1)";
            arc.style.strokeDashoffset = "0";
            ao.disconnect();
          }
        });
      }, { threshold: 0.4 });
      ao.observe(arc);
    }
  }

  /* ---- FAQ accordion ---- */
  document.querySelectorAll(".faq__item").forEach(function (item) {
    var q = item.querySelector(".faq__q");
    var a = item.querySelector(".faq__a");
    if (!q || !a) return;
    q.setAttribute("aria-expanded", "false");
    q.addEventListener("click", function () {
      var open = item.classList.toggle("open");
      q.setAttribute("aria-expanded", open ? "true" : "false");
      a.style.maxHeight = open ? a.scrollHeight + "px" : "0px";
    });
  });

  /* ---- count-up for [data-count] ---- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var dec = (target % 1 !== 0) ? 1 : 0;
    var dur = 1300, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString("en-IN");
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    if (reduce || !("IntersectionObserver" in window)) {
      counters.forEach(function (c) { c.textContent = parseFloat(c.getAttribute("data-count")).toLocaleString("en-IN"); });
    } else {
      var co = new IntersectionObserver(function (ents) {
        ents.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); co.unobserve(e.target); } });
      }, { threshold: 0.6 });
      counters.forEach(function (c) { co.observe(c); });
    }
  }

  /* ---- footer year ---- */
  var yr = document.querySelector("[data-year]");
  if (yr) yr.textContent = new Date().getFullYear();
})();
