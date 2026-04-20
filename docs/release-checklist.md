# Release Checklist

- docs are present
- demo command works without API keys
- CLI, HTTP, MCP, and SDK all hit the same core workflow
- stdio MCP and streamable HTTP MCP both smoke-test
- JSON schemas validate and API routes are reflected from the shared registry
- tests pass
- examples are runnable
- GitHub Actions CI runs install/typecheck/test/check
- package metadata is publishable
- MCP stdio and streamable HTTP are both smoke-tested
- Python SDK imports, exposes workflow helpers, and can hit the local HTTP API
- Python SDK smoke test passes with `python3 -m unittest discover -s packages/sdk-py/tests`
- changelog updated
- version tagged semver-style
