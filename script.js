/* ============================================
   NEXUS DIGITAL — INTERACTIVE SCRIPTS
   ============================================ */

(function () {
  'use strict';

  // --- STARFIELD CANVAS BACKGROUND ---
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let stars = [];
  let animationId;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createStars(count) {
    stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.2 + 0.3,
        alpha: Math.random() * 0.6 + 0.1,
        speed: Math.random() * 0.3 + 0.05,
        drift: (Math.random() - 0.5) * 0.15,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.01 + 0.005,
      });
    }
  }

  function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Subtle gradient overlay
    const grad = ctx.createRadialGradient(
      canvas.width * 0.3, canvas.height * 0.3, 0,
      canvas.width * 0.3, canvas.height * 0.3, canvas.width * 0.8
    );
    grad.addColorStop(0, 'rgba(108, 92, 231, 0.02)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const star of stars) {
      star.y -= star.speed;
      star.x += star.drift;
      star.pulse += star.pulseSpeed;

      const flicker = Math.sin(star.pulse) * 0.2 + 0.8;

      if (star.y < -2) { star.y = canvas.height + 2; star.x = Math.random() * canvas.width; }
      if (star.x < -2) star.x = canvas.width + 2;
      if (star.x > canvas.width + 2) star.x = -2;

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 200, 240, ${star.alpha * flicker})`;
      ctx.fill();
    }

    animationId = requestAnimationFrame(drawStars);
  }

  function initStarfield() {
    resizeCanvas();
    const count = Math.min(Math.floor((canvas.width * canvas.height) / 4000), 400);
    createStars(count);
    drawStars();
  }

  window.addEventListener('resize', () => {
    cancelAnimationFrame(animationId);
    initStarfield();
  });

  initStarfield();


  // --- NAVIGATION ---
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  // Scroll effect
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    nav.classList.toggle('scrolled', scrollY > 50);
    lastScroll = scrollY;
  }, { passive: true });

  // Mobile menu toggle
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  // Close menu on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });


  // --- SCROLL REVEAL ---
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings
        const parent = entry.target.parentElement;
        const siblings = Array.from(parent.querySelectorAll('.reveal'));
        const index = siblings.indexOf(entry.target);
        const delay = Math.min(index * 100, 400);

        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);

        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));


  // --- ACTIVE NAV LINK ---
  const sections = document.querySelectorAll('section[id]');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.querySelectorAll('a').forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, {
    threshold: 0.3,
    rootMargin: '-80px 0px -50% 0px'
  });

  sections.forEach(s => sectionObserver.observe(s));


  // --- CONTACT FORM ---
  const form = document.getElementById('contactForm');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;

    // Basic validation is handled by HTML required attributes
    btn.textContent = 'Sending...';
    btn.disabled = true;
    btn.style.opacity = '0.7';

    // Simulate submission (replace with real endpoint)
    setTimeout(() => {
      btn.textContent = 'Message Sent ✓';
      btn.style.background = '#00b894';
      btn.style.boxShadow = '0 0 30px rgba(0, 184, 148, 0.3)';

      form.reset();

      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
        btn.style.opacity = '';
        btn.style.background = '';
        btn.style.boxShadow = '';
      }, 3000);
    }, 1500);
  });


  // --- SMOOTH SCROLL POLYFILL (for Safari) ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = nav.offsetHeight;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

})();
