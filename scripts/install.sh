#!/usr/bin/env bash
# ============================================================
# LLM-GOAT — One-command installer
# Usage: ./scripts/install.sh
# ============================================================
set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; YELLOW='\033[1;33m'; NC='\033[0m'

echo -e "${CYAN}"
cat << 'EOF'
  _     _     __  __      ____  ___    _  _____
 | |   | |   |  \/  |    / ___|/ _ \  / \|_   _|
 | |   | |   | |\/| |   | |  _| | | |/ _ \ | |
 | |___| |___| |  | |   | |_| | |_| / ___ \| |
 |_____|_____|_|  |_|    \____|\___/_/   \_\_|

  Vulnerable-by-Design AI Security Lab v1.0
  OWASP LLM Top 10 (2025) + Agentic Top 10 (2026)
EOF
echo -e "${NC}"

# Check prerequisites
echo -e "${CYAN}[*] Checking prerequisites...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}[!] Docker not found. Install from https://docker.com${NC}"; exit 1
fi
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null 2>&1; then
    echo -e "${RED}[!] Docker Compose not found.${NC}"; exit 1
fi

echo -e "${GREEN}[✓] Docker found: $(docker --version)${NC}"

# Generate secret key
SECRET_KEY=$(openssl rand -hex 32 2>/dev/null || python3 -c "import secrets; print(secrets.token_hex(32))")

cat > .env << EOF
SECRET_KEY=${SECRET_KEY}
ENVIRONMENT=development
EOF

echo -e "${GREEN}[✓] Generated .env with secure secret key${NC}"

# Build and start
echo -e "${CYAN}[*] Building containers (first run may take 5-10 min for Ollama model download)...${NC}"
docker compose build --parallel

echo -e "${CYAN}[*] Starting LLM-GOAT...${NC}"
docker compose up -d

# Wait for health
echo -e "${CYAN}[*] Waiting for services to be ready...${NC}"
MAX_WAIT=90
ELAPSED=0
while ! curl -sf http://localhost:8080/api/health > /dev/null 2>&1; do
    sleep 3
    ELAPSED=$((ELAPSED + 3))
    if [ $ELAPSED -ge $MAX_WAIT ]; then
        echo -e "${YELLOW}[!] Services taking longer than expected. Check: docker compose logs${NC}"
        break
    fi
    echo -ne "${CYAN}   Waiting... ${ELAPSED}s${NC}\r"
done

echo -e "\n${GREEN}"
cat << 'EOF'
  ╔══════════════════════════════════════════════╗
  ║  LLM-GOAT is running!                        ║
  ║                                              ║
  ║  🌐 Open:  http://localhost:8080             ║
  ║  👤 Login: player / llmgoat                  ║
  ║  🔑 Admin: admin / llmgoat_admin             ║
  ║                                              ║
  ║  📖 Docs:  http://localhost:8080/docs        ║
  ║  🛑 Stop:  docker compose down               ║
  ╚══════════════════════════════════════════════╝
EOF
echo -e "${NC}"
echo -e "${YELLOW}⚠  WARNING: This platform contains intentionally vulnerable AI systems."
echo -e "   Run only in isolated/lab environments. Never expose to the internet.${NC}"
