const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const ROOT = '/var/home/fpardo/desarmaduria-fgf';
const PORT = 9090;

const MIME = {
    '.html': 'text/html;charset=utf-8',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.json': 'application/json',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp'
};

// Asegurar que existe la carpeta de fotos subidas
const fotosDir = path.join(ROOT, 'imagenes', 'subidas');
const fotosFile = path.join(ROOT, 'imagenes', 'fotos.json');

if (!fs.existsSync(fotosDir)) {
    fs.mkdirSync(fotosDir, { recursive: true });
}
if (!fs.existsSync(fotosFile)) {
    fs.writeFileSync(fotosFile, '[]');
}

// Función para parsear multipart/form-data
function parseMultipart(buffer, boundary) {
    const parts = [];
    const boundaryBuffer = Buffer.from('--' + boundary);
    
    let start = buffer.indexOf(boundaryBuffer) + boundaryBuffer.length + 2;
    
    while (true) {
        const end = buffer.indexOf(boundaryBuffer, start);
        if (end === -1) break;
        
        const part = buffer.slice(start, end - 2);
        const headerEnd = part.indexOf('\r\n\r\n');
        
        if (headerEnd !== -1) {
            const headers = part.slice(0, headerEnd).toString();
            const body = part.slice(headerEnd + 4);
            
            const filenameMatch = headers.match(/filename="([^"]+)"/);
            if (filenameMatch) {
                parts.push({
                    filename: filenameMatch[1],
                    data: body
                });
            }
        }
        
        start = end + boundaryBuffer.length + 2;
    }
    
    return parts;
}

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname;
    
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // API: Subir fotos
    if (req.method === 'POST' && pathname === '/api/upload') {
        let body = [];
        req.on('data', chunk => body.push(chunk));
        req.on('end', () => {
            try {
                const buffer = Buffer.concat(body);
                const contentType = req.headers['content-type'] || '';
                const boundaryMatch = contentType.match(/boundary=(.+)/);
                
                if (!boundaryMatch) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'No boundary found' }));
                    return;
                }
                
                const files = parseMultipart(buffer, boundaryMatch[1]);
                const fotos = [];
                
                files.forEach(file => {
                    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.filename);
                    const filePath = path.join(fotosDir, uniqueName);
                    fs.writeFileSync(filePath, file.data);
                    
                    const foto = {
                        id: uniqueName,
                        nombre: file.originalname || file.filename,
                        url: '/imagenes/subidas/' + uniqueName,
                        tamaño: file.data.length,
                        fecha: new Date().toISOString()
                    };
                    fotos.push(foto);
                });
                
                // Guardar registro
                let fotosExistentes = [];
                if (fs.existsSync(fotosFile)) {
                    fotosExistentes = JSON.parse(fs.readFileSync(fotosFile, 'utf8'));
                }
                fotosExistentes = [...fotosExistentes, ...fotos];
                fs.writeFileSync(fotosFile, JSON.stringify(fotosExistentes, null, 2));
                
                console.log(`✅ ${fotos.length} foto(s) subida(s)`);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, fotos: fotos }));
            } catch (error) {
                console.error('❌ Error:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
        return;
    }
    
    // API: Obtener fotos
    if (req.method === 'GET' && pathname === '/api/fotos') {
        try {
            const fotos = fs.existsSync(fotosFile) 
                ? JSON.parse(fs.readFileSync(fotosFile, 'utf8'))
                : [];
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, fotos: fotos }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
        return;
    }
    
    // API: Eliminar foto
    if (req.method === 'DELETE' && pathname.startsWith('/api/fotos/')) {
        try {
            const id = pathname.split('/api/fotos/')[1];
            let fotos = fs.existsSync(fotosFile) 
                ? JSON.parse(fs.readFileSync(fotosFile, 'utf8'))
                : [];
            
            const foto = fotos.find(f => f.id === id);
            if (foto) {
                // Eliminar archivo físico
                const filePath = path.join(fotosDir, id);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
                // Eliminar del registro
                fotos = fotos.filter(f => f.id !== id);
                fs.writeFileSync(fotosFile, JSON.stringify(fotos, null, 2));
                console.log(`✅ Foto ${id} eliminada`);
            }
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
        return;
    }
    
    // Archivos estáticos
    let filePath = pathname === '/' 
        ? path.join(ROOT, 'index.html') 
        : path.join(ROOT, pathname);
    
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
    }
    
    const ext = path.extname(filePath);
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('Not found: ' + pathname);
            return;
        }
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
        res.end(data);
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('🔧 ==========================================');
    console.log('   DESARMADURÍA FGF - SERVIDOR');
    console.log('🔧 ==========================================');
    console.log('');
    console.log(`🌐 Servidor corriendo en: http://localhost:${PORT}`);
    console.log('');
    console.log('📸 Gestión de fotos habilitada');
    console.log('   • Subir: POST /api/upload');
    console.log('   • Ver: GET /api/fotos');
    console.log('   • Eliminar: DELETE /api/fotos/:id');
    console.log('');
});
