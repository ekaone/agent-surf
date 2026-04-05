# @ekaone/agent-surf

AI-powered browser automation CLI. Write your goal in plain English, AI generates a validated `agent-browser` command plan, and the runner executes it step by step.

> Before using `agent-surf`, please install [agent-browser](https://agent-browser.dev/installation) first

# Quick Start

```bash
as "open github.com, search for agent-surf, take a screenshot"
```

```
◆ agent-surf
◒ Generating plan  [claude]
✔ Plan ready  (312 tokens)

┌─ Plan (5 steps) ──────────────────────────────────────────
│ 1. open https://github.com
│    Navigate to GitHub
│ 2. wait  --load networkidle
│    Wait for page to fully load
│ 3. snapshot  -i
│    Get interactive elements and @refs  [read]
│ 4. find placeholder "Search" fill "agent-surf"
│    Fill the search input
│ 5. screenshot result.png
│    Capture the result
└───────────────────────────────────────────────────────────

✔ Proceed? › yes

▶ Executing...
✔ Done — all 5 steps completed.
```

---

## Installation

```bash
npm install -g @ekaone/agent-surf
```

```bash
pnpm install -g @ekaone/agent-surf
```

> **Requires** [`agent-browser`](https://agent-browser.dev) to be installed:
> ```bash
> npm install -g agent-browser
> agent-browser install   # download browser binaries
> ```

## Setup

```bash
# Claude (default)
export ANTHROPIC_API_KEY=your_key_here

# OpenAI
export OPENAI_API_KEY=your_key_here

# Browser Use cloud execution (optional)
export BROWSER_USE_API_KEY=your_key_here
```

> Windows PowerShell: `$env:ANTHROPIC_API_KEY="your_key_here"`

---

## Usage

### Single goal

```bash
agent-surf "open example.com and take a screenshot"
as "open example.com and take a screenshot"
```

### Multi-step goals

Chain multiple browser actions in plain English using **"then"**, **"and"**, **"after that"**:

```bash
as "go to github.com, find the search box, type json-cli, press enter, screenshot the results"
```

```bash
as "open localhost:3000, wait for the page to load, scroll down, take a full page screenshot"
```

```bash
as "open example.com, check if the login button is visible, click it, fill email and password, submit"
```

### Full automation flows 🚀

```bash
as "open my app at localhost:3000, login with admin@test.com and password123, navigate to settings, take a screenshot"
```

```
◆ agent-surf
✔ Plan ready  (489 tokens)

┌─ Plan (8 steps) ──────────────────────────────────────────
│ 1. open http://localhost:3000
│    Navigate to local app
│ 2. wait  --load networkidle
│    Wait for page to load
│ 3. snapshot  -i
│    Discover interactive elements  [read]
│ 4. fill @e1 "admin@test.com"
│    Fill email field
│ 5. fill @e2 "password123"
│    Fill password field
│ 6. click @e3
│    Click login button
│ 7. wait  --load networkidle
│    Wait for dashboard to load
│ 8. screenshot dashboard.png
│    Capture dashboard
└───────────────────────────────────────────────────────────

✔ Proceed? › yes
```

### More examples

```bash
# Scrape page content
as "open news.ycombinator.com, get the text of the first post title"

# Form interaction
as "open example.com/form, fill name with 'John', select country 'Indonesia', check the terms checkbox, submit"

# Scroll and capture
as "open example.com, scroll down 1000px, wait 2000, take a full page screenshot"

# Tab management
as "open github.com, click the first repo link in a new tab"

# Debug a page
as "open example.com, get the page title, check if the nav is visible, take an annotated screenshot"

# PDF export
as "open example.com/report, wait for load, save as report.pdf"
```

---

## Options

```bash
agent-surf "<goal>" [options]
as "<goal>" [options]
```

```
Options
  --provider <n>            AI provider: claude | openai | ollama  (default: claude)
  -p, --browser-provider    agent-browser provider: browseruse | browserbase | browserless
  --session <n>             agent-browser session name
  --headed                  Show browser window (not headless)
  --yes, -y                 Skip confirmation prompt
  --dry-run                 Show plan without executing
  --debug                   Show system prompt and raw AI response
  --help, -h                Show this help message
  --version, -v             Show version
```

---

## How it works

```
User Goal (plain English)
    │
    ▼
AI Provider              ← Claude / OpenAI / Ollama
    │                      extracts ALL intents, sequences them
    ▼
JSON Plan                ← validated by Zod schema (max 20 steps)
    │
    ▼
Catalog Check            ← whitelist prevents hallucinated commands
    │
    ▼
Confirm (y/n)            ← review the full plan before execution
    │
    ▼
Runner                   ← segment-aware execution
    │                      chain steps  → joined with &&  (efficient)
    │                      read steps   → run solo, output captured
    ▼
agent-browser            ← spawned per segment, streams output live
```

### Chain vs Read steps

The runner is **segment-aware** — it groups steps intelligently:

- **Chain steps** (`open`, `click`, `fill`, `screenshot`, ...) are joined with `&&` in a single shell invocation. The `agent-browser` daemon persists across the chain, making this fast and efficient.
- **Read steps** (`snapshot`, `get text`, `is visible`, ...) run solo so their output can be captured. A `snapshot` step discovers `@ref` handles (e.g. `@e1`, `@e2`) used by subsequent interaction steps.

```
open github.com && wait --load networkidle   ← single chain invocation
snapshot -i                                  ← solo (captures @refs)
fill @e1 "json-cli" && press Enter && screenshot result.png  ← chain again
```

---

## AI Providers

```bash
# Claude (default)
as "open example.com and screenshot"

# OpenAI
as "open example.com and screenshot" --provider openai

# Ollama (local, no API key needed)
as "open example.com and screenshot" --provider ollama
```

## Browser Providers

`agent-browser` supports cloud and local browser execution:

```bash
# Local Chrome (default, no extra key needed)
as "open example.com"

# Browser Use cloud
as "open example.com" -p browseruse

# Browserbase cloud
as "open example.com" -p browserbase

# Browserless cloud
as "open example.com" -p browserless
```

## Environment variables

```bash
ANTHROPIC_API_KEY=sk-ant-...    # Claude (default AI provider)
OPENAI_API_KEY=sk-...           # OpenAI
BROWSER_USE_API_KEY=...         # Browser Use cloud execution
```

---

## Supported commands

`agent-surf` covers the full `agent-browser` command surface via a typed catalog:

| Group | Commands |
|---|---|
| **Navigation** | `open`, `close`, `back`, `forward`, `reload` |
| **Interaction** | `click`, `dblclick`, `fill`, `type`, `press`, `hover`, `focus`, `select`, `check`, `uncheck`, `scroll`, `scrollintoview`, `drag`, `upload` |
| **Keyboard** | `keyboard type`, `keyboard inserttext`, `keydown`, `keyup` |
| **Capture** | `screenshot`, `pdf`, `snapshot` |
| **Wait** | `wait` (element, ms, `--text`, `--url`, `--load`, `--fn`, `--state`) |
| **Get Info** | `get text`, `get html`, `get value`, `get attr`, `get title`, `get url`, `get count`, `get box`, `get styles`, `get cdp-url` |
| **Check State** | `is visible`, `is enabled`, `is checked` |
| **Streaming** | `stream enable`, `stream status`, `stream disable` |
| **CDP** | `connect`, `eval` |

---

## Extending the catalog

Add custom commands that are automatically included in AI planning and validation:

```ts
import { extendCatalog } from "@ekaone/agent-surf";

extendCatalog({
  "my custom command": {
    description: "Does something custom",
    args: {
      target: { type: "string", required: true, description: "Target selector" },
    },
    flags: {
      "--option": { type: "boolean", required: false, description: "An option" },
    },
    executionKind: "chain",
  },
});
```

---

## Programmatic API

Use `agent-surf` as a library in your own tools:

```ts
import { generatePlan, runPlan, createProvider } from "@ekaone/agent-surf";

const provider = createProvider("claude");

const { plan } = await generatePlan(
  "open example.com and take a screenshot",
  provider
);

const result = await runPlan(plan, {
  headed: true,
  session: "my-session",
});

console.log(result.success); // true
```

---

## Local development

```bash
pnpm install
pnpm dev "open example.com and screenshot"
pnpm test
pnpm build
```

---

## License

MIT © [Eka Prasetia](https://prasetia.me/)

## Links

- [npm Package](https://www.npmjs.com/package/@ekaone/agent-surf)
- [GitHub Repository](https://github.com/ekaone/agent-surf)
- [Issue Tracker](https://github.com/ekaone/agent-surf/issues)
- [agent-browser docs](https://agent-browser.dev)

⭐ If this helps you, please consider giving it a star on GitHub!