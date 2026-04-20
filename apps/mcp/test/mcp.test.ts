import { afterAll, describe, expect, it } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "node:path";

describe("MCP server", () => {
  afterAll(() => undefined);

  it("lists tools and prompts", async () => {
    const client = new Client({ name: "test", version: "0.1.0" });
    const transport = new StdioClientTransport({
      command: "node",
      args: ["--conditions=source", "--import", "tsx", path.join(process.cwd(), "src/index.ts")],
      cwd: process.cwd()
    });
    await client.connect(transport);
    const tools = await client.listTools();
    expect(tools.tools.some((tool) => tool.name === "project_create")).toBe(true);
    const prompts = await client.listPrompts();
    expect(prompts.prompts.some((prompt) => prompt.name === "research_to_brief")).toBe(true);
    await client.close();
  });

  it("advertises dynamic resources after creating data", async () => {
    const client = new Client({ name: "test", version: "0.1.0" });
    const transport = new StdioClientTransport({
      command: "node",
      args: ["--conditions=source", "--import", "tsx", path.join(process.cwd(), "src/index.ts")],
      cwd: process.cwd()
    });
    await client.connect(transport);
    const created = (await client.callTool({
      name: "project_create",
      arguments: { name: "MCP resources" }
    })) as { content: Array<{ text: string }> };
    const createdContent = created.content[0];
    if (!createdContent) {
      throw new Error("Expected project creation content");
    }
    const project = JSON.parse(createdContent.text) as { id: string };
    await client.callTool({
      name: "source_ingest_text",
      arguments: { projectId: project.id, text: "MCP discovery matters." }
    });
    const synthesis = (await client.callTool({
      name: "synthesis_run",
      arguments: { projectId: project.id, mode: "brief", title: "MCP synthesis" }
    })) as { content: Array<{ text: string }> };
    const synthesisContent = synthesis.content[0];
    if (!synthesisContent) {
      throw new Error("Expected synthesis content");
    }
    const synthesisPayload = JSON.parse(synthesisContent.text) as { request: { id: string } };
    const resources = await client.listResources();
    expect(resources.resources.some((resource) => resource.uri === `project://${project.id}`)).toBe(true);
    expect(resources.resources.some((resource) => resource.uri === `project://${project.id}/sources`)).toBe(true);
    expect(resources.resources.some((resource) => resource.uri === `synthesis://${synthesisPayload.request.id}/draft`)).toBe(true);
    const templates = await client.listResourceTemplates();
    expect(templates.resourceTemplates.some((template) => template.uriTemplate === "project://{projectId}")).toBe(true);
    expect(templates.resourceTemplates.some((template) => template.uriTemplate === "synthesis://{synthesisId}/draft")).toBe(true);
    const draftResource = await client.readResource({ uri: `synthesis://${synthesisPayload.request.id}/draft` });
    const draftContent = draftResource.contents[0];
    if (!draftContent || !("text" in draftContent)) {
      throw new Error("Expected text draft resource");
    }
    expect(draftContent.text).toContain("Executive Summary");
    await client.close();
  });
});
