(function () {
  const canvas = document.getElementById('fgfCanvas');
  const orbitEl = document.getElementById('fgfOrbit');
  const hubEl = document.getElementById('fgfHub');
  if (!canvas || !orbitEl) return;

  const ctx = canvas.getContext('2d');
  const projects = [
    { name: 'Desarmaduría FGF', tag: 'En vivo', grad: 'linear-gradient(135deg,#0f172a,#06b6d4)' },
    { name: 'Edo Tattoo', tag: 'Web', grad: 'linear-gradient(135deg,#18181b,#a855f7)' },
    { name: 'Turismo Histórico', tag: 'Plataforma', grad: 'linear-gradient(135deg,#422006,#fbbf24)', img: '../turismo-historico/assets/hero-talagante.jpg' },
    { name: 'App Generadora', tag: 'App', grad: 'linear-gradient(135deg,#7c3aed,#22d3ee)' },
    { name: 'Agro Fuenzalida', tag: 'Marca', grad: 'linear-gradient(135deg,#1E5631,#8BC53F)', img: '../clientes/agrofuenzalida/ENTREGA-CLIENTE/logo-agro-fuenzalida-final.png' },
    { name: 'Dojo Olimpo', tag: 'Demo', grad: 'linear-gradient(135deg,#450a0a,#ef4444)' },
    { name: 'Panadería El Trigo', tag: 'Demo', grad: 'linear-gradient(135deg,#78350f,#fcd34d)' },
    { name: 'Barbería · Taller', tag: 'Rubros', grad: 'linear-gradient(135deg,#1e1b4b,#818cf8)' },
  ];

  const chips = ['WhatsApp', 'Google', 'Admin', 'Catálogo', 'Reservas', 'Hosting FGF', 'Talagante'];
  const particles = [];
  const sparks = [];
  let w = 0;
  let h = 0;
  let mx = 0.5;
  let my = 0.5;
  let t = 0;
  let cx = 0;
  let cy = 0;
  const cards = [];

  function resize() {
    w = canvas.width = innerWidth;
    h = canvas.height = innerHeight;
    cx = w * 0.74;
    cy = h * 0.48;
  }

  function initParticles() {
    particles.length = 0;
    const n = Math.min(90, Math.floor((w * h) / 18000));
    for (let i = 0; i < n; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.4,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        hue: Math.random() > 0.5 ? 265 : 185,
      });
    }
  }

  function initCards() {
    orbitEl.innerHTML = '';
    cards.length = 0;
    projects.forEach((p, i) => {
      const el = document.createElement('article');
      el.className = 'orbit-card';

      const thumb = document.createElement('div');
      thumb.className = 'orbit-thumb';
      if (p.img) thumb.style.backgroundImage = 'url("' + p.img + '")';
      else thumb.style.background = p.grad;

      const meta = document.createElement('div');
      meta.className = 'orbit-meta';
      const tag = document.createElement('span');
      tag.className = 'orbit-tag';
      tag.textContent = p.tag;
      const strong = document.createElement('strong');
      strong.textContent = p.name;
      meta.appendChild(tag);
      meta.appendChild(strong);
      el.appendChild(thumb);
      el.appendChild(meta);
      orbitEl.appendChild(el);

      cards.push({ el, angle: (i / projects.length) * Math.PI * 2, speed: 0.00035 + (i % 3) * 0.00008, rx: 210 + (i % 2) * 40, ry: 150 + (i % 3) * 25, z: 0 });
    });

    chips.forEach((label, i) => {
      const s = document.createElement('span');
      s.className = 'orbit-chip';
      s.textContent = label;
      s.style.setProperty('--chip-i', i);
      orbitEl.appendChild(s);
      cards.push({ el: s, angle: (i / chips.length) * Math.PI * 2 + 0.4, speed: 0.00055, rx: 290, ry: 210, z: 0, chip: true });
    });
  }

  function drawCanvas() {
    ctx.clearRect(0, 0, w, h);

    const gx = cx + (mx - 0.5) * 30;
    const gy = cy + (my - 0.5) * 20;
    const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, Math.min(w, h) * 0.42);
    g.addColorStop(0, 'rgba(124, 58, 237, 0.14)');
    g.addColorStop(0.45, 'rgba(6, 182, 212, 0.08)');
    g.addColorStop(1, 'rgba(244, 244, 242, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(124, 58, 237, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(gx, gy, 240, 170, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(gx, gy, 310, 220, 0.3, 0, Math.PI * 2);
    ctx.stroke();

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;
      ctx.fillStyle = 'hsla(' + p.hue + ', 70%, 58%, 0.35)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    const hubs = [{ x: gx, y: gy }];
    cards.forEach((c) => {
      if (c.chip) return;
      const rect = c.el.getBoundingClientRect();
      hubs.push({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    });

    for (let i = 1; i < hubs.length; i++) {
      ctx.strokeStyle = 'rgba(29, 29, 31, 0.06)';
      ctx.beginPath();
      ctx.moveTo(hubs[0].x, hubs[0].y);
      ctx.lineTo(hubs[i].x, hubs[i].y);
      ctx.stroke();
    }

    sparks.forEach((s, i) => {
      s.life -= 0.02;
      s.x += s.vx;
      s.y += s.vy;
    });
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      if (s.life <= 0) sparks.splice(i, 1);
      else {
        ctx.fillStyle = 'rgba(61, 214, 195, ' + s.life + ')';
        ctx.fillRect(s.x, s.y, 2, 2);
      }
    }

    if (Math.random() < 0.02) {
      sparks.push({
        x: gx + (Math.random() - 0.5) * 120,
        y: gy + (Math.random() - 0.5) * 80,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: 1,
      });
    }
  }

  function layoutCards() {
    const mobile = w < 900;
    const px = (mx - 0.5) * (mobile ? 10 : 22);
    const py = (my - 0.5) * (mobile ? 8 : 14);
    cx = w * (mobile ? 0.5 : 0.74) + px;
    cy = h * (mobile ? 0.38 : 0.48) + py;

    cards.forEach((c) => {
      c.angle += c.speed;
      const rx = mobile ? c.rx * 0.55 : c.rx;
      const ry = mobile ? c.ry * 0.45 : c.ry;
      const x = cx + Math.cos(c.angle) * rx - (c.chip ? 40 : 70);
      const y = cy + Math.sin(c.angle) * ry - (c.chip ? 12 : 36);
      const depth = (Math.sin(c.angle) + 1) / 2;
      const scale = c.chip ? 0.85 + depth * 0.15 : 0.88 + depth * 0.12;
      const opacity = c.chip ? 0.45 + depth * 0.45 : 0.72 + depth * 0.28;
      c.el.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + scale + ')';
      c.el.style.opacity = opacity;
      c.el.style.zIndex = String(Math.floor(depth * 20));
    });

    if (hubEl) {
      hubEl.style.transform = 'translate(' + (cx - 52) + 'px,' + (cy - 52) + 'px)';
    }
  }

  function tick() {
    t += 1;
    drawCanvas();
    layoutCards();
    requestAnimationFrame(tick);
  }

  addEventListener('mousemove', (e) => {
    mx = e.clientX / innerWidth;
    my = e.clientY / innerHeight;
  });

  addEventListener('resize', () => {
    resize();
    initParticles();
  });

  resize();
  initParticles();
  initCards();
  tick();
})();
