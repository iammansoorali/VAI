# VAI - Vulnerable-by-Design AI Security Lab

> Practice attacking and defending OWASP LLM Top 10 (2025) and OWASP Agentic AI Top 10 (2026) vulnerabilities in realistic, isolated environments.

Inspired by [WebGoat](https://owasp.org/www-project-webgoat/) and [Juice Shop](https://owasp.org/www-project-juice-shop/) — but for AI/LLM security.

---

## 🚀 Quick Start

```bash
git clone https://github.com/iammansoorali/VAI/
cd VAI
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
| ID | Challenge | Difficulty | 
|---|---|---|
| LLM01:2025 | Direct Prompt Injection | Beginner | 
| LLM01:2025 | Indirect Prompt Injection (RAG) | Intermediate |
| LLM02:2025 | Training Data Extraction | Intermediate |
| LLM03:2025 | Poisoned Plugin Supply Chain | Intermediate |
| LLM04:2025 | RAG Data Poisoning | Intermediate |
| LLM05:2025 | Improper Output Handling | Intermediate |
| LLM06:2025 | Excessive Agency Abuse | Intermediate |
| LLM07:2025 | System Prompt Leakage | Beginner |
| LLM08:2025 | Embedding Weakness | Expert |
| LLM09:2025 | Hallucination Weaponization | Intermediate |
| LLM10:2025 | Unbounded Token Consumption | Beginner |

### OWASP Agentic Top 10 (2026)
| ID | Challenge | Difficulty |
|---|---|---|
| ASI01:2026 | Agent Goal Hijack | Intermediate |
| ASI02:2026 | Tool Misuse & Exploitation | Intermediate |
| ASI03:2026 | Identity & Privilege Abuse | Expert |
| ASI04:2026 | Agentic Supply Chain (MCP) | Expert |
| ASI05:2026 | Unexpected Code Execution | Expert |
| ASI06:2026 | Memory & Context Poisoning | Expert |
| ASI07:2026 | Insecure Inter-Agent Comms | Expert |
| ASI08:2026 | Cascading Failures | Expert |
| ASI09:2026 | Human-Agent Trust Exploitation | Intermediate |
| ASI10:2026 | Rogue Agent | Expert |

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
