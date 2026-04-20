from __future__ import annotations

import json
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1] / "src"
sys.path.insert(0, str(ROOT))

from synthkit_sdk import SynthKitClient  # noqa: E402


class SynthKitHandler(BaseHTTPRequestHandler):
    def do_GET(self):  # noqa: N802
        if self.path == "/v1/health":
            self._send({"ok": True, "data": {"status": "ok", "rootPath": "/tmp"}})
            return
        if self.path == "/v1/version":
            self._send({"ok": True, "data": {"version": "0.1.0"}})
            return
        if self.path == "/v1/capabilities":
            self._send({"ok": True, "data": {"schemaVersion": 1, "id": "capabilities"}})
            return
        if self.path == "/v1/projects":
            self._send({"ok": True, "data": []})
            return
        if self.path.endswith("/draft"):
            self._send({"ok": True, "data": {"schemaVersion": 1, "id": "draft_1"}})
            return
        if self.path.endswith("/citations") or self.path.endswith("/contradictions") or self.path.endswith("/revisions") or self.path.endswith("/stages"):
            self._send({"ok": True, "data": []})
            return
        self.send_error(404)

    def do_POST(self):  # noqa: N802
        length = int(self.headers.get("content-length", "0"))
        body = json.loads(self.rfile.read(length).decode("utf-8")) if length else {}
        if self.path == "/v1/projects":
            self._send({"ok": True, "data": {"id": "project_1", "schemaVersion": 1, "name": body.get("name", "Research")}})
            return
        if self.path.endswith("/ingest/text") or self.path.endswith("/ingest/markdown") or self.path.endswith("/ingest/url") or self.path.endswith("/ingest/pdf") or self.path.endswith("/ingest/image") or self.path.endswith("/ingest/transcript"):
            self._send({"ok": True, "data": {"source": {"id": "source_1"}, "chunks": [], "assets": [], "warnings": []}})
            return
        if self.path.endswith("/synthesize"):
            self._send({"ok": True, "data": {"request": {"id": "synth_1"}, "draft": {"id": "draft_1"}}})
            return
        if self.path.endswith("/revisions"):
            self._send({"ok": True, "data": {"id": "rev_1"}})
            return
        if self.path.endswith("/export"):
            self._send({"ok": True, "data": {"id": "export_1", "format": body.get("format", "markdown")}})
            return
        self.send_error(404)

    def log_message(self, format, *args):  # noqa: A003
        return

    def _send(self, payload):
        encoded = json.dumps(payload).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)


class SynthKitClientTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), SynthKitHandler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.base_url = f"http://127.0.0.1:{cls.server.server_address[1]}"

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.thread.join(timeout=5)

    def test_end_to_end_workflow(self):
        client = SynthKitClient(self.base_url)
        self.assertEqual(client.health()["status"], "ok")
        project = client.create_project("Research", description="Notes")
        self.assertEqual(project["id"], "project_1")
        client.ingest_text(project["id"], "Messy notes", title="Notes")
        bundle = client.synthesize(project["id"], "brief", "Research brief")
        self.assertEqual(bundle["draft"]["id"], "draft_1")
        self.assertEqual(client.get_draft("draft_1")["id"], "draft_1")
        self.assertEqual(client.get_citations("draft_1"), [])
        self.assertEqual(client.get_contradictions("draft_1"), [])
        self.assertEqual(client.get_revisions("draft_1"), [])
        self.assertEqual(client.export_markdown("draft_1")["format"], "markdown")
        self.assertEqual(client.get_stages("draft_1"), [])

    def test_http_error_surface(self):
        client = SynthKitClient(self.base_url)
        with self.assertRaises(Exception) as exc:
            client.get_project("missing")
        self.assertIn("HTTP error", str(exc.exception))


if __name__ == "__main__":
    unittest.main()
