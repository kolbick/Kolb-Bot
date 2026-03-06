# Hooking Cloud Agents to Kolb-Bot

Kolb-Bot is split into **two Git repositories**. To let cloud agents (Cursor, GitHub Codespaces, etc.) work on your code, put both on remotes you control (e.g. GitHub), then point the agent at one or both repos.

---

## Repos

| Repo            | What it is                           | Current remote                           |
| --------------- | ------------------------------------ | ---------------------------------------- |
| **Kolb-Bot**    | Backend, Docker, CLI, UI image build | `origin` → `github.com/kolbick/Kolb-Bot` |
| **Kolb-Bot-UI** | Frontend (Svelte), Kolb theme & tabs | `origin` → open-webui (upstream)         |

Cloud agents need to clone **your** copies. So:

1. **Kolb-Bot** — Push your branch to `kolbick/Kolb-Bot` (you already have this remote).
2. **Kolb-Bot-UI** — Create a **new** repo under your account (e.g. `kolbick/Kolb-Bot-UI`) and push your Kolb-customized branch there.

---

## Step 1: Push Kolb-Bot

On your Pi (or wherever the repo lives):

```bash
cd /home/kolby/Kolb-Bot

# Optional: see what will be committed
git status

# Stage and commit (adds everything we added: VIEWING.md, view-files.sh, kolb-bot urls, etc.)
./scripts/prepare-cloud-push.sh

# Push to GitHub (uses your existing origin)
git push origin main
```

If you use a different branch, replace `main` with your branch name. If push asks for auth, use a **Personal Access Token** (GitHub → Settings → Developer settings → Personal access tokens) or SSH.

---

## Step 2: Create a GitHub repo for Kolb-Bot-UI

1. Go to **https://github.com/new**
2. Repository name: **Kolb-Bot-UI**
3. Owner: your user (e.g. **kolbick**)
4. Choose **Private** or **Public**
5. Do **not** add a README, .gitignore, or license (you already have them)
6. Click **Create repository**
7. Copy the repo URL, e.g. `https://github.com/kolbick/Kolb-Bot-UI.git`

---

## Step 3: Push Kolb-Bot-UI to your new remote

On your Pi:

```bash
cd /home/kolby/Kolb-Bot-UI

# Put your repo URL here (replace with your real URL)
MY_UI_REPO="https://github.com/kolbick/Kolb-Bot-UI.git"

# Add your repo as a remote (we keep "origin" as open-webui)
git remote add kolb "$MY_UI_REPO"

# Make a proper branch with all Kolb customizations and push
git checkout -b main
git add .
git status   # optional: check nothing secret is included
git commit -m "Kolb-Bot UI: pirate theme, Crew/Providers/Pirate Ship, Quartermaster"
git push -u kolb main
```

Use your repo URL instead of `MY_UI_REPO` if different. If you already have a `main` branch, use another name (e.g. `kolb-theme`) and push that instead.

---

## Step 4: Use with a cloud agent

- **Single repo (backend only):** Point the agent at `https://github.com/kolbick/Kolb-Bot`. It has `docker-compose`, CLI, bridge, and references the UI image build from `../Kolb-Bot-UI`.
- **Single repo (frontend only):** Point the agent at `https://github.com/kolbick/Kolb-Bot-UI` for UI-only changes (theme, sidebar, new tabs).
- **Both:** Clone both repos side by side. Build UI with `cd Kolb-Bot-UI && npm run build`, then run Kolb-Bot with `./kolb-bot up` (compose uses `../Kolb-Bot-UI` for the UI Docker build).

In Cursor, you can **File → Open Folder** (or clone) each repo and use the cloud agent in that workspace. The agent will see the files in the repo you opened.

---

## Quick reference

| Goal            | Command / URL                                                                                                         |
| --------------- | --------------------------------------------------------------------------------------------------------------------- |
| Push backend    | `cd /home/kolby/Kolb-Bot && ./scripts/prepare-cloud-push.sh && git push origin main`                                  |
| Add UI remote   | `cd /home/kolby/Kolb-Bot-UI && git remote add kolb https://github.com/YOUR_USER/Kolb-Bot-UI.git`                      |
| Push frontend   | `cd /home/kolby/Kolb-Bot-UI && git checkout -b main && git add . && git commit -m "Kolb UI" && git push -u kolb main` |
| Clone for agent | `git clone https://github.com/kolbick/Kolb-Bot.git` (and optionally clone Kolb-Bot-UI too)                            |

Never commit `.env` or API keys; they are in `.gitignore`.
