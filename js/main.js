/**
 * 美化委員会 — main interactions
 * Dust particle system + scroll reveals
 */
(function () {
  "use strict";

  /* ---------- Dust particle canvas ---------- */
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

    function spawn(n) {
      for (var i = 0; i < n; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: 0.6 + Math.random() * 1.8,
          vx: (Math.random() - 0.5) * 0.35,
          vy: -0.15 - Math.random() * 0.35,
          a: 0.15 + Math.random() * 0.35,
          life: 0.6 + Math.random() * 0.4
        });
      }
    }

    function tick() {
      if (reduced) return;
      ctx.clearRect(0, 0, W, H);
      for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];
        // gentle attraction / clean when near mouse
        var dx = mouse.x - p.x;
        var dy = mouse.y - p.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 90) {
          p.vx += (dx / dist) * 0.04;
          p.vy += (dy / dist) * 0.04;
          p.a *= 0.97;
          p.life -= 0.008;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.995;
        p.vy *= 0.995;
        p.life -= 0.0008;

        if (p.y < -10 || p.life <= 0 || p.a < 0.02) {
          particles.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 122, 94, " + p.a * p.life + ")";
        ctx.fill();
      }
      // keep density
      if (particles.length < 55) spawn(2);
      requestAnimationFrame(tick);
    }

    resize();
    spawn(70);
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

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) {
        el.classList.add("visible");
      });
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
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach(function (el) {
      io.observe(el);
    });
  }

  /* ---------- Active page hint in title (optional) ---------- */
  function setPageClass() {
    var path = (location.pathname || "").split("/").pop() || "index.html";
    document.body.classList.add("page-" + path.replace(".html", ""));
  }

  function init() {
    setPageClass();
    initDust();
    initReveal();
    document.body.classList.add("page-enter");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
