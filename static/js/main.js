/* =========================================================
   main.js — Cursor, scroll-reveal, stagger, interactions
   ========================================================= */

(function () {

  /* ─────────────────────────────────────────
     1. CUSTOM CURSOR
  ───────────────────────────────────────── */
  const cursor     = document.getElementById('cursor');
  const cursorRing = document.getElementById('cursor-ring');

  if (cursor && cursorRing) {
    let cx = -100, cy = -100;   // cursor dot (snappy)
    let rx = -100, ry = -100;   // ring (laggy)

    document.addEventListener('mousemove', e => {
      cx = e.clientX;
      cy = e.clientY;
    });

    document.addEventListener('mouseleave', () => {
      cursor.style.opacity     = '0';
      cursorRing.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      cursor.style.opacity     = '1';
      cursorRing.style.opacity = '1';
    });

    // Hover state on interactive elements
    const hoverTargets = document.querySelectorAll('a, .project-card:not(.no-link):not(.coming-soon), .tag');
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('active');
        cursorRing.classList.add('active');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('active');
        cursorRing.classList.remove('active');
      });
    });

    // Animate ring with lerp
    (function animCursor() {
      rx += (cx - rx) * 0.1;
      ry += (cy - ry) * 0.1;

      cursor.style.left     = cx + 'px';
      cursor.style.top      = cy + 'px';
      cursorRing.style.left = rx + 'px';
      cursorRing.style.top  = ry + 'px';

      requestAnimationFrame(animCursor);
    })();
  }

  /* ─────────────────────────────────────────
     2. SCROLL REVEAL — staggered cards
  ───────────────────────────────────────── */
  const aosItems = document.querySelectorAll('[data-aos]');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      // Find sibling index for stagger
      const parent   = entry.target.parentElement;
      const siblings = [...parent.querySelectorAll('[data-aos]')];
      const idx      = siblings.indexOf(entry.target);

      setTimeout(() => {
        entry.target.classList.add('visible');
      }, idx * 90);

      revealObserver.unobserve(entry.target);
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px',
  });

  aosItems.forEach(el => revealObserver.observe(el));

  /* ─────────────────────────────────────────
     3. HERO PARALLAX (subtle)
  ───────────────────────────────────────── */
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (scrollY < window.innerHeight) {
        heroContent.style.transform = `translateY(${scrollY * 0.18}px)`;
        heroContent.style.opacity   = 1 - scrollY / (window.innerHeight * 0.8);
      }
    }, { passive: true });
  }

  /* ─────────────────────────────────────────
     4. CARD TILT (3-D perspective on hover)
  ───────────────────────────────────────── */
  const tiltCards = document.querySelectorAll('.project-card:not(.no-link):not(.coming-soon)');

  tiltCards.forEach(card => {
    let rect;

    card.addEventListener('mouseenter', () => {
      rect = card.getBoundingClientRect();
    });

    card.addEventListener('mousemove', e => {
      if (!rect) return;
      const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 12;
      const y = ((e.clientY - rect.top)  / rect.height - 0.5) * -10;
      card.style.transform = `translateY(-10px) perspective(800px) rotateX(${y}deg) rotateY(${x}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      rect = null;
    });
  });

  /* ─────────────────────────────────────────
     5. GLINT on hover (light sweep)
  ───────────────────────────────────────── */
  tiltCards.forEach(card => {
    let glint = card.querySelector('.glint');
    if (!glint) {
      glint = document.createElement('div');
      glint.className = 'glint';
      Object.assign(glint.style, {
        position:   'absolute',
        inset:      '0',
        background: 'linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.055) 50%, transparent 70%)',
        backgroundSize: '200% 100%',
        backgroundPosition: '200% 0',
        zIndex:     '3',
        transition: 'background-position 0.55s ease',
        pointerEvents: 'none',
        borderRadius: 'inherit',
      });
      card.appendChild(glint);
    }

    card.addEventListener('mouseenter', () => {
      glint.style.backgroundPosition = '-50% 0';
    });
    card.addEventListener('mouseleave', () => {
      glint.style.backgroundPosition = '200% 0';
    });
  });

  /* ─────────────────────────────────────────
     6. TAGS typing-cursor blink effect
  ───────────────────────────────────────── */
  const tags = document.querySelectorAll('.tag');
  tags.forEach((tag, i) => {
    tag.style.animationDelay = i * 0.12 + 's';
  });

  /* ─────────────────────────────────────────
     7. SECTION TITLE gradient reveal
  ───────────────────────────────────────── */
  const sectionTitle = document.querySelector('.section-title');
  if (sectionTitle) {
    const titleObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        sectionTitle.style.transition = 'opacity 0.9s ease, transform 0.9s cubic-bezier(0.16,1,0.3,1)';
        sectionTitle.style.opacity    = '1';
        sectionTitle.style.transform  = 'translateY(0)';
        titleObserver.disconnect();
      }
    }, { threshold: 0.3 });

    Object.assign(sectionTitle.style, {
      opacity:   '0',
      transform: 'translateY(24px)',
    });
    titleObserver.observe(sectionTitle);
  }

  /* ─────────────────────────────────────────
     8. Section label reveal
  ───────────────────────────────────────── */
  const sectionLabel = document.querySelector('.section-label');
  if (sectionLabel) {
    const labelObs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        sectionLabel.style.transition = 'opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s';
        sectionLabel.style.opacity    = '1';
        sectionLabel.style.transform  = 'translateX(0)';
        labelObs.disconnect();
      }
    }, { threshold: 0.3 });

    Object.assign(sectionLabel.style, {
      opacity:   '0',
      transform: 'translateX(-16px)',
    });
    labelObs.observe(sectionLabel);
  }

})();
;��──────────────────── */
  let isDragging = false;
  const selectedChars = new Set();

  function clearAllHighlights() {
    selectedChars.forEach(char => char.classList.remove('is-holding'));
    selectedChars.clear();
  }

  function handlePointerMove(e) {
    if (!isDragging) return;
    const target = document.elementFromPoint(e.clientX, e.clientY);

    if (target && target.classList.contains('char-interactive')) {
      if (!selectedChars.has(target)) {
        selectedChars.add(target);
        target.classList.add('is-holding');
      }
    }
  }

  function splitTextToChars(element) {
    if (!element || element.dataset.charsProcessed) return;

    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
    const textNodes = [];
    let node;

    while ((node = walker.nextNode())) {
      if (node.parentElement.closest('svg, script, style, code, button')) continue;
      textNodes.push(node);
    }

    textNodes.forEach((textNode) => {
      const text = textNode.nodeValue;
      if (!text || !text.trim()) return;

      const fragment = document.createDocumentFragment();
      const words = text.split(/(\s+)/);

      words.forEach(word => {
        if (word.trim() === '') {
          fragment.appendChild(document.createTextNode(word));
        } else {
          const wordSpan = document.createElement('span');
          wordSpan.style.display = 'inline-block';
          wordSpan.style.whiteSpace = 'nowrap'; 

          for (let i = 0; i < word.length; i++) {
            const charSpan = document.createElement('span');
            charSpan.className = 'char-interactive';
            charSpan.textContent = word[i];

            charSpan.addEventListener('pointerdown', () => {
              isDragging = true;
              clearAllHighlights();
              selectedChars.add(charSpan);
              charSpan.classList.add('is-holding');
            });

            wordSpan.appendChild(charSpan);
          }
          fragment.appendChild(wordSpan);
        }
      });

      textNode.parentNode.replaceChild(fragment, textNode);
    });

    element.dataset.charsProcessed = "true";
  }

  window.addEventListener('pointermove', handlePointerMove, { passive: true });
  window.addEventListener('pointerup', () => {
    isDragging = false;
    clearAllHighlights();
  });
  window.addEventListener('pointercancel', () => {
    isDragging = false;
    clearAllHighlights();
  });

  const interactiveTextSelectors = '.hero-title, .hero-desc, .section-title, .card-title, .tag, p';
  const textElements = document.querySelectorAll(interactiveTextSelectors);
  textElements.forEach((el) => splitTextToChars(el));

})();
ceChild(fragment, textNode);
    });

    element.dataset.charsProcessed = "true";
  }

  // Eventos globais do ponteiro para manter e soltar a trilha
  window.addEventListener('pointermove', handlePointerMove, { passive: true });
  window.addEventListener('pointerup', () => {
    isDragging = false;
    clearAllHighlights();
  });
  window.addEventListener('pointercancel', () => {
    isDragging = false;
    clearAllHighlights();
  });

  // Alvos do efeito (adicione outras classes se quiser)
  const interactiveTextSelectors = '.hero-title, .hero-desc, .section-title, .card-title, .tag, p';
  const textElements = document.querySelectorAll(interactiveTextSelectors);
  textElements.forEach((el) => splitTextToChars(el));

})();
);

})();
splitTextToChars(el));

})();

