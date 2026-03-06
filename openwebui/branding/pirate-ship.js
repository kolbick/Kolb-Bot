/**
 * Kolb-Bot Pirate Ship Dashboard
 * Injected into Open WebUI via WEBUI_CUSTOM_SCRIPTS.
 * Shows real-time agent activity as crew members on a pirate ship.
 */

(function () {
  "use strict";

  const _host = location.hostname;
  const TELEMETRY_WS_URL =
    (location.protocol === "https:" ? "wss:" : "ws:") + "//" + _host + ":8200/v1/pirate-ship/ws";
  const TELEMETRY_HTTP_URL = location.protocol + "//" + _host + ":8200";

  const ACTIVITY_ICONS = {
    setting_sail: "\u2693", // ⚓
    plotting_course: "\u{1F9ED}", // 🧭
    hoisting_sails: "\u26F5", // ⛵
    deck_work: "\u2699\uFE0F", // ⚙️
    storm_warning: "\u26A0\uFE0F", // ⚠️
    port_reached: "\u{1F3C1}", // 🏁
    new_crew_member: "\u{1F64B}", // 🙋
    on_deck: "\u{1F6A2}", // 🚢
    idle: "\u{1F634}", // 😴
  };

  const ACTIVITY_COLORS = {
    setting_sail: "#3b82f6",
    plotting_course: "#8b5cf6",
    hoisting_sails: "#f59e0b",
    deck_work: "#6b7280",
    storm_warning: "#ef4444",
    port_reached: "#10b981",
    new_crew_member: "#06b6d4",
    on_deck: "#64748b",
    idle: "#94a3b8",
  };

  let ws = null;
  let crewState = {};
  let eventLog = [];
  let dashboardOpen = false;

  function connectWebSocket() {
    if (ws && ws.readyState <= 1) return;
    try {
      ws = new WebSocket(TELEMETRY_WS_URL);
      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.type === "initial_state") {
          data.crew.forEach((c) => {
            crewState[c.id] = c;
          });
          eventLog = data.recent_events || [];
        } else if (data.type === "pirate_ship_event") {
          if (data.crew_member) crewState[data.crew_member.id] = data.crew_member;
          eventLog.push(data);
          if (eventLog.length > 200) eventLog = eventLog.slice(-100);
        }
        if (dashboardOpen) renderDashboard();
      };
      ws.onclose = () => setTimeout(connectWebSocket, 3000);
      ws.onerror = () => ws.close();
    } catch (e) {
      setTimeout(connectWebSocket, 5000);
    }
  }

  function injectNavTab() {
    const checkNav = setInterval(() => {
      const nav =
        document.querySelector("nav") ||
        document.querySelector('[class*="sidebar"]') ||
        document.querySelector("#sidebar");
      if (!nav) return;

      if (document.getElementById("pirate-ship-nav")) {
        clearInterval(checkNav);
        return;
      }

      const links = nav.querySelectorAll("a, button");
      const lastLink = links[links.length - 1];
      if (!lastLink) return;

      const btn = document.createElement("button");
      btn.id = "pirate-ship-nav";
      btn.innerHTML = "\u{1F3F4}\u200D\u2620\uFE0F Pirate Ship";
      btn.style.cssText = `
        display: flex; align-items: center; gap: 8px; padding: 8px 12px;
        width: 100%; text-align: left; border: none; background: none;
        color: inherit; font-size: inherit; cursor: pointer; border-radius: 8px;
        margin-top: 4px;
      `;
      btn.onmouseenter = () => (btn.style.background = "rgba(255,255,255,0.1)");
      btn.onmouseleave = () => (btn.style.background = "none");
      btn.onclick = () => toggleDashboard();

      lastLink.parentElement.insertAdjacentElement("afterend", btn);
      clearInterval(checkNav);
    }, 1000);
  }

  function toggleDashboard() {
    dashboardOpen = !dashboardOpen;
    let overlay = document.getElementById("pirate-ship-dashboard");
    if (!dashboardOpen && overlay) {
      overlay.remove();
      return;
    }
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "pirate-ship-dashboard";
      overlay.style.cssText = `
        position: fixed; top: 0; right: 0; width: 480px; height: 100vh;
        background: #0f172a; color: #e2e8f0; z-index: 10000;
        overflow-y: auto; box-shadow: -4px 0 20px rgba(0,0,0,0.5);
        font-family: system-ui, -apple-system, sans-serif;
        transition: transform 0.3s ease;
      `;
      document.body.appendChild(overlay);
    }
    connectWebSocket();
    renderDashboard();
  }

  function renderDashboard() {
    const el = document.getElementById("pirate-ship-dashboard");
    if (!el) return;

    const crew = Object.values(crewState);
    const active = crew.filter((c) => !["port_reached", "idle"].includes(c.status));
    const storms = crew.filter((c) => c.status === "storm_warning");
    const recent = eventLog.slice(-15).reverse();

    el.innerHTML = `
      <div style="padding: 20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
          <h2 style="margin:0;font-size:1.5rem;">\u{1F3F4}\u200D\u2620\uFE0F Pirate Ship</h2>
          <button onclick="document.getElementById('pirate-ship-dashboard').remove();window.__pirateShipOpen=false;"
            style="background:none;border:none;color:#94a3b8;font-size:1.5rem;cursor:pointer;">\u2715</button>
        </div>

        <!-- Ship Status -->
        <div style="background:#1e293b;border-radius:12px;padding:16px;margin-bottom:16px;">
          <div style="font-size:0.875rem;color:#94a3b8;margin-bottom:8px;">SHIP STATUS</div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;text-align:center;">
            <div>
              <div style="font-size:1.5rem;font-weight:bold;color:#3b82f6;">${crew.length}</div>
              <div style="font-size:0.75rem;color:#64748b;">Crew</div>
            </div>
            <div>
              <div style="font-size:1.5rem;font-weight:bold;color:#f59e0b;">${active.length}</div>
              <div style="font-size:0.75rem;color:#64748b;">Active</div>
            </div>
            <div>
              <div style="font-size:1.5rem;font-weight:bold;color:${storms.length ? "#ef4444" : "#10b981"};">${storms.length}</div>
              <div style="font-size:0.75rem;color:#64748b;">Storms</div>
            </div>
          </div>
        </div>

        <!-- Crew Members -->
        <div style="margin-bottom:16px;">
          <div style="font-size:0.875rem;color:#94a3b8;margin-bottom:8px;">CREW ON DECK</div>
          ${crew.length === 0 ? '<div style="color:#64748b;font-style:italic;padding:12px;">No crew aboard yet. Create agents in Workshop.</div>' : ""}
          ${crew
            .map(
              (c) => `
            <div style="background:#1e293b;border-radius:8px;padding:12px;margin-bottom:8px;
              border-left:3px solid ${ACTIVITY_COLORS[c.status] || "#64748b"};">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                  <span style="font-size:1.25rem;">${ACTIVITY_ICONS[c.status] || "\u{1F6A2}"}</span>
                  <strong style="margin-left:8px;">${escHtml(c.name)}</strong>
                  <span style="color:#64748b;font-size:0.75rem;margin-left:8px;">${escHtml(c.role || "sailor")}</span>
                </div>
                <span style="font-size:0.75rem;padding:2px 8px;border-radius:12px;
                  background:${ACTIVITY_COLORS[c.status] || "#64748b"}20;
                  color:${ACTIVITY_COLORS[c.status] || "#64748b"};">
                  ${c.status.replace(/_/g, " ")}
                </span>
              </div>
              <div style="color:#94a3b8;font-size:0.8rem;margin-top:6px;">${escHtml(c.current_task || "Standing by")}</div>
            </div>
          `,
            )
            .join("")}
        </div>

        <!-- Cargo Manifest (Task Queue) -->
        ${
          active.length > 0
            ? `
        <div style="margin-bottom:16px;">
          <div style="font-size:0.875rem;color:#94a3b8;margin-bottom:8px;">\u{1F4E6} CARGO MANIFEST</div>
          ${active
            .map(
              (c) => `
            <div style="background:#1e293b;border-radius:6px;padding:8px 12px;margin-bottom:4px;
              display:flex;justify-content:space-between;font-size:0.85rem;">
              <span>${escHtml(c.name)}: ${escHtml(c.current_task)}</span>
              <span style="color:${ACTIVITY_COLORS[c.status] || "#64748b"};">\u25CF</span>
            </div>
          `,
            )
            .join("")}
        </div>
        `
            : ""
        }

        <!-- Storm Warnings -->
        ${
          storms.length > 0
            ? `
        <div style="margin-bottom:16px;">
          <div style="font-size:0.875rem;color:#ef4444;margin-bottom:8px;">\u26A0\uFE0F STORM WARNINGS</div>
          ${storms
            .map(
              (c) => `
            <div style="background:#451a1a;border-radius:8px;padding:12px;margin-bottom:8px;border:1px solid #7f1d1d;">
              <div style="font-weight:bold;">${escHtml(c.name)}</div>
              <div style="color:#fca5a5;font-size:0.85rem;margin-top:4px;">${escHtml(c.current_task)}</div>
              <div style="color:#94a3b8;font-size:0.75rem;margin-top:6px;">
                Suggestion: Check agent logs and retry the failed operation
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
        `
            : ""
        }

        <!-- Deck Activity Log -->
        <div>
          <div style="font-size:0.875rem;color:#94a3b8;margin-bottom:8px;">\u{1F4DC} DECK LOG</div>
          ${recent.length === 0 ? '<div style="color:#64748b;font-style:italic;">No activity yet.</div>' : ""}
          ${recent
            .map((e) => {
              const cm = e.crew_member || {};
              const t = new Date((e.timestamp || 0) * 1000).toLocaleTimeString();
              return `
              <div style="font-size:0.8rem;padding:4px 0;border-bottom:1px solid #1e293b;display:flex;gap:8px;">
                <span style="color:#64748b;min-width:70px;">${t}</span>
                <span>${ACTIVITY_ICONS[cm.status] || ""}</span>
                <span style="color:#e2e8f0;">${escHtml(cm.name || "system")}: ${escHtml(cm.current_task || e.raw_method || "")}</span>
              </div>
            `;
            })
            .join("")}
        </div>
      </div>
    `;
  }

  function escHtml(s) {
    const d = document.createElement("div");
    d.textContent = s || "";
    return d.innerHTML;
  }

  // Boot
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      injectNavTab();
      connectWebSocket();
    });
  } else {
    injectNavTab();
    connectWebSocket();
  }
})();
