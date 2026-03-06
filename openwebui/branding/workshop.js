/**
 * Kolb-Bot Workshop: Agent/Sub-Agent management UI
 * Injected into Open WebUI via WEBUI_CUSTOM_SCRIPTS.
 */

(function () {
  "use strict";

  const BRIDGE_URL = location.protocol + "//" + location.hostname + ":8000";
  // Uses browser's current hostname so it works from any device on the network
  let workshopOpen = false;
  let agents = [];
  let templates = [];
  let selectedAgent = null;

  async function api(method, path, body) {
    const opts = { method, headers: { "Content-Type": "application/json" } };
    if (body) opts.body = JSON.stringify(body);
    const r = await fetch(BRIDGE_URL + path, opts);
    if (!r.ok) throw new Error(`API error: ${r.status}`);
    return r.json();
  }

  async function loadAgents() {
    const data = await api("GET", "/v1/workshop/agents");
    agents = data.agents || [];
  }

  async function loadTemplates() {
    const data = await api("GET", "/v1/workshop/templates");
    templates = data.templates || [];
  }

  function injectNavTab() {
    const checkNav = setInterval(() => {
      const nav =
        document.querySelector("nav") ||
        document.querySelector('[class*="sidebar"]') ||
        document.querySelector("#sidebar");
      if (!nav || document.getElementById("workshop-nav")) {
        if (document.getElementById("workshop-nav")) clearInterval(checkNav);
        return;
      }

      const links = nav.querySelectorAll("a, button");
      const lastLink = links[links.length - 1];
      if (!lastLink) return;

      const btn = document.createElement("button");
      btn.id = "workshop-nav";
      btn.innerHTML = "\u{1F527} Workshop";
      btn.style.cssText = `
        display:flex;align-items:center;gap:8px;padding:8px 12px;width:100%;
        text-align:left;border:none;background:none;color:inherit;font-size:inherit;
        cursor:pointer;border-radius:8px;margin-top:4px;
      `;
      btn.onmouseenter = () => (btn.style.background = "rgba(255,255,255,0.1)");
      btn.onmouseleave = () => (btn.style.background = "none");
      btn.onclick = toggleWorkshop;

      const pirateBtn = document.getElementById("pirate-ship-nav");
      if (pirateBtn) {
        pirateBtn.parentElement.insertAdjacentElement("beforebegin", btn);
      } else {
        lastLink.parentElement.insertAdjacentElement("afterend", btn);
      }
      clearInterval(checkNav);
    }, 1000);
  }

  function toggleWorkshop() {
    workshopOpen = !workshopOpen;
    let overlay = document.getElementById("workshop-dashboard");
    if (!workshopOpen && overlay) {
      overlay.remove();
      return;
    }

    overlay = document.createElement("div");
    overlay.id = "workshop-dashboard";
    overlay.style.cssText = `
      position:fixed;top:0;left:0;width:100%;height:100%;
      background:rgba(0,0,0,0.7);z-index:9999;display:flex;
      justify-content:center;align-items:center;
    `;
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        overlay.remove();
        workshopOpen = false;
      }
    };
    document.body.appendChild(overlay);

    const panel = document.createElement("div");
    panel.id = "workshop-panel";
    panel.style.cssText = `
      background:#1e293b;border-radius:16px;width:90%;max-width:900px;
      max-height:85vh;overflow-y:auto;color:#e2e8f0;padding:24px;
      font-family:system-ui,-apple-system,sans-serif;
    `;
    overlay.appendChild(panel);

    loadAgents().then(() => loadTemplates().then(() => renderWorkshop()));
  }

  function renderWorkshop() {
    const panel = document.getElementById("workshop-panel");
    if (!panel) return;

    if (selectedAgent) {
      renderAgentDetail(panel);
      return;
    }

    panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <h2 style="margin:0;">\u{1F527} Workshop</h2>
        <button id="ws-close" style="background:none;border:none;color:#94a3b8;font-size:1.5rem;cursor:pointer;">\u2715</button>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;">
        <button id="ws-create" style="background:#3b82f6;color:white;border:none;padding:12px;
          border-radius:8px;font-size:1rem;cursor:pointer;">+ Create Agent</button>
        <button id="ws-import" style="background:#1e293b;border:1px solid #475569;color:#e2e8f0;
          padding:12px;border-radius:8px;font-size:1rem;cursor:pointer;">\u{1F4E5} Import Agent</button>
      </div>

      <!-- Templates -->
      <div style="margin-bottom:24px;">
        <h3 style="color:#94a3b8;font-size:0.875rem;margin-bottom:12px;">AGENT TEMPLATES</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px;">
          ${templates
            .map(
              (t, i) => `
            <div class="ws-template" data-idx="${i}" style="background:#0f172a;border-radius:8px;padding:16px;
              cursor:pointer;border:1px solid #334155;transition:border-color 0.2s;">
              <div style="font-weight:bold;margin-bottom:4px;">${esc(t.name)}</div>
              <div style="color:#94a3b8;font-size:0.85rem;">${esc(t.description)}</div>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>

      <!-- Existing Agents -->
      <div>
        <h3 style="color:#94a3b8;font-size:0.875rem;margin-bottom:12px;">YOUR AGENTS (${agents.length})</h3>
        ${agents.length === 0 ? '<div style="color:#64748b;font-style:italic;">No agents yet. Create one above!</div>' : ""}
        ${agents
          .map(
            (a) => `
          <div class="ws-agent" data-id="${a.id}" style="background:#0f172a;border-radius:8px;padding:16px;
            margin-bottom:8px;cursor:pointer;border:1px solid #334155;display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-weight:bold;">${esc(a.name)} ${a.parent_agent_id ? '<span style="color:#64748b;font-size:0.75rem;">(sub-agent)</span>' : ""}</div>
              <div style="color:#94a3b8;font-size:0.85rem;">${esc(a.role || "No role")} \u2022 ${esc(a.model)}</div>
            </div>
            <div style="display:flex;gap:8px;">
              <button class="ws-export" data-id="${a.id}" style="background:#334155;border:none;color:#e2e8f0;
                padding:4px 12px;border-radius:6px;cursor:pointer;font-size:0.8rem;">\u{1F4E4}</button>
              <button class="ws-delete" data-id="${a.id}" style="background:#7f1d1d;border:none;color:#fca5a5;
                padding:4px 12px;border-radius:6px;cursor:pointer;font-size:0.8rem;">\u{1F5D1}</button>
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
    `;

    panel.querySelector("#ws-close").onclick = () => {
      document.getElementById("workshop-dashboard").remove();
      workshopOpen = false;
    };
    panel.querySelector("#ws-create").onclick = () => showCreateForm(panel);
    panel.querySelector("#ws-import").onclick = () => showImportForm(panel);

    panel.querySelectorAll(".ws-template").forEach((el) => {
      el.onclick = () => {
        const t = templates[parseInt(el.dataset.idx)];
        showCreateForm(panel, t.config);
      };
    });

    panel.querySelectorAll(".ws-agent").forEach((el) => {
      el.onclick = (e) => {
        if (e.target.closest(".ws-export") || e.target.closest(".ws-delete")) return;
        selectedAgent = agents.find((a) => a.id === el.dataset.id);
        renderWorkshop();
      };
    });

    panel.querySelectorAll(".ws-export").forEach((el) => {
      el.onclick = async (e) => {
        e.stopPropagation();
        const data = await api("GET", `/v1/workshop/agents/${el.dataset.id}/export`);
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `agent-${el.dataset.id}.json`;
        a.click();
        URL.revokeObjectURL(url);
      };
    });

    panel.querySelectorAll(".ws-delete").forEach((el) => {
      el.onclick = async (e) => {
        e.stopPropagation();
        if (!confirm("Delete this agent?")) return;
        await api("DELETE", `/v1/workshop/agents/${el.dataset.id}`);
        await loadAgents();
        renderWorkshop();
      };
    });
  }

  function showCreateForm(panel, prefill) {
    const p = prefill || {};
    panel.innerHTML = `
      <h2 style="margin:0 0 20px;">${p.name ? "Create from Template" : "Create Agent"}</h2>
      <div style="display:grid;gap:12px;">
        <label style="display:block;">
          <span style="color:#94a3b8;font-size:0.85rem;">Name</span>
          <input id="cf-name" value="${esc(p.name || "")}" style="${inputStyle()}" />
        </label>
        <label style="display:block;">
          <span style="color:#94a3b8;font-size:0.85rem;">Role</span>
          <input id="cf-role" value="${esc(p.role || "")}" style="${inputStyle()}" />
        </label>
        <label style="display:block;">
          <span style="color:#94a3b8;font-size:0.85rem;">System Instructions</span>
          <textarea id="cf-instructions" rows="4" style="${inputStyle()}resize:vertical;">${esc(p.system_instructions || "")}</textarea>
        </label>
        <label style="display:block;">
          <span style="color:#94a3b8;font-size:0.85rem;">Model</span>
          <input id="cf-model" value="${esc(p.model || "kolb-bot")}" style="${inputStyle()}" />
        </label>
        <label style="display:block;">
          <span style="color:#94a3b8;font-size:0.85rem;">Skills (comma-separated)</span>
          <input id="cf-skills" value="${esc((p.skills || []).join(", "))}" style="${inputStyle()}" />
        </label>
        <label style="display:block;">
          <span style="color:#94a3b8;font-size:0.85rem;">Tool Permissions (comma-separated)</span>
          <input id="cf-tools" value="${esc((p.tool_permissions || []).join(", "))}" style="${inputStyle()}" />
        </label>
        <div style="display:flex;gap:12px;align-items:center;">
          <label><input type="checkbox" id="cf-memory" ${p.memory_enabled ? "checked" : ""} /> Enable Memory</label>
          <label><input type="checkbox" id="cf-safe" ${p.safe_mode !== false ? "checked" : ""} /> Safe Mode</label>
        </div>
        <div style="display:flex;gap:12px;margin-top:8px;">
          <button id="cf-submit" style="background:#3b82f6;color:white;border:none;padding:10px 24px;
            border-radius:8px;cursor:pointer;font-size:1rem;">Create</button>
          <button id="cf-cancel" style="background:#334155;color:#e2e8f0;border:none;padding:10px 24px;
            border-radius:8px;cursor:pointer;font-size:1rem;">Cancel</button>
        </div>
      </div>
    `;

    panel.querySelector("#cf-cancel").onclick = () => renderWorkshop();
    panel.querySelector("#cf-submit").onclick = async () => {
      const config = {
        name: panel.querySelector("#cf-name").value,
        role: panel.querySelector("#cf-role").value,
        system_instructions: panel.querySelector("#cf-instructions").value,
        model: panel.querySelector("#cf-model").value,
        skills: panel
          .querySelector("#cf-skills")
          .value.split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        tool_permissions: panel
          .querySelector("#cf-tools")
          .value.split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        memory_enabled: panel.querySelector("#cf-memory").checked,
        safe_mode: panel.querySelector("#cf-safe").checked,
        integrations: [],
      };
      await api("POST", "/v1/workshop/agents", config);
      await loadAgents();
      renderWorkshop();
    };
  }

  function showImportForm(panel) {
    panel.innerHTML = `
      <h2 style="margin:0 0 20px;">\u{1F4E5} Import Agent</h2>
      <div style="margin-bottom:16px;">
        <textarea id="import-json" rows="12" placeholder="Paste agent JSON here..."
          style="${inputStyle()}resize:vertical;font-family:monospace;font-size:0.85rem;"></textarea>
      </div>
      <div style="display:flex;gap:12px;">
        <button id="import-submit" style="background:#3b82f6;color:white;border:none;padding:10px 24px;
          border-radius:8px;cursor:pointer;">Import</button>
        <button id="import-cancel" style="background:#334155;color:#e2e8f0;border:none;padding:10px 24px;
          border-radius:8px;cursor:pointer;">Cancel</button>
      </div>
    `;

    panel.querySelector("#import-cancel").onclick = () => renderWorkshop();
    panel.querySelector("#import-submit").onclick = async () => {
      try {
        const data = JSON.parse(panel.querySelector("#import-json").value);
        await api("POST", "/v1/workshop/agents/import", data);
        await loadAgents();
        renderWorkshop();
      } catch (e) {
        alert("Invalid JSON: " + e.message);
      }
    };
  }

  function renderAgentDetail(panel) {
    const a = selectedAgent;
    panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <div>
          <button id="ad-back" style="background:none;border:none;color:#3b82f6;cursor:pointer;font-size:0.9rem;">\u2190 Back</button>
          <h2 style="margin:8px 0 0;">${esc(a.name)}</h2>
          <div style="color:#94a3b8;">${esc(a.role)} \u2022 ${esc(a.model)}</div>
        </div>
      </div>

      <div style="background:#0f172a;border-radius:8px;padding:16px;margin-bottom:16px;">
        <div style="color:#94a3b8;font-size:0.85rem;margin-bottom:4px;">System Instructions</div>
        <div style="white-space:pre-wrap;">${esc(a.system_instructions || "None")}</div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
        <div style="background:#0f172a;border-radius:8px;padding:16px;">
          <div style="color:#94a3b8;font-size:0.85rem;margin-bottom:4px;">Skills</div>
          <div>${(a.skills || []).join(", ") || "None"}</div>
        </div>
        <div style="background:#0f172a;border-radius:8px;padding:16px;">
          <div style="color:#94a3b8;font-size:0.85rem;margin-bottom:4px;">Tools</div>
          <div>${(a.tool_permissions || []).join(", ") || "None"}</div>
        </div>
      </div>

      <div style="margin-bottom:16px;">
        <div style="display:flex;gap:8px;">
          <span style="padding:2px 8px;border-radius:4px;font-size:0.8rem;
            background:${a.memory_enabled ? "#065f4620" : "#1e293b"};color:${a.memory_enabled ? "#10b981" : "#64748b"};">
            Memory: ${a.memory_enabled ? "ON" : "OFF"}</span>
          <span style="padding:2px 8px;border-radius:4px;font-size:0.8rem;
            background:${a.safe_mode ? "#065f4620" : "#7f1d1d20"};color:${a.safe_mode ? "#10b981" : "#ef4444"};">
            Safe Mode: ${a.safe_mode ? "ON" : "OFF"}</span>
        </div>
      </div>

      <h3 style="color:#94a3b8;font-size:0.875rem;">SUB-AGENTS</h3>
      <div id="sub-agents-list" style="margin-bottom:16px;color:#64748b;">Loading...</div>
      <button id="ad-add-sub" style="background:#334155;border:none;color:#e2e8f0;padding:8px 16px;
        border-radius:8px;cursor:pointer;">+ Add Sub-Agent</button>
    `;

    panel.querySelector("#ad-back").onclick = () => {
      selectedAgent = null;
      renderWorkshop();
    };
    panel.querySelector("#ad-add-sub").onclick = () => {
      showCreateForm(panel, { ...a, name: "", parent_agent_id: a.id });
    };

    api("GET", `/v1/workshop/agents/${a.id}/sub-agents`).then((data) => {
      const list = panel.querySelector("#sub-agents-list");
      const subs = data.sub_agents || [];
      list.innerHTML =
        subs.length === 0
          ? '<div style="font-style:italic;">No sub-agents</div>'
          : subs
              .map(
                (s) => `
          <div style="background:#0f172a;border-radius:6px;padding:12px;margin-bottom:6px;border-left:2px solid #8b5cf6;">
            <strong>${esc(s.name)}</strong> <span style="color:#64748b;">${esc(s.role)}</span>
          </div>
        `,
              )
              .join("");
    });
  }

  function inputStyle() {
    return "width:100%;padding:8px 12px;background:#0f172a;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:0.9rem;margin-top:4px;";
  }

  function esc(s) {
    const d = document.createElement("div");
    d.textContent = s || "";
    return d.innerHTML;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectNavTab);
  } else {
    injectNavTab();
  }
})();
