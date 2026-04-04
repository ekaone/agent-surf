#!/usr/bin/env node
import {
  intro,
  outro,
  spinner,
  confirm,
  cancel,
  note,
  log,
  isCancel,
} from "@clack/prompts";
import { generatePlan } from "./planner.js";
import { createProvider } from "./providers/index.js";
import { formatPlan, runPlan } from "./runner.js";
import type { ProviderName } from "./providers/index.js";
import type { RunnerOptions } from "./types.js";

// ---------------------------------------------------------------------------
// Arg parser — minimal, no external dep
// ---------------------------------------------------------------------------

interface CliArgs {
  goal: string;
  provider: ProviderName;
  browserProvider?: string;
  session?: string;
  yes: boolean;
  dryRun: boolean;
  debug: boolean;
  headed: boolean;
  help: boolean;
  version: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args = argv.slice(2);
  const result: CliArgs = {
    goal: "",
    provider: "claude",
    yes: false,
    dryRun: false,
    debug: false,
    headed: false,
    help: false,
    version: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case "--help":
      case "-h":
        result.help = true;
        break;
      case "--version":
      case "-v":
        result.version = true;
        break;
      case "--yes":
      case "-y":
        result.yes = true;
        break;
      case "--dry-run":
        result.dryRun = true;
        break;
      case "--debug":
        result.debug = true;
        break;
      case "--headed":
        result.headed = true;
        break;
      case "--provider":
        result.provider = args[++i] as ProviderName;
        break;
      case "--browser-provider":
      case "-p": {
        const val = args[++i];
        if (val) result.browserProvider = val;
        break;
      }
      case "--session": {
        const val = args[++i];
        if (val) result.session = val;
        break;
      }
      default:
        if (arg && !arg.startsWith("-") && !result.goal) {
          result.goal = arg;
        }
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Help text
// ---------------------------------------------------------------------------

const HELP = `
  agent-surf — AI-powered browser automation CLI

  Usage
    agent-surf "<your goal>" [options]
    as "<your goal>" [options]

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

  Examples
    as "open github.com and take a screenshot"
    as "go to example.com, find the search box, type hello, press enter"
    as "open localhost:3000, scroll down, take a full page screenshot"
    as "open example.com and screenshot" --dry-run
    as "open example.com and screenshot" --provider openai
    as "open example.com" -p browseruse
    as "open example.com" --headed --yes

  Environment
    ANTHROPIC_API_KEY       Required for Claude (default provider)
    OPENAI_API_KEY          Required for OpenAI
    BROWSER_USE_API_KEY     Required for Browser Use cloud execution

  Docs: https://github.com/ekaone/agent-surf
`;

// ---------------------------------------------------------------------------
// Preflight — check agent-browser is installed
// ---------------------------------------------------------------------------

async function checkAgentBrowser(): Promise<boolean> {
  try {
    const { execa } = await import("execa");
    const result = await execa("agent-browser", ["--version"], {
      reject: false,
      stdin: "ignore",
      stdout: "pipe",
      stderr: "pipe",
      windowsHide: process.platform === "win32",
    });
    return result.exitCode === 0;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = parseArgs(process.argv);

  if (args.version) {
    console.log("0.1.0");
    process.exit(0);
  }

  if (args.help || !args.goal) {
    console.log(HELP);
    process.exit(args.help ? 0 : 1);
  }

  // ── Intro ───
  intro("agent-surf");

  // ── Preflight check ───
  const agentBrowserOk = await checkAgentBrowser();
  if (!agentBrowserOk) {
    log.error("agent-browser is not installed.");
    log.info("Install it with: npm install -g agent-browser");
    await new Promise((r) => setTimeout(r, 100));
    process.exit(1);
  }

  // ── Build AI provider ───
  let provider;
  try {
    provider = createProvider(args.provider);
  } catch (err) {
    log.error(err instanceof Error ? err.message : String(err));
    await new Promise((r) => setTimeout(r, 100));
    process.exit(1);
  }

  // ── Generate plan ───
  const s = spinner();
  s.start(`Generating plan  [${args.provider}]`);

  let plan;
  try {
    const result = await generatePlan(args.goal, provider, args.debug);
    plan = result.plan;
    s.stop(`Plan ready  (${result.usage.totalTokens} tokens)`);
  } catch (err) {
    s.stop("Plan generation failed");
    log.error(err instanceof Error ? err.message : String(err));
    await new Promise((r) => setTimeout(r, 100));
    process.exit(1);
  }

  // ── Runner options ───
  const runnerOpts: RunnerOptions = {
    dryRun: args.dryRun,
    debug: args.debug,
    ...(args.session && { session: args.session }),
    ...(args.browserProvider && { provider: args.browserProvider }),
    headed: args.headed,
  };

  // ── Display plan ───
  note(formatPlan(plan, runnerOpts), `Plan  (${plan.steps.length} steps)`);

  if (args.dryRun) {
    outro("Dry run complete. No commands were executed.");
    await new Promise((r) => setTimeout(r, 100));
    process.exit(0);
  }

  // ── Confirm ───
  if (!args.yes) {
    const ok = await confirm({ message: "Proceed?" });

    if (isCancel(ok) || !ok) {
      cancel("Cancelled.");
      return;
    }
  }

  // ── Execute ───
  log.step("Executing...");

  const result = await runPlan(plan, runnerOpts);

  if (result.success) {
    outro(`Done — all ${result.steps.length} steps completed.`);
    await new Promise((r) => setTimeout(r, 100));
    process.exit(0);
  } else {
    log.error(`Failed at step ${result.failedAt}. Execution stopped.`);
    await new Promise((r) => setTimeout(r, 100));
    process.exit(1);
  }
}

main().catch((err) => {
  log.error(`Unexpected error: ${err instanceof Error ? err.message : err}`);
  process.exitCode = 1;
});
