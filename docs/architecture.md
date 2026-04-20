# Architecture

SynthKit is organized around one core rule: the schema is the contract.

## Shape

- `packages/domain` holds versioned schemas and types.
- `packages/shared` holds deterministic helpers.
- `packages/storage` owns SQLite persistence.
- `packages/providers` abstracts text, embeddings, OCR, and transcription providers.
- `packages/ingest` normalizes messy inputs into sources, assets, and chunks.
- `packages/core` orchestrates synthesis stages and writes revision history.
- `apps/api`, `apps/mcp`, and `apps/cli` are thin surfaces on top of the same engine.
- `packages/sdk-ts` mirrors the HTTP and in-process workflows.
- `packages/evals` runs repeatable fixture-based checks.

## Why SQLite

SQLite keeps the v1 experience boring, portable, and local-first.

## Why not a giant agent framework

Because the product is not an autonomous agent. It is a synthesis engine that other agents can call.

