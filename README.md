# AgentPulse ⚡

> **Next-Gen Autonomous AI Agent Observability, Traces Waterfall & Interactive Playground Studio**

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.3-2d3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![SQLite](https://img.shields.io/badge/SQLite-Local_Embedded-003b57?style=flat-square&logo=sqlite)](https://www.sqlite.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg?style=flat-square)](LICENSE)

AgentPulse provides production-grade observability, distributed tracing, and benchmark evaluation for autonomous AI agents and LLM chains. Built with an ultra-clean, dark cyberpunk aesthetic inspired by Linear and Raycast, AgentPulse delivers sub-millisecond trace inspection without external vendor lock-in.

---

## 🌟 Key Highlights

- **Interactive Trace Waterfall**: Visualize complex multi-agent execution graphs, tool calls, and LLM completions with precision timing and offset bars.
- **Span Inspector Drawer**: Drill down into raw input prompts, tool parameters, token usage, and structured outputs for every step.
- **Autonomous Agent Registry**: Manage your entire agent fleet across multiple foundation models (Claude 3.5 Sonnet, GPT-4o, DeepSeek R1, Gemini 1.5 Pro).
- **Execution Playground & Simulator**: Test agent prompts interactively with web search tools and sandboxed Python runners while streaming live telemetry into the database.
- **Evaluations & Benchmark Suite**: Continuous LLM-as-a-Judge scoring, hallucination tracking, and compliance metrics.
- **Secure Telemetry Ingestion API**: OpenTelemetry-compatible endpoints protected by scoped API keys.
- **Self-Contained Architecture**: Powered by embedded SQLite via Prisma ORM for instant zero-config local development.

---

## 🏗️ Architecture

```text
  [ External Agent Runners ]     [ Web Playground UI ]
              │                            │
              ▼                            ▼
  [ POST /api/traces ]         [ POST /api/playground/run ]
              │                            │
              └──────────────┬─────────────┘
                             │
                             ▼
               [ Next.js 15 App Router ]
                             │
                  [ Prisma 6.3 ORM ]
                             │
                    [ SQLite Engine ]
          ┌──────────────────┼──────────────────┐
          ▼                  ▼                  ▼
     (Agents)             (Traces)         (Evaluations)
                             │
                             ▼
                          (Spans)
```

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/IlhamXkyo/agent-pulse.git
cd agent-pulse
```

### 2. Install dependencies
```bash
npm install
```

### 3. Initialize SQLite Database & Seed Data
```bash
# Push database schema to local SQLite dev.db
npx prisma db push

# Populate with realistic AI agent traces and telemetry
npm run db:seed
```

### 4. Launch Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 Telemetry Ingest API

You can stream traces directly from your Python or TypeScript agents using the `/api/traces` endpoint:

```bash
curl -X POST http://localhost:3000/api/traces \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "<agent_id>",
    "name": "AutonomousCodeRefactorWorkflow",
    "status": "SUCCESS",
    "durationMs": 1840,
    "promptTokens": 1420,
    "completionTokens": 890,
    "costUsd": 0.0175,
    "tags": "production,auth,refactor",
    "spans": [
      {
        "name": "tool_call:read_codebase",
        "spanType": "TOOL",
        "status": "OK",
        "startOffsetMs": 120,
        "durationMs": 340,
        "input": "{\"path\": \"src/auth.ts\"}",
        "output": "{\"bytesRead\": 4192}"
      },
      {
        "name": "llm_generate:claude-3-5-sonnet",
        "spanType": "LLM",
        "status": "OK",
        "startOffsetMs": 460,
        "durationMs": 1380,
        "input": "{\"temperature\": 0.2}",
        "output": "{\"diff\": \"+ redis.set(...) \"}"
      }
    ]
  }'
```

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router, Server Actions & Route Handlers)
- **Frontend**: React 19, Tailwind CSS v3.4, Lucide React icons
- **ORM / Database**: Prisma 6.3 with SQLite
- **Runtime**: Node.js v20+

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

Developed with ❤️ by **[IlhamXkyo](https://github.com/IlhamXkyo)**.
