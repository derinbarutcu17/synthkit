# Project Explanation

SynthKit is a headless synthesis engine. It takes messy research material and turns it into structured outputs that an agent or a human can actually use.

The point is not to chat endlessly with files. The point is to:

- ingest text, markdown, PDFs, URLs, transcripts, and images
- preserve provenance and citations
- surface contradictions instead of smoothing them away
- keep confidence and uncertainty visible
- expose the same core workflow through MCP, CLI, HTTP, and SDK surfaces

The architecture is deliberately boring:

- SQLite stores the project and synthesis state locally
- the core engine owns the workflow
- clients stay thin
- schemas are versioned and treated as the contract

What SynthKit is good at in v1:

- messy research to brief
- messy research to decision memo
- messy research to deck outline

What it is not trying to be:

- a general agent framework
- a collaborative note app
- a hosted SaaS with hidden state
- a UI-first product

If the output cannot be traced back to evidence, it should be treated as weak or insufficient. That rule matters more than sounding smart.
