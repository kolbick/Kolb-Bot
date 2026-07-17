# Kolb Computer (CPTR integration)

"Kolb Computer" is the brand-facing name for a connection to **CPTR**
(published as Open WebUI Computer), integrated strictly through its
OpenAI-compatible gateway API. No CPTR frontend code is copied into this
repository, and CPTR's own product name, logos, about/version screens, and
attribution are never modified — its Open Use License prohibits altering its
attribution elements. Only the connection, launcher, model alias, and
documentation *inside Kolb-Bot* are branded.

## Adapter boundary

Everything CPTR-specific lives at the configuration layer (this document,
`.env` values, and the connection entry created below) — no CPTR code paths
exist in the application. If written permission or a commercial license is
ever obtained, a fully branded replacement can be swapped in by pointing the
same connection at a different gateway.

## Setup

CPTR runs on the host (or as a separately managed container), not inside this
stack. From the app container the host is reachable as
`host.docker.internal` — Docker Desktop provides this natively, and this
project's compose file maps it on Linux via `host-gateway`.

1. Start CPTR on the host and note its gateway address, normally ending in
   `/v1` (example: `http://localhost:8100/v1`).
2. In `.env`, set (server-side only; `.env` is never committed):

   ```dotenv
   CPTR_GATEWAY_URL=http://host.docker.internal:8100/v1
   CPTR_GATEWAY_KEY=<gateway key>
   ```

3. In **Admin Settings → Connections**, add an OpenAI-compatible connection
   with that URL and key.
4. Set the model's display alias to **Kolb Computer** (model picker →
   edit model → name), keeping the underlying provider/model id accurate.
5. Enable `ENABLE_FORWARD_USER_INFO_HEADERS=true` if CPTR's integration
   documentation calls for the conversation metadata headers
   (`X-OpenWebUI-Chat-Id` and related user headers) — this gives CPTR
   conversation continuity across messages.

## Diagnostics

- Model discovery: the connection's "verify" button in Admin Settings →
  Connections calls the gateway's `/models`; failures mean URL/key/network.
- From the container:
  `docker compose exec kolb-bot curl -s http://host.docker.internal:8100/v1/models`
- Chat continuity: confirm CPTR receives the chat-id header when header
  forwarding is enabled.

## Security — read before enabling

- **Treat CPTR access as SSH access to the host.** It can control the
  computer. Anyone who can chat with the Kolb Computer model can act on the
  host with CPTR's privileges.
- Never expose the CPTR gateway or management UI through the public reverse
  proxy. It stays on localhost/host-network only.
- Never make it reachable to unauthenticated users; in Kolb-Bot, restrict the
  Kolb Computer model to the admin/owner via model access controls.
- Do not give a CPTR container the whole host filesystem; configure an
  explicit, dedicated workspace path.
- Keys live only in server-side env files excluded from version control.

## Disabling

Remove the connection (or disable it) in Admin Settings → Connections; normal
chat is unaffected. Clearing `CPTR_GATEWAY_URL`/`CPTR_GATEWAY_KEY` in `.env`
removes the configuration entirely.
