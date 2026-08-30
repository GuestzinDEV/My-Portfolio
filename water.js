/* =========================================================
   water.js — Animated interactive water footer
   Wave-layer approach + ripple circles on mouse interaction
   ========================================================= */

(function () {
  const canvas = document.getElementById('water-canvas');
  const ctx    = canvas.getContext('2d');

  let W = 0, H = 0, time = 0;
  const ripples = [];

  /* ── Wave definitions ── */
  const waveLayers = [
    { yRatio: 0.28, amp: 22, freq: 0.012, speed: 0.40, color: '#7C3AED', opacity: 0.55 },
    { yRatio: 0.38, amp: 17, freq: 0.018, speed: 0.55, color: '#6366F1', opacity: 0.45 },
    { yRatio: 0.48, amp: 13, freq: 0.009, speed: 0.30, color: '#06B6D4', opacity: 0.40 },
    { yRatio: 0.56, amp: 10, freq: 0.022, speed: 0.65, color: '#3B82F6', opacity: 0.35 },
    { yRatio: 0.64, amp:  7, freq: 0.015, speed: 0.45, color: '#8B5CF6', opacity: 0.28 },
    { yRatio: 0.72, amp:  5, freq: 0.028, speed: 0.80, color: '#818CF8', opacity: 0.20 },
  ];

  /* ── Resize ── */
  function resize() {
    const footer = canvas.closest('.water-footer') || canvas.parentElement;
    W = canvas.width  = footer.offsetWidth;
    H = canvas.height = footer.offsetHeight;
  }

  /* ── Draw single wave layer ── */
  function drawWave(layer) {
    const y0 = layer.yRatio * H;

    ctx.save();
    ctx.globalAlpha = layer.opacity;
    ctx.globalCompositeOperation = 'screen';

    ctx.beginPath();
    ctx.moveTo(0, y0);

    for (let x = 0; x <= W; x += 3) {
      const w1 = layer.amp * Math.sin(x * layer.freq + time * layer.speed);
      const w2 = (layer.amp * 0.45) * Math.sin(x * layer.freq * 1.7 + time * layer.speed * 0.8 + 1.3);
      ctx.lineTo(x, y0 + w1 + w2);
    }

    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();

    // Gradient fill from wave-top to bottom
    const grad = ctx.createLinearGradient(0, y0 - layer.amp, 0, H);
    grad.addColorStop(0,   layer.color + '00');
    grad.addColorStop(0.12, layer.color + 'CC');
    grad.addColorStop(1,   layer.color + '18');
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.restore();
  }

  /* ── Caustic shimmer lines ── */
  function drawCaustics() {
    ctx.save();
    ctx.globalAlpha = 0.07;
    ctx.globalCompositeOperation = 'screen';
    ctx.strokeStyle = '#a78bfa';
    ctx.lineWidth   = 1;

    for (let i = 0; i < 8; i++) {
      const y = H * (0.25 + i * 0.09) + Math.sin(time * 0.6 + i * 1.1) * 6;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 4) {
        const jitter = Math.sin(x * 0.025 + time * 0.9 + i * 0.8) * 5
                     + Math.sin(x * 0.014 + time * 0.5 + i * 1.5) * 3;
        x === 0 ? ctx.moveTo(x, y + jitter) : ctx.lineTo(x, y + jitter);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  /* ── Surface reflection of text ── */
  function drawReflection() {
    ctx.save();
    ctx.globalAlpha = 0.06;
    ctx.globalCompositeOperation = 'screen';
    ctx.font = 'bold 52px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#a78bfa';
    ctx.textAlign = 'center';

    // Wavy text reflection
    const textY = H * 0.58 + Math.sin(time * 0.5) * 4;
    ctx.scale(1, -0.6);
    ctx.fillText('Guester_DEV', W / 2, -textY);
    ctx.restore();
  }

  /* ── Ripple management ── */
  function addRipple(x, y, strength) {
    ripples.push({ x, y, r: 0, maxR: 70 + strength * 30, opacity: 0.7, speed: 2.5 + strength });
  }

  function drawRipples() {
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rp = ripples[i];
      rp.r       += rp.speed;
      rp.opacity -= 0.014;

      if (rp.opacity <= 0 || rp.r >= rp.maxR) {
        ripples.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = rp.opacity;
      ctx.globalCompositeOperation = 'screen';
      ctx.strokeStyle = '#818CF8';
      ctx.lineWidth   = 1.5;

      // Inner ring
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
      ctx.stroke();

      // Outer faint ring
      if (rp.r > 12) {
        ctx.globalAlpha = rp.opacity * 0.35;
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r * 1.4, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  /* ── Sparkle dots on wave crests ── */
  const sparkles = Array.from({ length: 28 }, () => ({
    x: Math.random(),
    phase: Math.random() * Math.PI * 2,
    size: Math.random() * 2.5 + 0.5,
    layer: Math.floor(Math.random() * waveLayers.length),
  }));

  function drawSparkles() {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    sparkles.forEach(s => {
      const layer = waveLayers[s.layer];
      const sx    = s.x * W;
      const baseY = layer.yRatio * H;
      const w1    = layer.amp * Math.sin(sx * layer.freq + time * layer.speed);
      const w2    = (layer.amp * 0.45) * Math.sin(sx * layer.freq * 1.7 + time * layer.speed * 0.8 + 1.3);
      const sy    = baseY + w1 + w2 - 2;
      const a     = (Math.sin(time * 1.2 + s.phase) * 0.45 + 0.55) * 0.6;

      ctx.globalAlpha = a;
      ctx.fillStyle   = '#c4b5fd';
      ctx.shadowBlur  = 10;
      ctx.shadowColor = '#818CF8';
      ctx.beginPath();
      ctx.arc(sx, sy, s.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  /* ── Auto-ripple timer ── */
  function scheduleAutoRipple() {
    const delay = 1200 + Math.random() * 2200;
    setTimeout(() => {
      const x = Math.random() * W;
      const y = Math.random() * H * 0.7;
      addRipple(x, y, Math.random());
      scheduleAutoRipple();
    }, delay);
  }

  /* ── Mouse / touch ── */
  let lastRippleTime = 0;
  canvas.addEventListener('mousemove', e => {
    const now  = Date.now();
    if (now - lastRippleTime < 80) return; // throttle
    lastRippleTime = now;
    const rect = canvas.getBoundingClientRect();
    addRipple(e.clientX - rect.left, e.clientY - rect.top, 0.4);
  });

  canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    addRipple(e.clientX - rect.left, e.clientY - rect.top, 1.0);
  });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const rect  = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    addRipple(touch.clientX - rect.left, touch.clientY - rect.top, 0.6);
  }, { passive: false });

  /* ── Render loop ── */
  function render() {
    ctx.clearRect(0, 0, W, H);

    // Dark water base
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#0A0A20');
    bg.addColorStop(1, '#07070E');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Ambient glow spot
    const glow = ctx.createRadialGradient(W * 0.5, H * 0.3, 0, W * 0.5, H * 0.3, W * 0.55);
    glow.addColorStop(0, 'rgba(99,102,241,0.08)');
    glow.addColorStop(1, 'rgba(99,102,241,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // Wave layers (back to front)
    [...waveLayers].reverse().forEach(drawWave);

    // Caustic shimmer lines
    drawCaustics();

    // Text reflection
    drawReflection();

    // Wave crest sparkles
    drawSparkles();

    // Interactive ripples
    drawRipples();

    time += 0.016;
    requestAnimationFrame(render);
  }

  /* ── Init ── */
  resize();
  window.addEventListener('resize', resize);
  scheduleAutoRipple();
  render();
})();
