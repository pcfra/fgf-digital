#!/usr/bin/env python3
"""Servidor local FGF Digital — Sirve portafolio y proyectos"""
import http.server
import socketserver
import os
import webbrowser
from pathlib import Path

PORT = 9090
HOME = os.path.expanduser("~")

class FGFHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=HOME, **kwargs)

    def do_GET(self):
        # Redirect root to portfolio
        if self.path == '/':
            self.send_response(302)
            self.send_header('Location', '/vault/FGF-Digital/portafolio-fgf-premium.html')
            self.end_headers()
            return
        return super().do_GET()

if __name__ == '__main__':
    print(f"""
🔥═══════════════════════════════════════🔥
    FGF DIGITAL — Servidor Local
🔥═══════════════════════════════════════🔥

📍 Portafolio Premium:
   http://localhost:{PORT}/vault/FGF-Digital/portafolio-fgf-premium.html

📍 Portafolio App:
   http://localhost:{PORT}/vault/FGF-Digital/portafolio-fgf-app.html

📍 Presentación:
   http://localhost:{PORT}/vault/FGF-Digital/presentacion-fgf-digital.html

📍 Desarmaduría FGF — Sitio:
   http://localhost:{PORT}/FGF-RESCATE/desarmaduria-fgf/index.html

📍 Desarmaduría FGF — Catálogo:
   http://localhost:{PORT}/FGF-RESCATE/desarmaduria-fgf/catalogo/index.html

📍 Desarmaduría FGF — Admin:
   http://localhost:{PORT}/FGF-RESCATE/desarmaduria-fgf/admin/index.html

📍 Desarmaduría FGF — Propuesta:
   http://localhost:{PORT}/FGF-RESCATE/desarmaduria-fgf/propuesta/index.html

📋 Presiona Ctrl+C para detener
""")
    # Open browser
    webbrowser.open(f'http://localhost:{PORT}')

    with socketserver.TCPServer(("", PORT), FGFHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n👋 Servidor detenido.")
