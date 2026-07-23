# 🏋️‍♂️ Doyo Olimpo — Landing Page + Sistema de Reservas

**Cliente:** Doyo Olimpo (Gimnasio / Box / Entrenamiento Funcional)
**Instagram:** @doyoolimpo
**Proyecto FGF Digital:** `~/Documents/FGF Digital/projects/clientes/doyo-olimpo/`

---

## 📁 Estructura
```
doyo-olimpo/
├── index.html          ← Landing page principal
├── admin/
│   └── index.html      ← Panel admin (dueño gestiona horarios/reservas)
├── css/
│   └── style.css       ← Estilos compartidos
├── js/
│   ├── main.js         ← Landing page logic
│   └── admin.js        ← Admin panel logic
├── logos/
│   └── logo.png        ← LOGO PROFESIONAL (pendiente)
├── imagenes/           ← Fotos de Instagram (descargadas)
├── server.js           ← Backend Node/Express (API reservas)
├── package.json        ← Dependencias
└── README.md           ← Este archivo
```

---

## 🎯 Features principales

| Feature | Estado | Detalle |
|---------|--------|---------|
| **Hero "Primera clase gratis"** | ⏳ Pendiente | CTA principal + selector día/hora |
| **Selector de horarios** | ⏳ Pendiente | Configurable por dueño (días/horas/clase) |
| **Reserva vía WhatsApp/Email** | ⏳ Pendiente | Envía datos al dueño |
| **Panel Admin** | ⏳ Pendiente | CRUD horarios + ver reservas |
| **Galería Instagram** | ⏳ Pendiente | Fotos descargadas de @doyoolimpo |
| **Planes/Precios** | ⏳ Pendiente | Según defina el cliente |
| **Deploy Firebase** | ⏳ Pendiente | Como resto de FGF Digital |

---

## 📋 Info pendiente del cliente

- [ ] **Logo profesional** (en `logos/logo.png`)
- [ ] **WhatsApp de contacto**
- [ ] **Dirección física**
- [ ] **Horarios de clases** (ej: "Funcional Lunes/Miércoles/Viernes 19:00")
- [ ] **Tipos de clases** (Funcional, Open Box, Personal, etc.)
- [ ] **Planes/Precios** (Mensual, Pack 8 clases, Drop-in, etc.)
- [ ] **Cómo gestiona reservas hoy** (WhatsApp, papel, Calendly, nada)

---

## 🚀 Próximos pasos

1. **Recibir logo profesional** → guardar en `logos/logo.png`
2. **Descargar fotos de Instagram** → `imagenes/`
3. **Definir horarios/clases** con el dueño
4. **Codear `index.html`** (landing)
5. **Codear `admin/index.html`** (panel dueño)
6. **Backend `server.js`** (API reservas + auth simple)
7. **Deploy a Firebase Hosting**

---

## 🔗 Referencias FGF Digital
- Generador de demos: `~/FGF-RESCATE/fgf-demos/`
- Desarmaduría FGF (modelo completado): `~/FGF-RESCATE/desarmaduria-fgf/`
- Deploy target: `fgf-digital-demos.web.app` (o subdominio cliente)