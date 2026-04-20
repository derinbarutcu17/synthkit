import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SynthKitEngine } from "@synthkit/core";

const tmpRoot = () => fs.mkdtempSync(path.join(os.tmpdir(), "synthkit-ingest-"));

describe("SynthKitIngestor", () => {
  it("blocks local URLs instead of fetching them", async () => {
    const root = tmpRoot();
    const engine = new SynthKitEngine({ rootPath: root, provider: { kind: "mock", seed: "ingest" } });
    const project = engine.createProject({ name: "Ingest" });
    const result = await engine.ingestUrl(project.id, "http://127.0.0.1:7777/private", "Blocked");
    expect(result.source.extractionQuality).toBe("failed");
    expect(result.warnings.some((warning) => warning.includes("Blocked private IPv4 host"))).toBe(true);
    const localhostResult = await engine.ingestUrl(project.id, "http://localhost:7777/private", "Blocked");
    expect(localhostResult.source.extractionQuality).toBe("failed");
    expect(localhostResult.warnings.some((warning) => warning.includes("Blocked private resolved address")) || localhostResult.warnings.some((warning) => warning.includes("Blocked local URL host"))).toBe(true);
    engine.close();
  });

  it("survives malformed PDFs and records a warning", async () => {
    const root = tmpRoot();
    const engine = new SynthKitEngine({ rootPath: root, provider: { kind: "mock", seed: "pdf" } });
    const project = engine.createProject({ name: "PDF" });
    const filePath = path.join(root, "broken.pdf");
    fs.writeFileSync(filePath, Buffer.from("not a pdf"));
    const result = await engine.ingestPdf(project.id, filePath, "Broken PDF");
    expect(result.source.kind).toBe("pdf");
    expect(result.warnings.length).toBeGreaterThan(0);
    engine.close();
  });
});
