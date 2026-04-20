# SynthKit

SynthKit is a headless mess-to-structure synthesis engine for research material.

It turns notes, markdown, PDFs, webpages, transcripts, and image inputs into structured briefs, decision memos, and deck outlines with citations, contradiction tracking, confidence reporting, and revision history.

## Surfaces

- MCP server
- CLI
- local HTTP API
- TypeScript SDK

The web UI is intentionally not the spine of the project. It can be added later without changing the core contract.

## Start here

```bash
./pnpm install
./pnpm demo
```

If you want a health check, use:

```bash
./pnpm run check
```

## Design stance

- SQLite by default
- local file storage by default
- mock provider mode for zero-key demos
- versioned schemas are the contract
- clients stay thin

## Surfaces

- MCP server for agent runtimes
- CLI for humans and shell automation
- local HTTP API for SDKs and custom runtimes
- TypeScript SDK for embedding
- Python SDK scaffold for direct local API calls

## What it is

SynthKit is a headless synthesis engine, not a chat app. It exists to turn messy research material into structured briefs, decision memos, and deck outlines with citations, contradictions, and confidence notes that can be inspected later.

## What it is not

- not a generic chatbot
- not a note-taking app
- not a fake platform wrapped around prompts
- not a web UI first project

## Read more

- [Project explanation](./docs/explanation.md)
- [Architecture docs](./docs/README.md)
