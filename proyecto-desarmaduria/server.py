import http.server
import socketserver
import os

PORT = 9090
DIRECTORY = "/home/fpardo/desarmaduria-fgf"

os.chdir(DIRECTORY)

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
    print(f"Servidor corriendo en http://localhost:{PORT}")
    httpd.serve_forever()
