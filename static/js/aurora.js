/* =========================================================
   aurora.js — Interactive northern-lights hero background (Optimized)
   ========================================================= */

(function () {
  const canvas = document.getElementById('aurora-canvas');
  if (!canvas) return;

  // Contexto sem opacidade para evitar overhead de composição do navegador
  const ctx = canvas.getContext('2d', { alpha: false });

  let W = 0, H = 0, time = 0, isVisible = true;
  let vignetteGrad = null;
  const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };

  /* ── Interrompe o loop quando fora de tela ── */
  const observer = new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting;
    if (isVisible) requestAnimationFrame(render);
  });
  observer.observe(canvas);

  /* ── Aurora band definitions ── */
  const bands = [
    { yBase: 0.22, amp: 0.09, freq: 1.3, speed: 0.38, color: '#6366F1', bw: 0.38, opacity: 0.72 },
    { yBase: 0.32, amp: 0.07, freq: 0.85, speed: 0.28, color: '#06B6D4', bw: 0.30, opacity: 0.55 },
    { yBase: 0.18, amp: 0.11, freq: 1.55, speed: 0.50, color: '#7C3AED', bw: 0.28, opacity: 0.60 },
    { yBase: 0.40, amp: 0.06, freq: 1.05, speed: 0.33, color: '#EC4899', bw: 0.22, opacity: 0.38 },
    { yBase: 0.14, amp: 0.05, freq: 0.70, speed: 0.22, color: '#10B981', bw: 0.18, opacity: 0.28 },
    { yBase: 0.28, amp: 0.08, freq: 1.20, speed: 0.42, color: '#818CF8', bw: 0.25, opacity: 0.45 },
  ];

  /* ── Floating particles ── */
  const PARTICLE_COUNT = 90;
  const colors = ['#6366F1','#06B6D4','#7C3AED','#EC4899','#818CF8'];
  const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random(),
    y: Math.random() * 0.65,
    r: Math.random() * 1.8 + 0.4,
    speed: Math.random() * 0.0002 + 0.00006,
    phase: Math.random() * Math.PI * 2,
    drift: (Math.random() - 0.5) * 0.00003,
    color: colors[Math.floor(Math.random() * colors.length)],
    opacity: Math.random() * 0.55 + 0.15,
  }));

  /* ── Resize & Cache ── */
  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;

    // Cache do Gradiente da Vinheta (criado apenas no resize)
    vignetteGrad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.75);
    vignetteGrad.addColorStop(0, 'rgba(7,7,16,0)');
    vignetteGrad.addColorStop(1, 'rgba(7,7,16,0.65)');

    // Cache dos gradientes das bandas
    bands.forEach(band => {
      const hGrad = ctx.createLinearGradient(0, 0, W, 0);
      hGrad.addColorStop(0,    band.color + '00');
      hGrad.addColorStop(0.12, band.color + 'BB');
      hGrad.addColorStop(0.88, band.color + 'BB');
      hGrad.addColorStop(1,    band.color + '00');
      band.cachedGrad = hGrad;
    });
  }

  /* ── Mouse tracking ── */
  window.addEventListener('mousemove', e => {
    mouse.tx = e.clientX / window.innerWidth;
    mouse.ty = e.clientY / window.innerHeight;
  }, { passive: true });

  /* ── Draw one aurora band ── */
  function drawBand(band) {
    const mx   = (mouse.x - 0.5) * 0.06;
    const yMid = (band.yBase + mx * 0.4) * H;
    const bh   = band.bw * H;

    ctx.save();
    ctx.globalAlpha              = band.opacity;
    ctx.globalCompositeOperation = 'screen';

    // 60 pontos são suficientes para manter a curva perfeitamente suave
    const steps = 60;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const px = (i / steps) * W;
      const t1 = Math.sin(i * band.freq * 0.09 + time * band.speed + mx * 8);
      const t2 = Math.sin(i * band.freq * 0.06 + time * band.speed * 1.4 + 1.8);
      const py = yMid + (t1 * 0.7 + t2 * 0.3) * band.amp * H;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    for (let i = steps; i >= 0; i--) {
      const px = (i / steps) * W;
      const t1 = Math.sin(i * band.freq * 0.09 + time * band.speed + mx * 8);
      const t2 = Math.sin(i * band.freq * 0.06 + time * band.speed * 1.4 + 1.8);
      const py = yMid + (t1 * 0.7 + t2 * 0.3) * band.amp * H + bh;
      ctx.lineTo(px, py);
    }
    ctx.closePath();

    ctx.clip();
    ctx.fillStyle = band.cachedGrad;
    ctx.fillRect(0, 0, W, H);

    ctx.restore();
  }

  /* ── Draw particles ── */
  function drawParticles() {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    particles.forEach(p => {
      p.x += p.speed + p.drift;
      if (p.x > 1) p.x -= 1;

      const px = p.x * W;
      const py = p.y * H + Math.sin(time * 0.6 + p.phase) * 18;
      const a  = (Math.sin(time * 0.8 + p.phase) * 0.35 + 0.65) * p.opacity;

      ctx.globalAlpha = a;
      ctx.fillStyle   = p.color;
      ctx.beginPath();
      ctx.arc(px, py, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  /* ── Vignette overlay ── */
  function drawVignette() {
    ctx.fillStyle = vignetteGrad;
    ctx.fillRect(0, 0, W, H);
  }

  /* ── Main render loop ── */
  function render() {
    if (!isVisible) return;

    mouse.x += (mouse.tx - mouse.x) * 0.06;
    mouse.y += (mouse.ty - mouse.y) * 0.06;

    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = '#070710';
    ctx.fillRect(0, 0, W, H);

    bands.forEach(drawBand);
    drawParticles();
    drawVignette();

    time += 0.012;
    requestAnimationFrame(render);
  }

  /* ── Init ── */
  resize();
  window.addEventListener('resize', resize, { passive: true });
  render();
})();
