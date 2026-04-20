# SynthKit Python SDK

Thin, local-first Python client for the SynthKit HTTP API.

This package is intentionally small. It does not reimplement the synthesis engine. It only talks to the local API so Python automation can create projects, ingest sources, run synthesis, inspect outputs, and export artifacts.

## Install

From the repo:

```bash
pip install -e packages/sdk-py
```

## Example

```python
from synthkit_sdk import SynthKitClient

client = SynthKitClient("http://127.0.0.1:8787")

project = client.create_project({"name": "Research"})
source_result = client.ingest_text(project["id"], {"text": "Messy notes", "title": "Notes"})
bundle = client.synthesize(project["id"], {
    "mode": "brief",
    "title": "Research brief",
})

print(project["id"])
print(source_result["source"]["id"])
print(bundle["request"]["id"])
```

## Scope

- local API client only
- no embedded synthesis engine
- no web UI
- no cloud assumptions

The Python surface exists because not every agent workflow is TypeScript.
