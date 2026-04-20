from __future__ import annotations

from dataclasses import dataclass
import json
from typing import Any, Literal, Mapping
from urllib import error, parse, request

SynthesisMode = Literal["brief", "decision_memo", "deck_outline"]
JsonDict = dict[str, Any]


class SynthKitApiError(RuntimeError):
    def __init__(self, message: str, *, code: str = "client_error", status: int | None = None, details: Any = None):
        super().__init__(message)
        self.code = code
        self.status = status
        self.details = details


@dataclass(slots=True)
class SynthKitClient:
    base_url: str
    timeout: float = 30.0

    def health(self) -> JsonDict:
        return self._get("/v1/health")

    def version(self) -> JsonDict:
        return self._get("/v1/version")

    def capabilities(self) -> JsonDict:
        return self._get("/v1/capabilities")

    def list_projects(self) -> list[JsonDict]:
        return self._get("/v1/projects")

    def create_project(self, input: Mapping[str, Any]) -> JsonDict:
        return self._post("/v1/projects", input)

    def get_project(self, project_id: str) -> JsonDict:
        return self._get(f"/v1/projects/{self._encode(project_id)}")

    def ingest_text(self, project_id: str, input: Mapping[str, Any]) -> JsonDict:
        return self._post(f"/v1/projects/{self._encode(project_id)}/ingest/text", input)

    def ingest_markdown(self, project_id: str, input: Mapping[str, Any]) -> JsonDict:
        return self._post(f"/v1/projects/{self._encode(project_id)}/ingest/markdown", input)

    def ingest_url(self, project_id: str, input: Mapping[str, Any]) -> JsonDict:
        return self._post(f"/v1/projects/{self._encode(project_id)}/ingest/url", input)

    def ingest_pdf(self, project_id: str, input: Mapping[str, Any]) -> JsonDict:
        return self._post(f"/v1/projects/{self._encode(project_id)}/ingest/pdf", input)

    def ingest_image(self, project_id: str, input: Mapping[str, Any]) -> JsonDict:
        return self._post(f"/v1/projects/{self._encode(project_id)}/ingest/image", input)

    def ingest_transcript(self, project_id: str, input: Mapping[str, Any]) -> JsonDict:
        return self._post(f"/v1/projects/{self._encode(project_id)}/ingest/transcript", input)

    def synthesize(self, project_id: str, input: Mapping[str, Any]) -> JsonDict:
        return self._post(f"/v1/projects/{self._encode(project_id)}/synthesize", input)

    def get_draft(self, synthesis_id: str) -> JsonDict:
        return self._get(f"/v1/syntheses/{self._encode(synthesis_id)}/draft")

    def get_citations(self, synthesis_id: str) -> list[JsonDict]:
        return self._get(f"/v1/syntheses/{self._encode(synthesis_id)}/citations")

    def get_contradictions(self, synthesis_id: str) -> list[JsonDict]:
        return self._get(f"/v1/syntheses/{self._encode(synthesis_id)}/contradictions")

    def get_revisions(self, synthesis_id: str) -> list[JsonDict]:
        return self._get(f"/v1/syntheses/{self._encode(synthesis_id)}/revisions")

    def revise_section(self, synthesis_id: str, input: Mapping[str, Any]) -> JsonDict:
        return self._post(f"/v1/syntheses/{self._encode(synthesis_id)}/revisions", input)

    def export_markdown(self, synthesis_id: str) -> JsonDict:
        return self._post(f"/v1/syntheses/{self._encode(synthesis_id)}/export", {"format": "markdown"})

    def export_json(self, synthesis_id: str) -> JsonDict:
        return self._post(f"/v1/syntheses/{self._encode(synthesis_id)}/export", {"format": "json"})

    def get_stages(self, synthesis_id: str) -> JsonDict:
        return self._get(f"/v1/syntheses/{self._encode(synthesis_id)}/stages")

    def _get(self, path: str) -> Any:
        return self._request("GET", path)

    def _post(self, path: str, body: Mapping[str, Any]) -> Any:
        return self._request("POST", path, body)

    def _request(self, method: str, path: str, body: Mapping[str, Any] | None = None) -> Any:
        data = None if body is None else json.dumps(dict(body)).encode("utf-8")
        req = request.Request(
            self.base_url.rstrip("/") + path,
            data=data,
            method=method,
            headers={"Content-Type": "application/json"},
        )
        try:
            with request.urlopen(req, timeout=self.timeout) as resp:
                payload = json.loads(resp.read().decode("utf-8"))
                if not isinstance(payload, dict) or not payload.get("ok", False):
                    raise SynthKitApiError("Malformed response envelope", details=payload)
                if "data" not in payload:
                    return None
                return payload["data"]
        except error.HTTPError as exc:
            body_text = exc.read().decode("utf-8", errors="replace")
            try:
                payload = json.loads(body_text)
            except json.JSONDecodeError:
                payload = {"raw": body_text}
            message = "HTTP error"
            if isinstance(payload, dict):
                message = payload.get("error", {}).get("message") or payload.get("message") or message
            raise SynthKitApiError(message, status=exc.code, details=payload) from None

    @staticmethod
    def _encode(value: str) -> str:
        return parse.quote(value, safe="")
