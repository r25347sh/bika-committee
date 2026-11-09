/**
 * 美化委員会 — theme + soft bokeh lights + reveal
 * Background feels alive without looking like dirt
 */
(function () {
  "use strict";
  var THEME_KEY = "bika-theme";

  function getPreferredTheme() {
    try {
      var s = localStorage.getItem(THEME_KEY);
      if (s === "light" || s === "dark") return s;
    } catch (e) {}
    return "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === "dark" ? "#0d1210" : "#f4f1ea";
  }

  function initTheme() {
    applyTheme(getPreferredTheme());
    var btn = document.querySelector(".theme-toggle");
    if (!btn) {
      btn = document.createElement("button");
      btn.type = "button";
      btn.className = "theme-toggle";
      btn.setAttribute("aria-label", "テーマ切替");
      btn.innerHTML = '<span class="icon-sun" aria-hidden="true">☀</span><span class="icon-moon" aria-hidden="true">☾</span>';
      document.body.appendChild(btn);
    }
    btn.addEventListener("click", function () {
      applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });
  }

  function initBokeh() {
    var canvas = document.getElementById("dust-canvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var lights = [];
    var W, H;
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function isDark() {
      return document.documentElement.getAttribute("data-theme") === "dark";
    }

    function spawn(n) {
      for (var i = 0; i < n; i++) {
        lights.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: 18 + Math.random() * 42,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.14 - 0.05,
          a: 0.08 + Math.random() * 0.12,
          phase: Math.random() * Math.PI * 2,
          speed: 0.004 + Math.random() * 0.006
        });
      }
    }

    function tick() {
      if (reduced) return;
      ctx.clearRect(0, 0, W, H);
      var dark = isDark();
      var t = performance.now() * 0.001;

      for (var i = 0; i < lights.length; i++) {
        var p = lights[i];
        p.phase += p.speed;
        p.x += p.vx + Math.sin(p.phase) * 0.15;
        p.y += p.vy + Math.cos(p.phase * 0.7) * 0.1;

        if (p.x < -p.r) p.x = W + p.r;
        if (p.x > W + p.r) p.x = -p.r;
        if (p.y < -p.r) p.y = H + p.r;
        if (p.y > H + p.r) p.y = -p.r;

        var pulse = 0.7 + 0.3 * Math.sin(p.phase * 2 + t);
        var alpha = p.a * pulse * (dark ? 0.9 : 0.75);
        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        if (dark) {
          g.addColorStop(0, "rgba(94, 234, 212, " + alpha + ")");
          g.addColorStop(0.4, "rgba(45, 212, 191, " + (alpha * 0.35) + ")");
          g.addColorStop(1, "rgba(45, 212, 191, 0)");
        } else {
          g.addColorStop(0, "rgba(255, 255, 255, " + (alpha * 1.1) + ")");
          g.addColorStop(0.35, "rgba(180, 230, 220, " + (alpha * 0.5) + ")");
          g.addColorStop(1, "rgba(10, 107, 110, 0)");
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }
      requestAnimationFrame(tick);
    }

    resize();
    spawn(14);
    window.addEventListener("resize", function () {
      resize();
      if (lights.length < 10) spawn(4);
    });
    if (!reduced) requestAnimationFrame(tick);
  }

  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  function init() {
    initTheme();
    initBokeh();
    initReveal();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else init();
})();
