#!/usr/bin/env python3
import argparse
import http.client
import os
import sys
import urllib.parse
from http.server import HTTPServer, SimpleHTTPRequestHandler

parser = argparse.ArgumentParser()
parser.add_argument("--dir", default="frontend/dist/todo-frontend/browser")
parser.add_argument("--port", type=int, default=4200)
args = parser.parse_args()

os.chdir(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", args.dir)))


class SPAHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        # Proxy API requests to backend
        if self.path.startswith("/api"):
            self.proxy_request()
            return

        path = self.translate_path(self.path)
        if os.path.exists(path) and not os.path.isdir(path):
            return super().do_GET()
        # fallback to index.html for client-side routing
        self.path = "/index.html"
        return super().do_GET()

    def do_POST(self):
        if self.path.startswith("/api"):
            self.proxy_request()
            return
        return super().do_POST()

    def do_PUT(self):
        if self.path.startswith("/api"):
            self.proxy_request()
            return
        return super().do_PUT()

    def do_DELETE(self):
        if self.path.startswith("/api"):
            self.proxy_request()
            return
        return super().do_DELETE()

    def do_PATCH(self):
        if self.path.startswith("/api"):
            self.proxy_request()
            return
        return super().do_PATCH()

    def proxy_request(self):
        backend_host = os.environ.get("TODO_BACKEND_HOST", "127.0.0.1")
        backend_port = int(os.environ.get("TODO_BACKEND_PORT", "8000"))
        parsed = urllib.parse.urlparse(self.path)
        conn = http.client.HTTPConnection(backend_host, backend_port, timeout=10)
        try:
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length) if length else None
            # forward headers
            headers = {k: v for k, v in self.headers.items() if k.lower() != "host"}
            # rewrite /api prefix to backend root (match `proxy.conf.json` behavior)
            backend_path = parsed.path
            if backend_path.startswith("/api"):
                backend_path = backend_path[len("/api") :]
                if not backend_path:
                    backend_path = "/"
            conn.request(
                self.command,
                backend_path + (("?" + parsed.query) if parsed.query else ""),
                body,
                headers,
            )
            resp = conn.getresponse()
            self.send_response(resp.status)
            for h, v in resp.getheaders():
                # skip transfer-encoding to avoid chunked issues
                if h.lower() in ("transfer-encoding", "content-encoding"):
                    continue
                self.send_header(h, v)
            self.end_headers()
            data = resp.read()
            if data:
                self.wfile.write(data)
        except Exception as e:
            self.send_response(502)
            self.end_headers()
            self.wfile.write(str(e).encode("utf-8"))
            sys.stderr.write(f"Proxy error: {e}\n")
        finally:
            conn.close()


server = HTTPServer(("127.0.0.1", args.port), SPAHandler)
print(f"Serving SPA on http://127.0.0.1:{args.port}/ from {os.getcwd()}")
try:
    server.serve_forever()
except KeyboardInterrupt:
    server.server_close()
