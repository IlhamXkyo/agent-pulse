# AgentPulse

A self-hosted observability dashboard and trace visualizer for autonomous AI agents.

When building multi-step agents with tool calling, debugging usually involves digging through messy terminal output or sending telemetry to third-party hosted services. AgentPulse runs locally on top of SQLite, providing a lightweight waterfall view of spans, tool invocations, and token usage without any cloud dependencies.

## Features

- **Trace Waterfall View**: Inspect latency breakdowns across planning, tool calls, and LLM completions.
- **Span Inspection**: View raw prompt inputs, function arguments, model names, and structured outputs for every step.
- **Agent Registry**: Track registered agents, foundation models, failure rates, and average response times.
- **Execution Playground**: Run test prompts locally with simulated search or sandbox tools to verify trace logging.
- **Evaluation Tracking**: Log benchmark results and quality scores directly alongside traces.
- **Local SQLite Storage**: Single-file database managed with Prisma. No external database or Docker setup required.

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm 10 or higher

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/IlhamXkyo/agent-pulse.git
cd agent-pulse
npm install
```

### Database Setup

Run Prisma to set up the local SQLite database and populate sample telemetry:

```bash
npx prisma db push
npm run db:seed
```

This creates a local `dev.db` file in the project root with initial agent records and trace histories.

### Running Locally

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

To build and run the production bundle:

```bash
npm run build
npm start
```

## Telemetry Ingest API

Send traces directly from your agent framework using HTTP POST:

**Endpoint:** `POST /api/traces`

### Headers

```http
Content-Type: application/json
Authorization: Bearer <api_key>
```

### Request Body Example

```json
{
  "agentId": "cm8... (agent ID from database)",
  "name": "AuthServiceRefactor",
  "status": "SUCCESS",
  "durationMs": 1420,
  "promptTokens": 1150,
  "completionTokens": 620,
  "costUsd": 0.012,
  "tags": "production,auth",
  "spans": [
    {
      "name": "planner:intent_parse",
      "spanType": "CHAIN",
      "status": "OK",
      "startOffsetMs": 0,
      "durationMs": 110,
      "input": "{\"instruction\": \"Refactor JWT refresh handler\"}",
      "output": "{\"steps\": [\"read_file\", \"generate_diff\"]}"
    },
    {
      "name": "tool:read_file",
      "spanType": "TOOL",
      "status": "OK",
      "startOffsetMs": 110,
      "durationMs": 280,
      "input": "{\"path\": \"src/auth.ts\"}",
      "output": "{\"bytes\": 2400}"
    },
    {
      "name": "llm:claude-3-5-sonnet",
      "spanType": "LLM",
      "status": "OK",
      "startOffsetMs": 390,
      "durationMs": 1030,
      "input": "{\"temperature\": 0.2}",
      "output": "{\"patch\": \"+ redis.set(...) \"}",
      "model": "claude-3-5-sonnet",
      "tokens": 840
    }
  ]
}
```

### Response

Returns the created trace with its assigned `traceId` and nested spans:

```json
{
  "success": true,
  "data": {
    "id": "cm8abc...",
    "traceId": "trc_9a12b3c4",
    "name": "AuthServiceRefactor",
    "status": "SUCCESS"
  }
}
```

## Project Structure

```text
agent-pulse/
├── prisma/
│   ├── schema.prisma       # Database schema (Agent, Trace, Span, Evaluation, ApiKey)
│   └── seed.ts             # Sample telemetry seed script
├── src/
│   ├── app/
│   │   ├── api/            # Route handlers (/traces, /agents, /evals, /playground/run)
│   │   ├── agents/         # Fleet management page
│   │   ├── evals/          # Benchmark and evaluation scoring page
│   │   ├── playground/     # Interactive testing UI
│   │   ├── settings/       # API key generator and docs
│   │   ├── traces/         # Full trace and span explorer
│   │   ├── layout.tsx      # App shell with dark theme
│   │   └── page.tsx        # Dashboard overview
│   ├── components/         # Reusable UI widgets (TraceWaterfall, MetricCard, Sidebar)
│   └── lib/                # Database client singleton and formatting helpers
├── .env.example
├── package.json
└── tsconfig.json
```

## Available Scripts

- `npm run dev`: Starts the Next.js development server with hot reload.
- `npm run build`: Compiles TypeScript and builds the production Next.js bundle.
- `npm start`: Runs the built production server.
- `npm run db:push`: Applies schema changes to local SQLite without creating migration files.
- `npm run db:seed`: Seeds the database with sample telemetry.
- `npm run db:studio`: Opens Prisma Studio GUI to inspect database records in the browser.

## Configuration

Environment variables can be set in `.env`:

```bash
# Path to SQLite database file
DATABASE_URL="file:./dev.db"

# Optional port configuration (defaults to 3000)
PORT=3000
```

## License

MIT License. See [LICENSE](LICENSE) for details.
