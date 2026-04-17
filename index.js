#!/usr/bin/env node
/**
 * MailX MCP — stdio bridge to the hosted MCP server at themailx.com/mcp.
 *
 * Why this exists: some MCP clients (Claude Desktop, local IDEs, agent SDKs)
 * spawn stdio MCP servers as subprocesses. This tiny bridge speaks stdio with
 * the client and proxies every request to the hosted streamable-HTTP server.
 * No logic here — all tools, resources, prompts live upstream.
 *
 * Override the upstream URL with MAILX_MCP_URL (useful for staging/self-hosting).
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {
    ListToolsRequestSchema,
    CallToolRequestSchema,
    ListResourcesRequestSchema,
    ReadResourceRequestSchema,
    ListPromptsRequestSchema,
    GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const REMOTE_URL = process.env.MAILX_MCP_URL ?? 'https://themailx.com/mcp';

async function main() {
    const upstream = new Client(
        { name: 'mailx-mcp-bridge', version: '1.0.0' },
        { capabilities: {} }
    );
    await upstream.connect(new StreamableHTTPClientTransport(new URL(REMOTE_URL)));

    const server = new Server(
        { name: 'mailx', version: '1.0.0' },
        {
            capabilities: {
                tools: { listChanged: false },
                resources: {},
                prompts: { listChanged: false },
            },
        }
    );

    server.setRequestHandler(ListToolsRequestSchema, () => upstream.listTools());
    server.setRequestHandler(CallToolRequestSchema, (req) => upstream.callTool(req.params));
    server.setRequestHandler(ListResourcesRequestSchema, () => upstream.listResources());
    server.setRequestHandler(ReadResourceRequestSchema, (req) => upstream.readResource(req.params));
    server.setRequestHandler(ListPromptsRequestSchema, () => upstream.listPrompts());
    server.setRequestHandler(GetPromptRequestSchema, (req) => upstream.getPrompt(req.params));

    await server.connect(new StdioServerTransport());

    const shutdown = async () => {
        try { await upstream.close(); } catch {}
        try { await server.close(); } catch {}
        process.exit(0);
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
}

main().catch((err) => {
    console.error('[mailx-mcp] fatal:', err);
    process.exit(1);
});
