import { afterEach, describe, expect, it } from "vitest";
import { createAppServer } from "../src/server.js";

describe("API server", () => {
  const servers: Array<{ app: { close: () => Promise<void> } }> = [];

  afterEach(async () => {
    for (const server of servers.splice(0)) {
      await server.app.close();
    }
  });

  it("exposes health and project creation", async () => {
    const server = createAppServer({ rootPath: "./.tmp-api-test", provider: { kind: "mock", seed: "api" } });
    servers.push(server);
    const health = await server.app.inject({ method: "GET", url: "/v1/health" });
    expect(health.statusCode).toBe(200);
    const openapi = await server.app.inject({ method: "GET", url: "/v1/openapi.json" });
    expect(openapi.statusCode).toBe(200);
    const openapiBody = openapi.json() as { openapi: string; info: { title: string } };
    expect(openapiBody.openapi).toBe("3.1.0");
    expect(openapiBody.info.title).toBe("SynthKit API");
    const openapiPaths = (openapiBody as { paths?: Record<string, { post?: { requestBody?: unknown } }> }).paths;
    expect(openapiPaths?.["/v1/projects"]?.post?.requestBody).toBeTruthy();
    const project = await server.app.inject({
      method: "POST",
      url: "/v1/projects",
      payload: { name: "API test" }
    });
    expect(project.statusCode).toBe(200);
    const body = project.json() as { ok: boolean; data: { id: string } };
    expect(body.ok).toBe(true);
    expect(body.data.id).toMatch(/^project_/);
  });
});
