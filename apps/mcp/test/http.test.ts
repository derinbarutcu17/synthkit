import { afterEach, describe, expect, it } from "vitest";
import { startMcpHttpServer } from "../src/server.js";

describe("MCP HTTP transport", () => {
  const servers: Array<{ httpServer: { close: (callback?: () => void) => void } }> = [];

  afterEach(async () => {
    for (const server of servers.splice(0)) {
      await new Promise<void>((resolve) => server.httpServer.close(() => resolve()));
    }
  });

  it("connects over streamable HTTP and serves tools", async () => {
    const state = await startMcpHttpServer({
      rootPath: "./.tmp-mcp-http-test",
      provider: { kind: "mock", seed: "http" },
      host: "127.0.0.1",
      port: 0
    });
    servers.push(state);

    const endpoint = `http://${state.host}:${state.port}${state.path}`;
    const initialize = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json, text/event-stream"
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2025-03-26",
          capabilities: {},
          clientInfo: {
            name: "http-test",
            version: "0.1.0"
          }
        }
      })
    });
    expect(initialize.status).toBe(200);
    const initializeBody = (await initialize.json()) as { result?: { serverInfo?: { name?: string } } };
    expect(initializeBody.result?.serverInfo?.name).toBe("synthkit");
    const sessionId = initialize.headers.get("mcp-session-id");
    expect(sessionId).toMatch(/[0-9a-f-]{36}/);

    const tools = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json, text/event-stream",
        "mcp-session-id": sessionId ?? ""
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/list",
        params: {}
      })
    });
    expect(tools.status).toBe(200);
    const toolsBody = (await tools.json()) as { result?: { tools?: Array<{ name: string }> } };
    expect(toolsBody.result?.tools?.some((tool) => tool.name === "project_create")).toBe(true);
  });
});
