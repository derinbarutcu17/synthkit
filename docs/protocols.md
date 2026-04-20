# Protocol Surfaces

## MCP

- stdio transport is the default.
- tools, resources, and prompts are exposed from the same engine.
- capability discovery is explicit.
- resource templates are listed for project and synthesis URI patterns.

## CLI

- non-interactive by default when flags are passed.
- JSON mode is deterministic and script-friendly.
- direct engine calls avoid unnecessary network hops.
- the top-level pnpm health check uses `./pnpm run check`; the CLI `doctor` command remains the user-facing diagnosis surface.

## HTTP

- `/v1` routes are local-first and JSON-only.
- the API mirrors the same domain entities and synthesis workflow.
- OpenAPI is exposed at `/v1/openapi.json` and is generated from the same route schemas used by the server.

## SDK

- the TypeScript SDK mirrors the HTTP API.
- the in-process core client is available for agents running in the same process.
- the Python SDK is a thin local API client for automation-heavy workflows.
