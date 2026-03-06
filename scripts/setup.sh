#!/usr/bin/env bash
# setup.sh — First-time setup for Kolb-Bot on a fresh Raspberry Pi
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
echo '  _  __     _ _         ____        _   '
echo ' | |/ /    | | |       |  _ \      | |  '
echo ' | . / ___ | | |__     | |_) | ___ | |_ '
echo ' |  < / _ \| |  _ \    |  _ < / _ \| __|'
echo ' | . \ (_) | | |_) |   | |_) | (_) | |_ '
echo ' |_|\_\___/|_|_.__/    |____/ \___/ \__|'
echo -e "${NC}"
echo ""

# Check Docker
if ! command -v docker &>/dev/null; then
  echo -e "${YELLOW}Docker not found. Installing...${NC}"
  curl -fsSL https://get.docker.com | sudo sh
  sudo usermod -aG docker "$USER"
  echo -e "${GREEN}Docker installed. You may need to log out and back in for group changes.${NC}"
fi

if ! docker compose version &>/dev/null; then
  echo -e "${YELLOW}Docker Compose plugin not found. Please install docker-compose-plugin.${NC}"
  exit 1
fi

# Generate .env
if [ ! -f .env ]; then
  echo -e "${YELLOW}Generating .env with secure random secrets...${NC}"
  cp .env.example .env
  TOKEN=$(openssl rand -hex 32 2>/dev/null || head -c 64 /dev/urandom | od -An -tx1 | tr -d ' \n')
  SECRET=$(openssl rand -hex 32 2>/dev/null || head -c 64 /dev/urandom | od -An -tx1 | tr -d ' \n')
  sed -i "s/KOLB_BOT_GATEWAY_TOKEN=.*/KOLB_BOT_GATEWAY_TOKEN=${TOKEN}/" .env
  sed -i "s/WEBUI_SECRET_KEY=.*/WEBUI_SECRET_KEY=${SECRET}/" .env
  echo -e "${GREEN}.env created with auto-generated secrets.${NC}"
  echo -e "${YELLOW}Edit .env to add your API keys before starting.${NC}"
else
  echo -e "${GREEN}.env already exists.${NC}"
fi

echo ""
echo -e "${GREEN}Setup complete!${NC}"
echo ""
echo -e "Next steps:"
echo -e "  1. Edit ${CYAN}.env${NC} to add your AI provider API keys"
echo -e "  2. Run ${CYAN}./kolb-bot up${NC} to start all services"
echo -e "  3. Open ${CYAN}http://$(hostname -I 2>/dev/null | awk '{print $1}' || echo 'your-pi-ip'):3000${NC}"
echo ""
