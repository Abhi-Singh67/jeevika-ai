// =========================================================
// landing.js — JEEVIKA AI landing page animations
//
// Teen modules hain, sab vanilla JS (koi library nahi):
// 1. HeroTextAnimator — "JEEVIKA AI" ke har letter ko stagger
//    karke animate karta hai (CSS keyframes ko JS se drive karta hai)
// 2. ScrollReveal        — IntersectionObserver se sections ko
//    scroll pe fade-up karta hai
// 3. ParticleNetwork     — background canvas par colored particles
//    (green/blue/red) jo mouse ke paas connect hote hain
//
// prefers-reduced-motion respect kiya gaya hai.
// =========================================================

const PREFERS_REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------------------------------------------------------
// 1. HERO TEXT ANIMATOR
// ---------------------------------------------------------
const HeroTextAnimator = {
  init(selector = "#hero-title .letter", baseDelayMs = 40, startAfterMs = 150) {
    if (PREFERS_REDUCED_MOTION) return;
    const letters = document.querySelectorAll(selector);
    letters.forEach((letter, index) => {
      const delay = startAfterMs + index * baseDelayMs;
      letter.style.animationDelay = `${delay}ms`;
    });
  },
};

// ---------------------------------------------------------
// 2. SCROLL REVEAL
// ---------------------------------------------------------
const ScrollReveal = {
  init(selector = ".reveal-item", options = { threshold: 0.2 }) {
    const items = document.querySelectorAll(selector);
    if (!items.length) return;

    if (PREFERS_REDUCED_MOTION) {
      items.forEach((el) => el.classList.add("in-view"));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          obs.unobserve(entry.target);
        }
      });
    }, options);

    items.forEach((el) => observer.observe(el));
  },
};

// ---------------------------------------------------------
// 3. PARTICLE NETWORK (background canvas)
// ---------------------------------------------------------
class Particle {
  constructor(canvasWidth, canvasHeight, color) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    this.vx = (Math.random() - 0.5) * 0.25;
    this.vy = (Math.random() - 0.5) * 0.25;
    this.radius = 1.6 + Math.random() * 1.6;
    this.color = color;
  }

  step(canvasWidth, canvasHeight) {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > canvasWidth) this.vx *= -1;
    if (this.y < 0 || this.y > canvasHeight) this.vy *= -1;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

const ParticleNetwork = {
  canvas: null,
  ctx: null,
  particles: [],
  colors: ["rgba(34, 197, 94, 0.85)", "rgba(56, 189, 248, 0.85)", "rgba(251, 113, 133, 0.85)"],
  linkDistance: 130,
  particleCount: 70,

  init(canvasId = "particle-canvas") {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");

    this.resize();
    this.spawnParticles();
    window.addEventListener("resize", () => { this.resize(); this.spawnParticles(); });

    if (PREFERS_REDUCED_MOTION) {
      this.drawFrame();
      return;
    }
    this.loop();
  },

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  },

  spawnParticles() {
    this.particles = Array.from({ length: this.particleCount }, () => {
      const color = this.colors[Math.floor(Math.random() * this.colors.length)];
      return new Particle(this.canvas.width, this.canvas.height, color);
    });
  },

  drawLinks() {
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const a = this.particles[i];
        const b = this.particles[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < this.linkDistance) {
          const opacity = 1 - dist / this.linkDistance;
          this.ctx.beginPath();
          this.ctx.moveTo(a.x, a.y);
          this.ctx.lineTo(b.x, b.y);
          this.ctx.strokeStyle = `rgba(147, 166, 156, ${opacity * 0.18})`;
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
        }
      }
    }
  },

  drawFrame() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawLinks();
    this.particles.forEach((p) => p.draw(this.ctx));
  },

  loop() {
    this.particles.forEach((p) => p.step(this.canvas.width, this.canvas.height));
    this.drawFrame();
    requestAnimationFrame(() => this.loop());
  },
};

// ---------------------------------------------------------
// INIT
// ---------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  HeroTextAnimator.init();
  ScrollReveal.init();
  ParticleNetwork.init();
});
