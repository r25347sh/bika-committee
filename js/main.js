/**
 * 美化委員会 — theme toggle + dust + reveal
 */
(function () {
  "use strict";

  var THEME_KEY = "bika-theme";

  function getPreferredTheme() {
    try {
      var saved = localStorage.getItem(THEME_KEY);
      if (saved === "light" || saved === "dark") return saved;
    } catch (e) {}
    return "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}
    var btn = document.querySelector(".theme-toggle");
    if (btn) {
      btn.setAttribute("aria-label", theme === "dark" ? "ライトモードに切替" : "ダークモードに切替");
    }
  }

  function initTheme() {
    applyTheme(getPreferredTheme());
    var btn = document.querySelector(".theme-toggle");
    if (!btn) {
      btn = document.createElement("button");
      btn.type = "button";
      btn.className = "theme-toggle";
      btn.innerHTML = '<span class="icon-sun" aria-hidden="true">☀</span><span class="icon-moon" aria-hidden="true">☾</span>';
      document.body.appendChild(btn);
    }
    btn.addEventListener("click", function () {
      var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
    });
  }

  function initDust() {
    var canvas = document.getElementById("dust-canvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var particles = [];
    var W, H;
    var mouse = { x: -9999, y: -9999 };
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
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: 0.5 + Math.random() * 1.8,
          vx: (Math.random() - 0.5) * 0.28,
          vy: -0.06 - Math.random() * 0.24,
          a: 0.12 + Math.random() * 0.32,
          life: 0.55 + Math.random() * 0.45
        });
      }
    }

    function tick() {
      if (reduced) return;
      ctx.clearRect(0, 0, W, H);
      var dark = isDark();
      for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];
        var dx = mouse.x - p.x;
        var dy = mouse.y - p.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100 && dist > 0.1) {
          var force = (100 - dist) / 100;
          p.vx += (dx / dist) * 0.045 * force;
          p.vy += (dy / dist) * 0.045 * force;
          p.a *= 0.96;
          p.life -= 0.01 * force;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.994;
        p.vy *= 0.994;
        p.life -= 0.0007;
        if (p.y < -10 || p.life <= 0 || p.a < 0.02) {
          particles.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        var alpha = p.a * p.life * (dark ? 0.55 : 0.4);
        if (dark) {
          ctx.fillStyle = "rgba(45, 212, 191, " + alpha + ")";
        } else {
          ctx.fillStyle = "rgba(13, 148, 136, " + alpha + ")";
        }
        ctx.fill();
      }
      if (particles.length < 55) spawn(2);
      requestAnimationFrame(tick);
    }

    resize();
    spawn(50);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
    window.addEventListener("pointerleave", function () {
      mouse.x = -9999;
      mouse.y = -9999;
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
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach(function (el) { io.observe(el); });
  }

  function init() {
    initTheme();
    initDust();
    initReveal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
