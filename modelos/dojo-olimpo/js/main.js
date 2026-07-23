/* ═══════════════════════════════════════════════════════════════
   DOYO OLIMPO — Main JS
   Three.js background + Modal reservas + Scroll animations + API
   ═══════════════════════════════════════════════════════════════ */

// ═══ CONFIG ═══
const CONFIG = {
  whatsapp: '56993550082', // Número real del dueño
  email: 'info@doyoolimpo.cl',
  direccion: 'Venus 1584, Quinta Normal, Santiago',
  mapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3329.5!2d-70.6933!3d-33.4264!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662c5b5c5b5c5b5%3A0x5c5b5c5b5c5b5c5b!2sVenus%201584%2C%20Quinta%20Normal!5e0!3m2!1ses!2scl!4v1784756028',
  apiEndpoint: '/api/reservas', // Backend endpoint
  clases: [
    { id: 'funcional', nombre: 'Funcional', icon: '💪', color: 'gold', desc: 'Entrenamiento funcional de alta intensidad. Fuerza, cardio y movilidad en circuitos variados.', precio: 'Incluido en plan' },
    { id: 'openbox', nombre: 'Open Box', icon: '🏋️', color: 'green', desc: 'Acceso libre al box. Entrena a tu ritmo con todo el equipamiento disponible.', precio: 'Incluido en plan' },
    { id: 'personal', nombre: 'Entrenamiento Personal', icon: '🎯', color: 'gold', desc: 'Sesiones 1 a 1 con coach certificado. Plan personalizado según tus objetivos.', precio: 'Consultar' }
  ],
  horarios: {
    '19:30': { lunes: 'funcional', martes: 'funcional', miercoles: 'funcional', jueves: 'funcional', viernes: 'funcional', sabado: 'empty' }
  },
  planes: [
    { id: 'dropin', nombre: 'Drop-in', tag: 'Visita única', precio: '$8.000', features: ['1 clase Funcional u Open Box', 'Acceso a todo el equipamiento', 'Válido por 1 día', 'Sin compromiso'], notIncluded: ['Evaluación inicial', 'App de reservas', 'Descuentos en suplementos', 'Merch'], popular: false },
    { id: 'mensual', nombre: 'Mensual Ilimitado', tag: 'Más elegido', precio: '$45.000', features: ['Clases ilimitadas todo el mes', 'Open Box horario extendido', 'App de reservas prioritaria', '1 evaluación inicial InBody', '10% desc. en suplementos', 'Acceso a eventos exclusivos', 'Clase de prueba para un amigo'], notIncluded: ['Plan nutricional personalizado', 'Entrenamiento 1 a 1', 'Merch incluido'], popular: true },
    { id: 'trimestral', nombre: 'Trimestral', tag: 'Mejor precio', precio: '$120.000', features: ['Todo lo del Mensual Ilimitado', '3 meses por precio de 2.6', 'Evaluación InBody mensual', 'Plan nutricional básico incluido', 'Merch Dojo Olimpo (remera + shaker)', 'Clase de prueba para 2 amigos', 'Prioridad en horarios pico'], notIncluded: ['Plan nutricional avanzado', 'Entrenamiento 1 a 1 dedicado'], popular: false },
    { id: 'personal', nombre: 'Pack Personal', tag: '1 a 1', precio: '$180.000', features: ['8 sesiones 1 a 1 por mes (2/semana)', 'Plan 100% personalizado a tus objetivos', 'Seguimiento nutricional completo', 'Acceso Open Box ilimitado incluido', 'Coach dedicado por WhatsApp 24/7', 'Evaluación InBody quincenal', 'Plan de movilidad y prevención'], notIncluded: ['Sesiones extra sin cargo', 'Entrenamiento a domicilio'], popular: false }
  ],
  testimonios: [
    { nombre: 'Carlos M.', texto: 'Llevo 8 meses y cambié mi físico completamente. Los coaches saben lo que hacen y el ambiente es increíble.', stars: 5, tipo: 'Funcional' },
    { nombre: 'Paula R.', texto: 'Empecé sin saber nada y hoy hago muscle-ups. La progresión es real, no te dejan estancar.', stars: 5, tipo: 'Funcional' },
    { nombre: 'Diego A.', texto: 'El open box a las 6am es mi terapia. Equipo completo, buena música, gente que entrena en serio.', stars: 5, tipo: 'Open Box' },
    { nombre: 'Sofía V.', texto: 'Entrenamiento personal valió cada peso. En 3 meses logré lo que en 2 años sola no conseguía.', stars: 5, tipo: 'Personal' }
  ],
  galeria: [
    'imagenes/gym-1.jpg', 'imagenes/gym-2.jpg', 'imagenes/gym-3.jpg',
    'imagenes/gym-4.jpg', 'imagenes/gym-5.jpg', 'imagenes/gym-6.jpg',
    'imagenes/gym-7.jpg', 'imagenes/gym-8.jpg', 'imagenes/gym-9.jpg'
  ]
};

// ═══ THREE.JS BACKGROUND ═══
let threeScene, threeCamera, threeRenderer, particles, animationId;
function initThree() {
  const canvas = document.getElementById('three-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  threeScene = new THREE.Scene();
  threeCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
  threeCamera.position.z = 50;

  threeRenderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  threeRenderer.setSize(window.innerWidth, window.innerHeight);
  threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Partículas
  const geometry = new THREE.BufferGeometry();
  const count = 1500;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  const colorGold = new THREE.Color(0xd4a843);
  const colorGoldLight = new THREE.Color(0xe8c56d);
  const colorGoldDark = new THREE.Color(0xb8923a);

  for (let i = 0; i < count; i++) {
    const radius = 15 + Math.random() * 35;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);

    const colorChoice = Math.random();
    if (colorChoice < 0.4) colors.set([colorGold.r, colorGold.g, colorGold.b], i * 3);
    else if (colorChoice < 0.7) colors.set([colorGoldLight.r, colorGoldLight.g, colorGoldLight.b], i * 3);
    else colors.set([colorGoldDark.r, colorGoldDark.g, colorGoldDark.b], i * 3);

    sizes[i] = 0.5 + Math.random() * 1.5;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    size: 1.2, vertexColors: true, transparent: true, opacity: 0.6,
    sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false
  });

  particles = new THREE.Points(geometry, material);
  threeScene.add(particles);

  // Luz ambiente sutil
  const ambient = new THREE.AmbientLight(0xffffff, 0.3);
  threeScene.add(ambient);

  animateThree();
  window.addEventListener('resize', onThreeResize);
}
function animateThree() {
  animationId = requestAnimationFrame(animateThree);
  if (particles) {
    particles.rotation.y += 0.00015;
    particles.rotation.x += 0.00008;
    const time = Date.now() * 0.0003;
    particles.rotation.z = Math.sin(time * 0.5) * 0.02;
  }
  threeRenderer?.render(threeScene, threeCamera);
}
function onThreeResize() {
  if (!threeCamera || !threeRenderer) return;
  threeCamera.aspect = window.innerWidth / window.innerHeight;
  threeCamera.updateProjectionMatrix();
  threeRenderer.setSize(window.innerWidth, window.innerHeight);
}

// ═══ SCROLL REVEAL ═══
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ═══ NAVBAR ═══
function initNavbar() {
  const nav = document.querySelector('.nav-bar');
  const toggle = document.getElementById('menuBtn');
  const links = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });

  toggle?.addEventListener('click', () => links?.classList.toggle('open'));

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
        links?.classList.remove('open');
      }
    });
  });
}

// ═══ RENDER DINÁMICO ═══
function renderClases() {
  const grid = document.getElementById('classesGrid');
  if (!grid) return;
  grid.innerHTML = CONFIG.clases.map((clase, i) => `
    <article class="card class-card ${clase.id} reveal reveal-d${(i % 6) + 1}">
      <span class="icon">${clase.icon}</span>
      <div class="tag">${clase.nombre}</div>
      <h3>${clase.nombre}</h3>
      <p>${clase.desc}</p>
      <div class="price">${clase.precio}</div>
    </article>
  `).join('');
}

function renderHorarios() {
  const tbody = document.querySelector('#horariosTable tbody');
  if (!tbody) return;
  const horas = Object.keys(CONFIG.horarios).sort((a, b) => {
    const ha = parseInt(a.split(':')[0]);
    const hb = parseInt(b.split(':')[0]);
    return ha - hb;
  });
  const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
  const diaLabels = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

  tbody.innerHTML = horas.map(hora => {
    const slots = CONFIG.horarios[hora];
    return `
      <tr>
        <td class="time-col" style="font-weight:800;color:#d4a843 !important;font-size:16px;background:rgba(212,168,67,0.12);padding:12px;text-align:center;border-bottom:1px solid var(--card-border);">${hora}</td>
        ${dias.map((dia, i) => {
          const tipo = slots[dia];
          if (!tipo || tipo === 'empty') return '<td><span class="slot empty">—</span></td>';
          const clase = CONFIG.clases.find(c => c.id === tipo);
          return `<td><span class="slot ${tipo}">${clase?.icon || '•'} ${clase?.nombre || tipo}</span></td>`;
        }).join('')}
      </tr>
    `;
  }).join('');
}

function renderPlanes() {
  const grid = document.getElementById('planesGrid');
  if (!grid) return;
  grid.innerHTML = CONFIG.planes.map((plan, i) => `
    <article class="card plan-card ${plan.popular ? 'popular' : ''} reveal reveal-d${(i % 6) + 1}">
      ${plan.popular ? '<div class="popular-badge" style="position:absolute;top:-12px;right:16px;background:var(--gradient);color:white;padding:4px 12px;border-radius:20px;font-size:10px;font-weight:700;">MÁS POPULAR</div>' : ''}
      <div class="tag">${plan.tag}</div>
      <h4>${plan.nombre}</h4>
      <div class="price">${plan.precio}<span style="font-size:14px;font-weight:400;color:var(--gray);">/mes</span></div>
      <ul>${plan.features.map(f => `<li>${f}</li>`).join('')}</ul>
      <button class="btn ${plan.popular ? 'btn-primary' : 'btn-outline'}" style="margin-top:16px;width:100%;" onclick="openReserva('${plan.id}')">
        ${plan.popular ? 'Empezar ahora' : 'Elegir este plan'}
      </button>
    </article>
  `).join('');
}

function renderGaleria() {
  const grid = document.getElementById('galeriaGrid');
  if (!grid) return;
  grid.innerHTML = CONFIG.galeria.map((img, i) => `
    <div class="galeria-item reveal reveal-d${(i % 6) + 1}" style="aspect-ratio:4/3;border-radius:12px;overflow:hidden;background:var(--card);border:1px solid var(--card-border);cursor:pointer;transition:var(--trans);" onclick="openLightbox('${img}')">
      <img src="${img}" alt="Dojo Olimpo" style="width:100%;height:100%;object-fit:cover;transition:transform 0.5s;" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
      <div style="display:none;align-items:center;justify-content:center;height:100%;color:var(--dim);font-size:2rem;">🏋️</div>
    </div>
  `).join('');

  // Hover zoom
  grid.querySelectorAll('.galeria-item').forEach(item => {
    item.addEventListener('mouseenter', () => item.querySelector('img')?.style.transform = 'scale(1.1)');
    item.addEventListener('mouseleave', () => item.querySelector('img')?.style.transform = 'scale(1)');
  });
}

function renderTestimonios() {
  const slider = document.getElementById('testimoniosSlider');
  if (!slider) return;
  slider.innerHTML = CONFIG.testimonios.map((t, i) => `
    <div class="testimonio-card card reveal reveal-d${(i % 6) + 1}" style="padding:24px;">
      <div class="stars" style="color:var(--gold);font-size:14px;margin-bottom:8px;">${'★'.repeat(t.stars)}</div>
      <p style="font-style:italic;color:var(--gray);line-height:1.6;margin-bottom:12px;">"${t.texto}"</p>
      <div class="author" style="font-weight:600;color:var(--lgray);display:flex;align-items:center;gap:8px;">
        <span>${t.nombre}</span>
        <span style="font-size:11px;color:var(--dim);background:rgba(124,58,237,0.1);padding:2px 8px;border-radius:20px;">${t.tipo}</span>
      </div>
    </div>
  `).join('');
}

// ═══ MODAL RESERVA ═══
let currentPlan = null;
function openReserva(planId = null) {
  currentPlan = planId;
  const modal = document.getElementById('modalReserva');
  const form = document.getElementById('reservaForm');
  const success = document.getElementById('modalSuccess');

  if (!modal) return;
  form.style.display = 'block';
  success.style.display = 'none';
  form.reset();

  // Prellenar tipo de clase si viene de plan
  const claseSelect = document.getElementById('reservaClase');
  if (planId && claseSelect) {
    const plan = CONFIG.planes.find(p => p.id === planId);
    if (plan) {
      // Marcar la primera opción por defecto
      claseSelect.value = CONFIG.clases[0].id;
    }
  }

  // Llenar opciones de clase
  const claseOptions = document.getElementById('claseOptions');
  if (claseOptions) {
    claseOptions.innerHTML = CONFIG.clases.map(c => `
      <label class="radio-option" style="display:flex;align-items:center;gap:8px;padding:10px 14px;border:1px solid var(--card-border);border-radius:10px;cursor:pointer;transition:var(--trans);margin:4px 0;">
        <input type="radio" name="clase" value="${c.id}" ${c.id === CONFIG.clases[0].id ? 'checked' : ''} style="accent-color:var(--purple);">
        <span style="display:flex;flex-direction:column;gap:2px;">
          <strong>${c.icon} ${c.nombre}</strong>
          <small style="color:var(--gray);">${c.desc}</small>
        </span>
      </label>
    `).join('');
  }

  // Llenar horarios disponibles
  const horarioGrid = document.getElementById('horarioGrid');
  if (horarioGrid) {
    const horas = Object.keys(CONFIG.horarios).sort((a,b) => parseInt(a)-parseInt(b));
    horarioGrid.innerHTML = horas.map(h => `
      <button type="button" class="horario-btn" data-hora="${h}" style="padding:10px 14px;border:1px solid var(--card-border);background:var(--card);border-radius:10px;font-size:13px;font-weight:600;color:var(--gray);cursor:pointer;transition:var(--trans);min-width:80px;" onclick="selectHorario(this,'${h}')">${h}</button>
    `).join('');
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  modal.querySelector('input')?.focus();
}
function closeReserva() {
  const modal = document.getElementById('modalReserva');
  modal?.classList.remove('open');
  document.body.style.overflow = '';
}
function selectHorario(btn, hora) {
  document.querySelectorAll('.horario-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  btn.style.borderColor = 'var(--purple)';
  btn.style.background = 'rgba(124,58,237,0.15)';
  btn.style.color = 'var(--purple3)';
  document.getElementById('reservaHora').value = hora;
}

// ═══ FORM SUBMIT ═══
async function handleReserva(e) {
  e.preventDefault();
  const btn = document.getElementById('btnEnviarReserva');
  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);

  // Validación básica
  if (!data.nombre || !data.telefono || !data.clase || !data.hora) {
    showToast('Completa todos los campos obligatorios', 'error');
    return;
  }

  btn.disabled = true;
  btn.querySelector('.btn-text').style.display = 'none';
  btn.querySelector('.btn-loading').style.display = 'inline-flex';

  try {
    // TODO: Conectar con backend real
    // const response = await fetch(CONFIG.apiEndpoint, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) });

    // Simulación exitosa
    await new Promise(r => setTimeout(r, 1000));

    // Guardar en localStorage para admin panel
    const reservas = JSON.parse(localStorage.getItem('doyo_reservas') || '[]');
    reservas.push({ ...data, id: Date.now(), fecha: new Date().toISOString(), plan: currentPlan, estado: 'pendiente' });
    localStorage.setItem('doyo_reservas', JSON.stringify(reservas));

    // Enviar WhatsApp al dueño
    const msg = encodeURIComponent(`🏋️ NUEVA RESERVA - Dojo Olimpo\n\n👤 ${data.nombre}\n📱 ${data.telefono}\n📧 ${data.email || '—'}\n💪 Clase: ${CONFIG.clases.find(c=>c.id===data.clase)?.nombre}\n🕐 Horario: ${data.hora}\n📝 ${data.mensaje || 'Sin comentarios'}\n\nConfirmar por WhatsApp`);
    window.open(`https://wa.me/${CONFIG.whatsapp}?text=${msg}`, '_blank');

    // Mostrar éxito
    form.style.display = 'none';
    document.getElementById('modalSuccess').style.display = 'block';
    showToast('¡Reserva enviada! Te contactamos por WhatsApp', 'success');

  } catch (err) {
    showToast('Error al enviar. Intenta por WhatsApp directo', 'error');
  } finally {
    btn.disabled = false;
    btn.querySelector('.btn-text').style.display = 'inline';
    btn.querySelector('.btn-loading').style.display = 'none';
  }
}

// ═══ TOAST NOTIFICATIONS ═══
function showToast(message, type = 'info', title = '') {
  const container = document.getElementById('toastContainer') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
    <div class="toast-content">
      ${title ? `<div class="toast-title">${title}</div>` : ''}
      <div class="toast-message">${message}</div>
    </div>
  `;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 5000);
}
function createToastContainer() {
  const c = document.createElement('div');
  c.id = 'toastContainer';
  c.style.cssText = 'position:fixed;bottom:90px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;pointer-events:none;';
  document.body.appendChild(c);
  return c;
}

// ═══ LIGHTBOX GALERÍA ═══
function openLightbox(src) {
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = `<img src="${src}" alt=""><button class="lb-close" onclick="this.parentElement.remove()">&times;</button>`;
  lb.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.95);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;cursor:zoom-out;animation:fadeIn 0.2s ease;';
  lb.onclick = e => { if (e.target === lb) lb.remove(); };
  document.body.appendChild(lb);
  document.body.style.overflow = 'hidden';
  lb.querySelector('img').onload = () => lb.style.cursor = 'zoom-out';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') document.querySelector('.lightbox')?.remove(); document.getElementById('modalReserva')?.classList.remove('open'); document.body.style.overflow = ''; });

// ═══ WHATSAPP FLOAT TOOLTIP ═══
function initWhatsAppFloat() {
  const wa = document.querySelector('.whatsapp-float');
  if (!wa) return;
  let hideTimer;
  wa.addEventListener('mouseenter', () => { clearTimeout(hideTimer); wa.querySelector('.wa-tooltip')?.classList.add('show'); });
  wa.addEventListener('mouseleave', () => { hideTimer = setTimeout(() => wa.querySelector('.wa-tooltip')?.classList.remove('show'), 500); });
}

// ═══ INIT ═══
document.addEventListener('DOMContentLoaded', () => {
  // Cargar Three.js dinámicamente si no existe
  if (typeof THREE === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = () => { initThree(); initAll(); };
    document.head.appendChild(script);
  } else {
    initThree();
    initAll();
  }
});

function initAll() {
  initNavbar();
  initScrollReveal();
  renderClases();
  renderHorarios();
  renderPlanes();
  renderGaleria();
  renderTestimonios();
  initWhatsAppFloat();

  // Form submit
  document.getElementById('reservaForm')?.addEventListener('submit', handleReserva);

  // Modal backdrop click
  document.getElementById('modalBackdrop')?.addEventListener('click', closeReserva);
  document.getElementById('modalClose')?.addEventListener('click', closeReserva);

  // Navbar scroll effect
  window.addEventListener('scroll', () => {
    document.querySelector('.nav-bar')?.classList.toggle('scrolled', window.scrollY > 50);
  });
}

// Exponer funciones globales
window.openReserva = openReserva;
window.closeReserva = closeReserva;
window.selectHorario = selectHorario;
window.openLightbox = openLightbox;