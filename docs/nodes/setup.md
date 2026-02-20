---
title: "Setting Up Separate Devices as Nodes"
summary: "Step-by-step guide to pair and configure separate devices (Linux, Windows, macOS, iOS, Android) as Kolb-Bot nodes"
read_when:
  - You want to run commands on multiple machines
  - You're setting up a headless node host on a separate computer
  - You need to pair mobile or additional devices to your gateway
---

# Setting Up Separate Devices as Nodes

Nodes let you extend Kolb-Bot to multiple devices. Your **gateway** (main machine running `kolb-bot gateway`) coordinates everything, while **nodes** on other devices expose capabilities like command execution, screenshots, camera access, and more.

## Overview: How Multi-Device Setup Works

```
┌─────────────────────────────────────────────┐
│          Gateway Host                        │
│  (runs kolb-bot gateway)                    │
│  • Receives messages from apps              │
│  • Runs the AI model                        │
│  • Coordinates with nodes                   │
└──────────┬──────────────────────────────────┘
           │
     ┌─────┴─────┬──────────┬──────────┐
     │           │          │          │
  ┌──▼──┐  ┌──────▼──┐ ┌───▼────┐ ┌──▼────┐
  │Node │  │Node     │ │Node    │ │Node   │
  │Linux│  │Windows  │ │macOS   │ │iOS    │
  │Host │  │Host     │ │App     │ │App    │
  └─────┘  └─────────┘ └────────┘ └───────┘
```

**Key points:**

- **Gateway** = your primary machine where Kolb-Bot is installed
- **Nodes** = separate devices connected to the gateway via WebSocket
- **Pairing** = nodes request access; you approve them via `kolb-bot devices`
- **Capabilities** = each node type offers different features (exec, camera, screen, location)

---

## Device Types & Capabilities

| Device Type       | Capabilities                          | Best For                                      |
|-------------------|---------------------------------------|-----------------------------------------------|
| **Linux/Windows** | `system.run` (commands), browser      | Build servers, CI/CD, automation             |
| **macOS**         | `system.run`, camera, screen, canvas | Mac automation, multi-monitor setup          |
| **iOS/iPadOS**    | camera, screen, canvas, location     | Mobile automation, photo/video capture       |
| **Android**       | camera, screen, canvas, location, SMS| Mobile automation, Android-specific tasks    |

---

## Prerequisites

All nodes need:
- Network access to the **gateway host** (same LAN or reachable via VPN/SSH tunnel)
- Kolb-Bot installed (or the node app for iOS/Android)
- The gateway's **host address** and **port** (default `18789`)
- The gateway's **authentication token** (required if gateway is not on loopback)

### Get Gateway Connection Info

On your gateway host:

```bash
# Find the gateway port and binding
kolb-bot config get gateway.port       # Usually 18789
kolb-bot config get gateway.bind       # local, lan, or internet

# Get the authentication token (needed for remote nodes)
kolb-bot config get gateway.auth.token
```

If you don't have a token set yet:

```bash
# Generate one
kolb-bot config set gateway.auth.token "$(openssl rand -hex 32)"
```

**Network accessibility:**

```bash
# Check if gateway is reachable from a remote machine
# From the remote device:
nc -zv <gateway-host-ip> 18789

# Or if you have curl:
curl -v ws://<gateway-host-ip>:18789  # (will fail but shows connectivity)
```

---

## Setting Up a Headless Node Host

A **headless node host** runs on a separate machine (Linux, Windows, macOS) without a GUI. It connects to your gateway and exposes command execution capabilities.

### Step 1: Install Kolb-Bot on the Node Machine

Follow the main [setup guide](/setup) to install Kolb-Bot on the separate machine.

**Quick version:**

```bash
# macOS
/bin/bash -c "$(curl -fsSL https://kolb-bot.bot/install.sh | bash)"

# Linux
curl -fsSL https://kolb-bot.bot/install.sh | bash

# Windows (in PowerShell)
# Download and run: https://kolb-bot.bot/install.exe
```

Verify installation:

```bash
kolb-bot --version
```

### Step 2: Start the Node in Foreground (Test First)

On the **node machine**, run:

```bash
# Replace <gateway-host> with your gateway's IP or hostname
kolb-bot node run \
  --host <gateway-host> \
  --port 18789 \
  --display-name "Build Server"
```

**Example:**

```bash
kolb-bot node run \
  --host 192.168.1.100 \
  --port 18789 \
  --display-name "Build Server"
```

**What to expect:**

- The command starts and shows logs
- It tries to connect to the gateway WebSocket
- If successful: `Connected to gateway`
- If it fails: check network connectivity and gateway IP address

**For remote connections (not on local LAN):**

Set the auth token:

```bash
export KOLB_BOT_GATEWAY_TOKEN="<token-from-gateway-config>"
kolb-bot node run \
  --host <gateway-host> \
  --port 18789 \
  --display-name "Remote Build Server"
```

**Via SSH tunnel (if gateway is behind a firewall):**

On your local machine (acts as a bridge):

```bash
# Terminal A: Create the tunnel
ssh -N -L 18790:127.0.0.1:18789 user@gateway-host
```

Then on the remote node machine:

```bash
# Terminal B: Connect through tunnel
export KOLB_BOT_GATEWAY_TOKEN="<token>"
kolb-bot node run \
  --host 127.0.0.1 \
  --port 18790 \
  --display-name "Remote Build Server"
```

### Step 3: Approve the Node on the Gateway

On your **gateway host**, in a new terminal:

```bash
# See pending node pairing requests
kolb-bot nodes pending
```

You'll see something like:

```
ID                    Name              Status
abc123def456          Build Server      pending
```

Approve it:

```bash
kolb-bot nodes approve abc123def456
```

Verify it's now paired:

```bash
kolb-bot nodes status
```

### Step 4: Install as a Service (Optional)

Once you've tested the foreground node and confirmed it works, install it as a background service that auto-starts:

```bash
# On the node machine
kolb-bot node install \
  --host <gateway-host> \
  --port 18789 \
  --display-name "Build Server" \
  --force
```

Manage the service:

```bash
# Check status
kolb-bot node status

# Restart
kolb-bot node restart

# Stop
kolb-bot node stop

# Uninstall
kolb-bot node uninstall
```

### Step 5: Configure Exec Approvals

By default, the node won't run any commands. You need to explicitly allow them.

**From the gateway:**

```bash
# Allow a specific command
kolb-bot approvals allowlist add --node "Build Server" "/usr/bin/make"

# Allow a pattern
kolb-bot approvals allowlist add --node "Build Server" "/usr/bin/git*"

# View all allowlist rules for this node
kolb-bot approvals get --node "Build Server"
```

**Or manually edit on the node machine:**

Edit `~/.kolb-bot/exec-approvals.json`:

```json
{
  "allowlist": [
    "/usr/bin/make",
    "/usr/bin/npm",
    "/usr/bin/node",
    "/home/user/scripts/**"
  ]
}
```

Then restart the node service:

```bash
kolb-bot node restart
```

### Step 6: Test Command Execution

Back on the **gateway**:

```bash
# Simple test
kolb-bot nodes run --node "Build Server" -- whoami

# Run with arguments
kolb-bot nodes run --node "Build Server" -- node --version

# In the TUI or agent, reference the node
kolb-bot agent --message "Run 'npm test' on the Build Server"
```

---

## Setting Up iOS Nodes

iOS nodes are paired via the **Kolb-Bot iOS app** (available on the App Store).

### Step 1: Install the iOS App

1. Open the **App Store** on your iPhone/iPad
2. Search for "Kolb-Bot"
3. Tap **Install**
4. When the app launches, it shows a **QR code** or **pairing code**

### Step 2: Pair the iOS Device to the Gateway

On your **gateway host**:

```bash
# Show pending pairing requests
kolb-bot devices list

# Or if the app shows a pairing code:
kolb-bot devices approve <pairing-code>
```

The app automatically connects once approved.

### Step 3: Grant Permissions (iOS)

The iOS app will ask for permissions as you use features:

- **Camera** — for camera access
- **Screen Recording** — for screen/app interaction
- **Location** — optional, for location commands
- **Microphone** — for audio in video clips

**To pre-grant:**

Settings → Kolb-Bot → toggle permissions on.

### Step 4: Test Capabilities

From the gateway:

```bash
# Take a screenshot
kolb-bot nodes canvas snapshot --node <ios-device-name>

# Snap a photo (camera)
kolb-bot nodes camera snap --node <ios-device-name>

# Record screen (10 seconds)
kolb-bot nodes screen record --node <ios-device-name> --duration 10s

# Get location
kolb-bot nodes location get --node <ios-device-name>
```

---

## Setting Up Android Nodes

Android nodes pair similarly to iOS via the **Kolb-Bot Android app**.

### Step 1: Install the Android App

1. Open **Google Play Store** on your Android device
2. Search for "Kolb-Bot"
3. Tap **Install**
4. The app shows a **pairing code** on launch

### Step 2: Pair the Android Device

On your **gateway**:

```bash
kolb-bot devices list     # See the pending request
kolb-bot devices approve <pairing-code-or-id>
```

### Step 3: Grant Permissions (Android)

When you use a feature, Android shows a permission prompt. Tap **Allow** for:

- Camera
- Record Audio (for video clips)
- Location
- Screen Capture (for screen recording)
- SMS (if you want SMS capability)

### Step 4: Test

```bash
# Take a photo
kolb-bot nodes camera snap --node <android-device-name>

# Record video (5 seconds)
kolb-bot nodes camera clip --node <android-device-name> --duration 5s

# Get location
kolb-bot nodes location get --node <android-device-name>
```

---

## Setting Up macOS as a Node

The **macOS companion app** can connect to the gateway as a node, exposing system commands, screenshots, and more.

### Step 1: Install the macOS App

```bash
# Via Homebrew
brew install kolb-bot-macos

# Or download from GitHub releases
# https://github.com/kolbick/Kolb-Bot/releases
```

### Step 2: Launch and Pair

1. Open the **Kolb-Bot** app (look for the menu bar icon)
2. Click **Settings**
3. Under **Gateway Connection**, enter:
   - **Host**: your gateway's IP or hostname
   - **Port**: `18789`
   - **Token**: (if required)
4. Click **Connect**

The app pairs automatically once connected.

### Step 3: Grant macOS Permissions

macOS will prompt for:

- **Accessibility** (for controlling the system)
- **Screen Recording** (for screenshots)
- **Camera** (if using camera tools)

Grant these in **System Settings** → **Privacy & Security** → **Kolb-Bot**.

### Step 4: Test

```bash
# Run a command
kolb-bot nodes run --node "MacBook Pro" -- say "Hello"

# Take a screenshot
kolb-bot nodes canvas snapshot --node "MacBook Pro"

# Get system info
kolb-bot nodes run --node "MacBook Pro" -- system_profiler SPHardwareDataType
```

---

## Multi-Node Setup: Common Patterns

### Pattern 1: Distributed CI/Build

- **Gateway**: main machine
- **Node 1**: Linux build server for unit tests
- **Node 2**: macOS builder for macOS/iOS builds
- **Node 3**: Windows builder for Windows executables

**Usage:**

```bash
kolb-bot nodes run --node "Linux Builder" -- npm test
kolb-bot nodes run --node "macOS Builder" -- xcodebuild -scheme MyApp
kolb-bot nodes run --node "Windows Builder" -- msbuild.exe MyProject.sln
```

### Pattern 2: Mobile Automation

- **Gateway**: development machine
- **Node 1**: iPhone 14 (QA)
- **Node 2**: Android Pixel 6 (QA)

**Usage:**

```bash
# Capture screenshots from both devices
kolb-bot nodes camera snap --node "iPhone 14"
kolb-bot nodes camera snap --node "Android Pixel 6"

# Compare outputs in agent context
kolb-bot agent --message "Compare screenshots from both devices"
```

### Pattern 3: Home Lab

- **Gateway**: main server (e.g., Raspberry Pi or VM)
- **Node 1**: Linux machine for automation tasks
- **Node 2**: macOS machine for home automation
- **Node 3**: iPhone for location-based triggers

**Usage:**

```bash
# Check if anyone is home (location)
kolb-bot nodes location get --node "iPhone"

# Run smart home commands on macOS
kolb-bot nodes run --node "Home Mac" -- homecontrol.sh activate-scene "movie-night"
```

---

## Managing Multiple Nodes

### List All Nodes

```bash
# Brief overview
kolb-bot nodes status

# Detailed view
kolb-bot nodes list

# JSON output (for scripting)
kolb-bot nodes list --json

# Only show connected nodes
kolb-bot nodes status --connected

# Nodes that connected in the last 24 hours
kolb-bot nodes status --last-connected 24h
```

### Rename a Node

```bash
kolb-bot nodes rename --node "old-name" --name "Build Server #1"
```

### Remove/Revoke a Node

```bash
# Revoke the node's pairing token
kolb-bot devices revoke --device <device-id> --role node

# Or list and reject pending requests
kolb-bot devices list
kolb-bot devices reject <request-id>
```

---

## Troubleshooting Multi-Node Setup

### Node Won't Connect

**Symptom:** `kolb-bot nodes status` shows no nodes.

**Checks:**

1. **Network connectivity:**
   ```bash
   # From the node machine, test the gateway
   ping <gateway-ip>
   nc -zv <gateway-ip> 18789
   ```

2. **Gateway is running:**
   ```bash
   # On gateway machine
   kolb-bot gateway status
   kolb-bot gateway start  # if needed
   ```

3. **Node process is running:**
   ```bash
   # On node machine
   kolb-bot node status
   ps aux | grep "kolb-bot node"
   ```

4. **Check logs:**
   ```bash
   # On gateway
   kolb-bot logs --follow

   # On node
   journalctl -u kolb-bot-node -f  # if service is installed
   ```

### Pairing Stuck / Not Approving

```bash
# Clear pending requests
kolb-bot devices list

# Manually approve by ID
kolb-bot devices approve <request-id>

# If still stuck, restart the node
kolb-bot node restart     # on node machine
kolb-bot gateway restart  # on gateway
```

### Commands Fail With "SYSTEM_RUN_DENIED"

This means exec approvals are blocking the command.

```bash
# Check the allowlist
kolb-bot approvals get --node "<node-name>"

# Add the command to allowlist
kolb-bot approvals allowlist add --node "<node-name>" "/usr/bin/npm"

# Restart node
kolb-bot node restart
```

### Slow Command Execution

- Check network latency: `ping <gateway-ip>`
- Increase timeout: `kolb-bot nodes run --invoke-timeout 30000`
- Check node logs: `kolb-bot logs --follow`

---

## Security Considerations

### Node Authentication

- Nodes must be **approved** before connecting (`kolb-bot devices approve`)
- Each node receives a **unique pairing token** stored in `~/.kolb-bot/node.json`
- The gateway token (`KOLB_BOT_GATEWAY_TOKEN`) is required for remote connections

### Exec Approvals

- By default, nodes **cannot run commands** without explicit allowlist entries
- Use **glob patterns** to allow command families:
  ```bash
  kolb-bot approvals allowlist add --node "Node1" "/usr/bin/node*"
  ```
- Regularly audit: `kolb-bot approvals get --node "Node1"`

### Network Exposure

- **Local LAN**: safe, keep gateway on `localhost` binding
- **Internet**: use **TLS** and **auth tokens**:
  ```bash
  kolb-bot config set gateway.tls.enabled true
  kolb-bot config set gateway.auth.token "$(openssl rand -hex 32)"

  # On nodes, use TLS
  kolb-bot node run --host <gateway> --tls --tls-fingerprint <sha256>
  ```

### Multi-User / Shared Nodes

If multiple people can message the bot:

1. Create **per-node allowlists** to restrict each person's access
2. Use **per-agent** security policies:
   ```bash
   kolb-bot config get agents.list
   # Edit agents.list[].tools.exec.security (allowlist/ask/deny)
   ```
3. **Sandbox** untrusted agents:
   ```bash
   kolb-bot config set agents.list[0].sandbox.mode all
   ```

---

## Next Steps

- **[Node reference](/cli/node)** — full CLI documentation
- **[Nodes CLI](/cli/nodes)** — manage paired nodes
- **[Node troubleshooting](/nodes/troubleshooting)** — fix connection/permission issues
- **[Camera nodes](/nodes/camera)** — media capture guide
- **[Exec approvals](/tools/exec-approvals)** — secure command execution
- **[Gateway protocol](/gateway/protocol)** — WebSocket and pairing details
