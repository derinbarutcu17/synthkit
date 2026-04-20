import fs from "node:fs";
import path from "node:path";
import { SynthKitEngine } from "@synthkit/core";

const fixturesDir = path.join(process.cwd(), "fixtures");
const rootPath = path.join(process.cwd(), ".synthkit-evals");

interface EvalFixture {
  name: string;
  notes: string[];
  expectedMinCitations: number;
  expectedContradictionsMax?: number;
}

const fixtures: EvalFixture[] = [
  {
    name: "brief-baseline",
    notes: [
      "We need a local-first synthesis engine with citations.",
      "MCP and CLI are required in v1.",
      "The web UI can wait."
    ],
    expectedMinCitations: 2,
    expectedContradictionsMax: 1
  },
  {
    name: "contradiction-hunt",
    notes: [
      "The deck should be 5 slides.",
      "The deck should be 8 slides.",
      "The evidence is inconsistent about final length."
    ],
    expectedMinCitations: 1,
    expectedContradictionsMax: 2
  }
];

const main = async () => {
  fs.mkdirSync(rootPath, { recursive: true });
  const engine = new SynthKitEngine({ rootPath, provider: { kind: "mock", seed: "eval" } });
  const results = [];
  for (const fixture of fixtures) {
    const project = engine.createProject({ name: fixture.name });
    for (const note of fixture.notes) {
      await engine.ingestText(project.id, note, fixture.name);
    }
    const bundle = await engine.runSynthesis({
      projectId: project.id,
      mode: "brief",
      title: fixture.name,
      question: "What should we do?"
    });
    const result = {
      name: fixture.name,
      citations: bundle.citations.length,
      contradictions: bundle.contradictions.length,
      confidence: bundle.confidenceReport.overallConfidence,
      pass:
        bundle.citations.length >= fixture.expectedMinCitations &&
        bundle.contradictions.length <= (fixture.expectedContradictionsMax ?? Number.MAX_SAFE_INTEGER)
    };
    results.push(result);
  }
  engine.close();
  console.log(JSON.stringify({ ok: results.every((item) => item.pass), results }, null, 2));
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

