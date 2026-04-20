import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const cliPath = path.join(process.cwd(), "src/index.ts");

describe("CLI", () => {
  it("runs doctor in JSON mode", () => {
    const output = execFileSync("node", ["--conditions=source", "--import", "tsx", cliPath, "doctor", "--json", "--root", ".tmp-cli-test"], {
      cwd: process.cwd(),
      encoding: "utf8"
    });
    const parsed = JSON.parse(output);
    expect(parsed.ok).toBe(true);
    expect(parsed.rootPath).toContain(".tmp-cli-test");
  });

  it("runs through the repo-root binary path", () => {
    const repoRoot = path.resolve(process.cwd(), "../..");
    fs.rmSync(path.join(repoRoot, ".synthkit"), { recursive: true, force: true });
    const output = execFileSync("pnpm", ["exec", "synthkit", "doctor", "--json"], {
      cwd: repoRoot,
      encoding: "utf8"
    });
    const parsed = JSON.parse(output);
    expect(parsed.ok).toBe(true);
    expect(parsed.rootPath).toBe(path.join(repoRoot, ".synthkit"));
  });

  it("exposes a usable demo synthesis id", () => {
    const repoRoot = path.resolve(process.cwd(), "../..");
    const demoOutput = execFileSync("pnpm", ["exec", "synthkit", "demo", "--json"], {
      cwd: repoRoot,
      encoding: "utf8"
    });
    const demo = JSON.parse(demoOutput) as { synthesisId: string };
    expect(demo.synthesisId).toMatch(/^synth_/);
    const citationsOutput = execFileSync(
      "pnpm",
      ["exec", "synthkit", "inspect", "citations", "--synthesis", demo.synthesisId, "--json"],
      {
        cwd: repoRoot,
        encoding: "utf8"
      }
    );
    const citations = JSON.parse(citationsOutput) as Array<{ id: string }>;
    expect(citations.length).toBeGreaterThan(0);
  });
});
