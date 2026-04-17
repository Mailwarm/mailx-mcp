# MailX MCP

Official MCP server for [MailX](https://themailx.com) email deliverability tools — **SPF, DKIM, DMARC, BIMI** validation, domain/IP blacklist checks, **SMTP/IMAP** connectivity tests, DNS lookups (MX, TXT, CNAME, PTR, full A/AAAA/NS/SOA), and ready-to-deploy record generation for any major email provider.

This package is a thin stdio bridge to the hosted MCP server at [https://themailx.com/mcp](https://themailx.com/mcp). All tool logic runs server-side; this is ~50 lines of passthrough glue so clients that want stdio (Claude Desktop, local agents) can use it without hand-wiring a remote URL.

> Prefer the remote URL directly? Skip this package — point any streamable-HTTP MCP client straight at `https://themailx.com/mcp`. See [install guide](https://themailx.com/mcp/docs) for per-client JSON snippets.

## Tools

- `spf_check`, `dkim_check`, `dmarc_check`, `bimi_check` — validate authentication records
- `blacklist_check` — check a domain or IP against popular DNSBLs
- `smtp_check`, `imap_check` — test mail server connectivity with credentials
- `smtp_finder`, `imap_finder` — look up server settings by provider name
- `spf_generate`, `dmarc_generate` — produce copy-pasteable DNS records
- `mx_lookup`, `txt_lookup`, `cname_lookup`, `ptr_lookup`, `dns_lookup` — DNS queries
- `bimi_host` — host a BIMI SVG for email authentication

Full catalog + live descriptions: [themailx.com/mcp/docs](https://themailx.com/mcp/docs)

## Install

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or the equivalent on your OS:

```json
{
  "mcpServers": {
    "mailx": {
      "command": "npx",
      "args": ["-y", "@mailwarm/mailx-mcp"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add mailx -- npx -y @mailwarm/mailx-mcp
```

### Cursor / Windsurf / VS Code / Zed

Same `npx -y @mailwarm/mailx-mcp` pattern — see your client's MCP config docs for the exact JSON shape. Full examples at [themailx.com/mcp/docs](https://themailx.com/mcp/docs).

### Direct remote (no install)

If your client supports streamable-HTTP, point it at `https://themailx.com/mcp` directly — this bridge is only needed for stdio clients.

## Configuration

Optional session preferences (set once in your MCP client config, applied to every call):

| Variable | Effect |
|---|---|
| `default_dkim_selector` | Default selector used by `dkim_check` when the call omits `dkim_selector` |
| `preferred_provider` | Default provider for `spf_generate` (google, mailgun, sendgrid, postmark, amazon-ses, outlook, zoho, fastmail) |
| `dmarc_aggregate_email` | Default `rua=` address for `dmarc_generate` |

Override the upstream URL (staging/self-hosting):

```json
{
  "mcpServers": {
    "mailx": {
      "command": "npx",
      "args": ["-y", "@mailwarm/mailx-mcp"],
      "env": { "MAILX_MCP_URL": "https://tools-stg.themailx.com/mcp" }
    }
  }
}
```

## Prompts

Two one-click slash commands ship with the server:

- `audit-deliverability(domain)` — full deliverability audit (SPF + DMARC + DKIM + blacklist) with copy-pasteable fixes
- `setup-dns(domain, provider)` — greenfield DNS setup, generates SPF + DMARC for the chosen provider

## Links

- **Homepage**: [themailx.com](https://themailx.com)
- **Full docs**: [themailx.com/mcp/docs](https://themailx.com/mcp/docs)
- **Skills repo** (Claude Code plugin marketplace): [Mailwarm/mailx-skills](https://github.com/Mailwarm/mailx-skills)
- **Official MCP Registry**: [`com.themailx/email-deliverability`](https://registry.modelcontextprotocol.io/v0.1/servers?search=com.themailx)
- **Smithery**: [mailwarm/mailx-tools](https://smithery.ai/server/mailwarm/mailx-tools)
- **llms.txt**: [themailx.com/llms.txt](https://themailx.com/llms.txt)

## License

MIT — see [LICENSE](./LICENSE)
