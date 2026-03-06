# Kolb-Bot Security Model & Threat Analysis

## Threat Model

### Assets Under Protection

1. **Host system**: The Raspberry Pi and its filesystem
2. **Credentials**: API keys, gateway tokens, user passwords
3. **User data**: Conversations, agent configurations, workspace files
4. **Network**: Local network services reachable from the Pi

### Threat Actors

1. **Untrusted network users**: Anyone on the same network who discovers the services
2. **Malicious tools/skills**: Community-contributed code that may be harmful
3. **LLM prompt injection**: Attempts to make agents bypass safety controls
4. **Supply chain**: Compromised dependencies in the Docker images

### Attack Surfaces

| Surface             | Risk                       | Mitigation                                              |
| ------------------- | -------------------------- | ------------------------------------------------------- |
| Open WebUI (:3000)  | Unauthorized access        | Signup disabled by default; admin-created accounts only |
| Gateway WS (:18789) | Unauthorized agent control | Token-authenticated; not exposed to public internet     |
| Bridge API (:8000)  | Unauthorized CRUD          | Internal network only; secret-validated                 |
| Voice WS (:8100)    | Audio interception         | Internal network only                                   |
| Telemetry (:8200)   | Information disclosure     | Internal network only; read-only                        |
| Docker socket       | Container escape           | Not mounted; services run as non-root                   |
| Tool execution      | Arbitrary code execution   | Safe Mode on by default; tool permissions opt-in        |

## Secure Defaults

### Authentication

- **Gateway token**: Auto-generated 256-bit hex on first run
- **WebUI secret key**: Auto-generated, used for session encryption and OAuth
- **No default passwords**: `.env` generation uses `openssl rand -hex 32`
- **Signup disabled**: `ENABLE_SIGNUP=false` — only admin can create users

### Network Isolation

- All services communicate on the internal `kolbbot-net` Docker bridge
- Only ports 3000 (WebUI) and 18789 (Gateway) are exposed to the host
- Bridge, voice, and telemetry are internal-only (no port mapping to host)

### Safe Mode (enabled by default)

When `KOLB_BOT_SAFE_MODE=1`:

- Agent tool permissions restricted to: `read_file`, `list_files`, `search`, `web_search`
- Destructive tools (`write_file`, `execute_command`, `browser`) require explicit opt-in
- Sub-agents cannot exceed parent agent's tool permissions
- File operations require user confirmation

### Tool/Function Security

- Tools and Functions execute **arbitrary Python on the server** — treat as privileged code
- Only install tools from trusted sources
- Review code before importing community tools
- Workspace Tools access should be limited to admin users
- MCP/OpenAPI connections proxy through the backend — API keys never reach the browser

## Hardening Checklist

### For Production Deployment

- [ ] Generate strong secrets: `openssl rand -hex 32` for all tokens
- [ ] Keep `ENABLE_SIGNUP=false`
- [ ] Enable HTTPS via reverse proxy (Caddy, nginx, Cloudflare Tunnel)
- [ ] Set `KOLB_BOT_SAFE_MODE=1`
- [ ] Review all installed Tools and Functions
- [ ] Do not expose port 18789 to the public internet
- [ ] Set up firewall rules (ufw) to restrict access to known IPs
- [ ] Keep Docker images updated: `docker compose pull`
- [ ] Monitor logs: `./kolb-bot logs`
- [ ] Back up volumes: `kolbbot-data`, `openwebui-data`

### For Development

- [ ] Use `.env` (not hardcoded) for all secrets
- [ ] Never commit `.env` to git (already in `.gitignore`)
- [ ] Run `./scripts/verify-branding.sh` before pushing

## Historical Security Considerations

The upstream project (pre-fork) had these patterns that Kolb-Bot explicitly avoids:

1. **Weak localhost assumptions**: Some control servers assumed that binding to localhost was sufficient security. Kolb-Bot requires token auth on all services regardless of bind address.

2. **Legacy env var fallbacks**: The upstream accepted deprecated legacy env vars as fallbacks, which could confuse security audits. Kolb-Bot removes these legacy fallbacks from active code paths (retained only in migration diagnostics).

3. **Docker socket mounting**: Some Docker-based features required mounting the Docker socket, which grants container-escape-equivalent access. Kolb-Bot does not mount the Docker socket in any service.

4. **Unrestricted tool execution**: Tools were enabled by default. Kolb-Bot ships with Safe Mode, requiring explicit opt-in for dangerous tools.

5. **Community sharing enabled by default**: `ENABLE_COMMUNITY_SHARING=false` is the Kolb-Bot default.

## Incident Response

If you suspect a security issue:

1. Stop all services: `./kolb-bot down`
2. Rotate all secrets in `.env`
3. Check logs: `docker compose logs > incident.log`
4. Review agent configurations for unauthorized changes
5. Rebuild from clean images: `docker compose build --no-cache`
