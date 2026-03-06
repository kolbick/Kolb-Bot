# How to See Kolb-Bot on Your Headless Raspberry Pi

Your Pi has no monitor. You use another device (phone, tablet, or laptop) to see everything. Here’s how, step by step.

---

## 1. Find Your Pi’s Address (IP)

On the Pi (in a terminal, or via SSH):

```bash
cd /home/kolby/Kolb-Bot
./kolb-bot urls
```

That prints your Pi’s IP and all the links you need. Write down the IP (e.g. `192.168.1.50` or `100.x.x.x` if you use Tailscale).

**Or** find the IP once:

- **Same Wi‑Fi (LAN):** On the Pi run: `hostname -I` and take the first number.
- **Tailscale:** Run: `tailscale ip -4` and use that number.

---

## 2. Open the Kolb-Bot App (Chat, Crew, Pirate Ship)

1. On your **phone, tablet, or laptop**, open a **web browser** (Chrome, Safari, Firefox, etc.).
2. In the address bar type (replace `YOUR-PI-IP` with the IP from step 1):
   ```text
   http://YOUR-PI-IP:3000
   ```
   Example: `http://192.168.1.50:3000`
3. Press Enter.

You should see the Kolb-Bot login page. Create an account the first time, then you can use Chat, Crew, Providers, Pirate Ship, Workshop, and Notes.

**Other useful links (same IP, different port):**

| What             | URL                               |
| ---------------- | --------------------------------- |
| Kolb-Bot app     | `http://YOUR-PI-IP:3000`          |
| Watch bot browse | `http://YOUR-PI-IP:6080/vnc.html` |

---

## 3. View All the Project Files (Code and Config)

The app above is the _running_ Kolb-Bot. The _files_ (Kolb-Bot and Kolb-Bot-UI code, configs, etc.) live in folders on the Pi. You can view them in a browser.

### Option A: Simple file browser in the browser (easiest)

On the **Pi** (SSH or terminal), run:

```bash
cd /home/kolby/Kolb-Bot
./view-files.sh
```

Then on your **phone or laptop**, open:

```text
http://YOUR-PI-IP:8082
```

You’ll see a list of folders (`Kolb-Bot`, `Kolb-Bot-UI`, etc.). Click a folder to open it and see the files. This is **read‑only** (you can’t edit here). Stop the file viewer with `Ctrl+C` in the terminal where you ran `./view-files.sh`.

**Only use this on your home network** (no password).

### Option B: Full editor in the browser (code-server)

If you want to **edit** files in the browser (like VS Code):

1. On the Pi, install and run **code-server** (VS Code in the browser). See: https://github.com/coder/code-server
2. Open `http://YOUR-PI-IP:8080` (or the port code-server uses) and open the folder `/home/kolby`.

### Option C: Cursor or VS Code on your laptop (Remote-SSH)

If you use **Cursor** or **VS Code** on a laptop:

1. Add your Pi as an SSH host (e.g. `kolby@YOUR-PI-IP`).
2. Use “Remote-SSH: Connect to Host” and open the folder `/home/kolby`.

You’ll see all files in the sidebar and can edit them.

---

## Quick reference

| Goal                       | Where to go                                                          |
| -------------------------- | -------------------------------------------------------------------- |
| Use Kolb-Bot (chat, crew…) | Browser → `http://YOUR-PI-IP:3000`                                   |
| Watch the bot browse       | Browser → `http://YOUR-PI-IP:6080/vnc.html`                          |
| See project files (read)   | Run `./view-files.sh` on Pi, then browser → `http://YOUR-PI-IP:8082` |
| Get all URLs and IP        | On Pi: `./kolb-bot urls`                                             |

Replace `YOUR-PI-IP` with the IP you got from `./kolb-bot urls` or `hostname -I` / `tailscale ip -4`.
