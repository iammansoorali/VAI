# 🐐 LLM-GOAT — Vulnerable-by-Design AI Security Lab

> Practice attacking and defending OWASP LLM Top 10 (2025) and OWASP Agentic AI Top 10 (2026) vulnerabilities in realistic, isolated environments.

Inspired by [WebGoat](https://owasp.org/www-project-webgoat/) and [Juice Shop](https://owasp.org/www-project-juice-shop/) — but for AI/LLM security.

---

## 🚀 Quick Start

```bash
git clone <repo-url> llm-goat
cd llm-goat
chmod +x scripts/install.sh
./scripts/install.sh
```

Then open **http://localhost:8080**

Default credentials:
- Player: `player` / `llmgoat`
- Admin: `admin` / `llmgoat_admin`

---

## 🎯 Challenge Coverage

### OWASP LLM Top 10 (2025)
| ID | Challenge | Difficulty | Points |
|---|---|---|---|
| LLM01:2025 | Direct Prompt Injection | Beginner | 100 |
| LLM01:2025 | Indirect Prompt Injection (RAG) | Intermediate | 200 |
| LLM02:2025 | Training Data Extraction | Intermediate | 200 |
| LLM03:2025 | Poisoned Plugin Supply Chain | Intermediate | 250 |
| LLM04:2025 | RAG Data Poisoning | Intermediate | 250 |
| LLM05:2025 | Improper Output Handling | Intermediate | 200 |
| LLM06:2025 | Excessive Agency Abuse | Intermediate | 300 |
| LLM07:2025 | System Prompt Leakage | Beginner | 100 |
| LLM08:2025 | Embedding Weakness | Expert | 400 |
| LLM09:2025 | Hallucination Weaponization | Intermediate | 200 |
| LLM10:2025 | Unbounded Token Consumption | Beginner | 100 |

### OWASP Agentic Top 10 (2026)
| ID | Challenge | Difficulty | Points |
|---|---|---|---|
| ASI01:2026 | Agent Goal Hijack | Intermediate | 300 |
| ASI02:2026 | Tool Misuse & Exploitation | Intermediate | 300 |
| ASI03:2026 | Identity & Privilege Abuse | Expert | 400 |
| ASI04:2026 | Agentic Supply Chain (MCP) | Expert | 400 |
| ASI05:2026 | Unexpected Code Execution | Expert | 500 |
| ASI06:2026 | Memory & Context Poisoning | Expert | 400 |
| ASI07:2026 | Insecure Inter-Agent Comms | Expert | 400 |
| ASI08:2026 | Cascading Failures | Expert | 500 |
| ASI09:2026 | Human-Agent Trust Exploitation | Intermediate | 300 |
| ASI10:2026 | Rogue Agent | Expert | 500 |

---

## 🏗 Architecture

```
Browser → Nginx (8080) → React Frontend
                       → FastAPI Backend → Ollama (local LLM)
                                        → PostgreSQL
                                        → Redis (agent memory)
                                        → ChromaDB (vector store)
```

All components run in Docker. Challenges are isolated in sub-containers with:
- No internet access
- Read-only filesystems
- Resource limits (CPU/memory)
- Auto-reset after session timeout

---

## ⚙️ Requirements

| Requirement | Minimum | Recommended |
|---|---|---|
| RAM | 8 GB | 16 GB |
| Disk | 10 GB | 20 GB |
| CPU | 4 cores | 8 cores |
| Docker | 24.x | latest |
| GPU | Optional | NVIDIA (for faster LLM) |

---

## 🔐 Security Note

This platform is **intentionally vulnerable**. The vulnerabilities are scoped to challenge containers only. The platform infrastructure itself is hardened:
- JWT authentication on all routes
- Rate limiting (Nginx + FastAPI)
- Isolated Docker networks
- No cross-challenge data leakage
- Audit logging of all LLM calls

**Never expose this to the public internet.**

---

## 🗺 Roadmap

- [ ] All 20 challenge implementations
- [ ] CTF team mode / leaderboard
- [ ] Automated exploit checker
- [ ] Challenge solution writeups
- [ ] Import/export progress
- [ ] GPU acceleration guide

---

## 📄 License

MIT — OWASP GenAI Security Project

Based on:
- [OWASP Top 10 for LLM Applications 2025](https://genai.owasp.org)
- [OWASP Top 10 for Agentic Applications 2026](https://genai.owasp.org)
