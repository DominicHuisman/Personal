/* ============================================
   NEXUS DIGITAL — REEL SCROLL ENGINE
   ============================================ */

(function () {
  'use strict';

  /* ----------------------------------------
     PRELOADER
     ---------------------------------------- */
  const preloader = document.getElementById('preloader');
  const preloaderFill = document.getElementById('preloaderFill');
  let loadProgress = 0;

  function animatePreloader() {
    loadProgress += (100 - loadProgress) * 0.08;
    preloaderFill.style.width = loadProgress + '%';
    if (loadProgress < 95) requestAnimationFrame(animatePreloader);
  }

  animatePreloader();
  document.body.style.overflow = 'hidden';

  window.addEventListener('load', () => {
    loadProgress = 100;
    preloaderFill.style.width = '100%';
    setTimeout(() => {
      preloader.classList.add('done');
      document.body.style.overflow = '';
      initEverything();
    }, 600);
  });


  /* ----------------------------------------
     STARFIELD
     ---------------------------------------- */
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let stars = [];
  let starAnimId;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createStars() {
    const count = Math.min(Math.floor((canvas.width * canvas.height) / 5000), 350);
    stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.2 + 0.2,
        a: Math.random() * 0.5 + 0.1,
        speed: Math.random() * 0.2 + 0.03,
        drift: (Math.random() - 0.5) * 0.1,
        phase: Math.random() * Math.PI * 2,
        pulseRate: Math.random() * 0.008 + 0.003,
      });
    }
  }

  function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const g = ctx.createRadialGradient(
      canvas.width * 0.25, canvas.height * 0.25, 0,
      canvas.width * 0.25, canvas.height * 0.25, canvas.width * 0.7
    );
    g.addColorStop(0, 'rgba(108,92,231,0.015)');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const s of stars) {
      s.y -= s.speed;
      s.x += s.drift;
      s.phase += s.pulseRate;

      if (s.y < -2) { s.y = canvas.height + 2; s.x = Math.random() * canvas.width; }
      if (s.x < -2) s.x = canvas.width + 2;
      if (s.x > canvas.width + 2) s.x = -2;

      const flicker = Math.sin(s.phase) * 0.25 + 0.75;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(190,190,230,${s.a * flicker})`;
      ctx.fill();
    }

    starAnimId = requestAnimationFrame(drawStars);
  }

  resizeCanvas();
  createStars();
  drawStars();

  window.addEventListener('resize', () => {
    cancelAnimationFrame(starAnimId);
    resizeCanvas();
    createStars();
    drawStars();
  });


  /* ----------------------------------------
     CUSTOM CURSOR
     ---------------------------------------- */
  const cursor = document.getElementById('cursor');
  const cursorLabel = document.getElementById('cursorLabel');
  let mouseX = -100, mouseY = -100;
  let cursorX = -100, cursorY = -100;
  const isTouch = 'ontouchstart' in window;

  if (!isTouch) {
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function updateCursor() {
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
      requestAnimationFrame(updateCursor);
    }
    updateCursor();

    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest('a, button, [data-cursor-text]');
      if (!target) {
        document.body.classList.remove('cursor-hover', 'cursor-text');
        cursorLabel.textContent = '';
        return;
      }
      const label = target.getAttribute('data-cursor-text');
      if (label) {
        document.body.classList.add('cursor-text');
        cursorLabel.textContent = label;
      } else {
        document.body.classList.add('cursor-hover');
      }
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target.closest('a, button, [data-cursor-text]');
      if (target) {
        document.body.classList.remove('cursor-hover', 'cursor-text');
        cursorLabel.textContent = '';
      }
    });
  } else {
    cursor.style.display = 'none';
  }


  /* ----------------------------------------
     MAIN INIT
     ---------------------------------------- */
  function initEverything() {
    initSlides();
    initNavigation();
    initDots();
    initContactForm();
    initSmoothAnchors();
  }


  /* ----------------------------------------
     SLIDE OBSERVER — triggers .in-view
     ---------------------------------------- */
  function initSlides() {
    const slides = document.querySelectorAll('.slide');
    const nav = document.getElementById('nav');
    const dots = document.getElementById('dots');
    const dotBtns = dots.querySelectorAll('.dot');
    const slideIds = Array.from(slides).map(s => s.id);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Add in-view class (keep it — don't remove on exit)
          entry.target.classList.add('in-view');

          // Update active dot
          const id = entry.target.id;
          const idx = slideIds.indexOf(id);
          dotBtns.forEach((d, i) => d.classList.toggle('active', i === idx));

          // Show nav & dots after intro slide
          if (id !== 'intro') {
            nav.classList.add('visible');
            dots.classList.add('visible');
          } else {
            nav.classList.remove('visible');
            dots.classList.remove('visible');
          }

          // Add scrolled class if past hero
          const heroIdx = slideIds.indexOf('hero');
          if (idx > heroIdx) {
            nav.classList.add('scrolled');
          } else {
            nav.classList.remove('scrolled');
          }
        }
      });
    }, {
      threshold: 0.55
    });

    slides.forEach(slide => observer.observe(slide));
  }


  /* ----------------------------------------
     NAVIGATION
     ---------------------------------------- */
  function initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }


  /* ----------------------------------------
     SECTION DOTS
     ---------------------------------------- */
  function initDots() {
    const dotBtns = document.querySelectorAll('.dot');

    dotBtns.forEach(dot => {
      dot.addEventListener('click', () => {
        const targetId = dot.getAttribute('data-target');
        const target = document.getElementById(targetId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }


  /* ----------------------------------------
     SMOOTH ANCHOR SCROLLING
     ---------------------------------------- */
  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }


  /* ----------------------------------------
     CONTACT FORM
     ---------------------------------------- */
  function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const btn = form.querySelector('button[type="submit"]');
      const origHTML = btn.innerHTML;

      btn.innerHTML = 'Sending...';
      btn.disabled = true;
      btn.style.opacity = '0.6';

      setTimeout(() => {
        btn.innerHTML = 'Message Sent ✓';
        btn.style.background = '#00b894';
        btn.style.boxShadow = '0 0 30px rgba(0,184,148,0.3)';
        form.reset();

        setTimeout(() => {
          btn.innerHTML = origHTML;
          btn.disabled = false;
          btn.style.opacity = '';
          btn.style.background = '';
          btn.style.boxShadow = '';
        }, 3000);
      }, 1200);
    });
  }

})();
