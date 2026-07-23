/**
 * Dojo Olimpo - Backend Server
 * Node.js + Express para API de reservas y servir archivos estáticos
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3333;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname)));

// ═══ API RESERVAS ═══
const RESERVAS_FILE = path.join(__dirname, 'reservas.json');

// Leer reservas del archivo
function leerReservas() {
    try {
        if (fs.existsSync(RESERVAS_FILE)) {
            const data = fs.readFileSync(RESERVAS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('Error leyendo reservas:', e);
    }
    return [];
}

// Guardar reservas al archivo
function guardarReservas(reservas) {
    try {
        fs.writeFileSync(RESERVAS_FILE, JSON.stringify(reservas, null, 2));
    } catch (e) {
        console.error('Error guardando reservas:', e);
    }
}

// GET /api/reservas - Obtener todas las reservas
app.get('/api/reservas', (req, res) => {
    const reservas = leerReservas();
    res.json({ success: true, data: reservas });
});

// POST /api/reservas - Crear nueva reserva
app.post('/api/reservas', (req, res) => {
    try {
        const reservas = leerReservas();
        const nuevaReserva = {
            id: Date.now(),
            ...req.body,
            fecha: new Date().toISOString(),
            estado: 'pendiente',
            confirmada: false
        };

        reservas.push(nuevaReserva);
        guardarReservas(reservas);

        // Log para el dueño
        console.log('\n🔔 NUEVA RESERVA - Dojo Olimpo');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`👤 Nombre: ${nuevaReserva.nombre}`);
        console.log(`📱 WhatsApp: ${nuevaReserva.telefono}`);
        console.log(`📧 Email: ${nuevaReserva.email || 'No proporcionado'}`);
        console.log(`💪 Clase: ${nuevaReserva.clase}`);
        console.log(`🕐 Horario: ${nuevaReserva.hora}`);
        console.log(`📝 Mensaje: ${nuevaReserva.mensaje || 'Sin comentarios'}`);
        console.log(`📦 Plan: ${nuevaReserva.plan || 'Clase gratis'}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Generar link WhatsApp para el dueño
        const msgDueño = encodeURIComponent(
            `🏋️ NUEVA RESERVA - Dojo Olimpo\n\n` +
            `👤 ${nuevaReserva.nombre}\n` +
            `📱 ${nuevaReserva.telefono}\n` +
            `📧 ${nuevaReserva.email || '—'}\n` +
            `💪 ${nuevaReserva.clase}\n` +
            `🕐 ${nuevaReserva.hora}\n` +
            `📝 ${nuevaReserva.mensaje || 'Sin comentarios'}\n\n` +
            `Confirmar por WhatsApp`
        );
        const whatsappLink = `https://wa.me/${process.env.WHATSAPP_OWNER || '569XXXXXXXX'}?text=${msgDueño}`;
        console.log(`🔗 Link WhatsApp dueño: ${whatsappLink}`);

        res.json({
            success: true,
            data: nuevaReserva,
            whatsappLink: whatsappLink
        });
    } catch (error) {
        console.error('Error creando reserva:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
});

// PUT /api/reservas/:id - Actualizar estado de reserva
app.put('/api/reservas/:id', (req, res) => {
    try {
        const reservas = leerReservas();
        const id = parseInt(req.params.id);
        const index = reservas.findIndex(r => r.id === id);

        if (index === -1) {
            return res.status(404).json({ success: false, error: 'Reserva no encontrada' });
        }

        reservas[index] = { ...reservas[index], ...req.body };
        guardarReservas(reservas);

        res.json({ success: true, data: reservas[index] });
    } catch (error) {
        console.error('Error actualizando reserva:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
});

// DELETE /api/reservas/:id - Eliminar reserva
app.delete('/api/reservas/:id', (req, res) => {
    try {
        const reservas = leerReservas();
        const id = parseInt(req.params.id);
        const index = reservas.findIndex(r => r.id === id);

        if (index === -1) {
            return res.status(404).json({ success: false, error: 'Reserva no encontrada' });
        }

        reservas.splice(index, 1);
        guardarReservas(reservas);

        res.json({ success: true });
    } catch (error) {
        console.error('Error eliminando reserva:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
});

// ═══ API HORARIOS ═══
const HORARIOS_FILE = path.join(__dirname, 'horarios.json');

function leerHorarios() {
    try {
        if (fs.existsSync(HORARIOS_FILE)) {
            const data = fs.readFileSync(HORARIOS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('Error leyendo horarios:', e);
    }
    return [];
}

function guardarHorarios(horarios) {
    try {
        fs.writeFileSync(HORARIOS_FILE, JSON.stringify(horarios, null, 2));
    } catch (e) {
        console.error('Error guardando horarios:', e);
    }
}

app.get('/api/horarios', (req, res) => {
    const horarios = leerHorarios();
    res.json({ success: true, data: horarios });
});

app.post('/api/horarios', (req, res) => {
    try {
        const horarios = leerHorarios();
        const nuevo = { id: Date.now(), ...req.body };
        horarios.push(nuevo);
        guardarHorarios(horarios);
        res.json({ success: true, data: nuevo });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error interno' });
    }
});

app.put('/api/horarios/:id', (req, res) => {
    try {
        const horarios = leerHorarios();
        const id = parseInt(req.params.id);
        const index = horarios.findIndex(h => h.id === id);

        if (index === -1) {
            return res.status(404).json({ success: false, error: 'Horario no encontrado' });
        }

        horarios[index] = { ...horarios[index], ...req.body };
        guardarHorarios(horarios);
        res.json({ success: true, data: horarios[index] });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error interno' });
    }
});

app.delete('/api/horarios/:id', (req, res) => {
    try {
        let horarios = leerHorarios();
        const id = parseInt(req.params.id);
        horarios = horarios.filter(h => h.id !== id);
        guardarHorarios(horarios);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error interno' });
    }
});

// ═══ RUTAS FRONTEND ═══
// Servir index.html para rutas no-API (SPA fallback)
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ═══ INICIAR SERVIDOR ═══
const server = app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║  🏋️  DOYO OLIMPO - Servidor Backend                         ║
╠════════════════════════════════════════════════════════════════╣
║  🌐  http://localhost:${PORT}                                    ║
║  📡  API: http://localhost:${PORT}/api/reservas                ║
║  📋  Admin: http://localhost:${PORT}/admin/                    ║
╚════════════════════════════════════════════════════════════════╝
    `);
});

server.on('error', (err) => {
    console.error('❌ Error del servidor:', err);
});

// Handlers para que no muera silenciosamente
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});