import { execa } from "execa";
import type {
  Plan,
  RunnerOptions,
  RunResult,
  Step,
  StepResult,
} from "./types.js";

// ---------------------------------------------------------------------------
// Command builder — converts a Step into argv for execa
// ---------------------------------------------------------------------------

function buildArgv(step: Step, opts: RunnerOptions): string[] {
  const argv: string[] = [];

  // Global agent-browser options passthrough
  if (opts.session) argv.push("--session", opts.session);
  if (opts.provider) argv.push("-p", opts.provider);
  if (opts.headed) argv.push("--headed");

  // Command name — split on space for sub-commands ("keyboard type" → ["keyboard", "type"])
  argv.push(...step.command.split(" "));

  // Positional args
  argv.push(...step.args);

  // Flags
  for (const [flag, val] of Object.entries(step.flags)) {
    if (val === true) {
      argv.push(flag);
    } else if (val !== false) {
      argv.push(flag, String(val));
    }
  }

  return argv;
}

// Readable command string for display/debug
function buildCommandString(step: Step, opts: RunnerOptions): string {
  return ["agent-browser", ...buildArgv(step, opts)].join(" ");
}

// ---------------------------------------------------------------------------
// Segment builder — groups consecutive chain steps, isolates read steps
// ---------------------------------------------------------------------------

type Segment = { kind: "chain"; steps: Step[] } | { kind: "read"; step: Step };

function buildSegments(steps: Step[]): Segment[] {
  const segments: Segment[] = [];
  let chainBuffer: Step[] = [];

  const flushChain = () => {
    if (chainBuffer.length > 0) {
      segments.push({ kind: "chain", steps: [...chainBuffer] });
      chainBuffer = [];
    }
  };

  for (const step of steps) {
    if (step.executionKind === "read") {
      flushChain();
      segments.push({ kind: "read", step });
    } else {
      chainBuffer.push(step);
    }
  }

  flushChain();
  return segments;
}

// ---------------------------------------------------------------------------
// Execute a chain segment — steps joined with && via execa shell
// ---------------------------------------------------------------------------

async function execChain(
  steps: Step[],
  opts: RunnerOptions,
  debug: boolean,
): Promise<{ output: string; exitCode: number }> {
  const chain = steps
    .map((s) => ["agent-browser", ...buildArgv(s, opts)].join(" "))
    .join(" && ");

  if (debug) {
    console.log(`  $ ${chain}`);
  }

  try {
    const proc = execa(chain, {
      shell: true,
      stdout: "pipe",
      stderr: "pipe",
      reject: false,
    });

    proc.stdout?.on("data", (chunk: Buffer) => process.stdout.write(chunk));
    proc.stderr?.on("data", (chunk: Buffer) => process.stderr.write(chunk));

    const result = await proc;
    return {
      output: (result.stdout ?? "") + (result.stderr ?? ""),
      exitCode: result.exitCode ?? 1,
    };
  } catch (err) {
    return {
      output: err instanceof Error ? err.message : String(err),
      exitCode: 1,
    };
  }
}

// ---------------------------------------------------------------------------
// Execute a single read step via execa — streams output live
// ---------------------------------------------------------------------------

async function execRead(
  argv: string[],
  debug: boolean,
): Promise<{ output: string; exitCode: number }> {
  if (debug) {
    console.log(`  $ agent-browser ${argv.join(" ")}`);
  }

  try {
    const proc = execa("agent-browser", argv, {
      stdout: "pipe",
      stderr: "pipe",
      reject: false,
    });

    proc.stdout?.on("data", (chunk: Buffer) => process.stdout.write(chunk));
    proc.stderr?.on("data", (chunk: Buffer) => process.stderr.write(chunk));

    const result = await proc;
    return {
      output: (result.stdout ?? "") + (result.stderr ?? ""),
      exitCode: result.exitCode ?? 1,
    };
  } catch (err) {
    return {
      output: err instanceof Error ? err.message : String(err),
      exitCode: 1,
    };
  }
}

// ---------------------------------------------------------------------------
// Parse @refs from snapshot output
// e.g. "@e1 [button] Submit" → { "@e1": "button: Submit" }
// ---------------------------------------------------------------------------

function parseRefs(output: string): Record<string, string> {
  const refs: Record<string, string> = {};
  const pattern = /(@e\d+)\s+\[([^\]]+)\]\s+"?([^"\n]+)"?/g;
  let match;
  while ((match = pattern.exec(output)) !== null) {
    const key = match[1];
    const type = match[2];
    const content = match[3]?.trim();
    if (key && type && content) {
      refs[key] = `${type}: ${content}`;
    }
  }
  return refs;
}

// ---------------------------------------------------------------------------
// Main runner
// ---------------------------------------------------------------------------

export async function runPlan(
  plan: Plan,
  options: RunnerOptions = {},
): Promise<RunResult> {
  const { dryRun = false, debug = false } = options;
  const results: StepResult[] = [];
  const segments = buildSegments(plan.steps);

  if (debug) {
    console.log(`\n● Segments: ${segments.length}`);
    segments.forEach((seg, i) => {
      if (seg.kind === "chain") {
        console.log(
          `  ${i + 1}. chain (${seg.steps.length} step${seg.steps.length > 1 ? "s" : ""})`,
        );
      } else {
        console.log(`  ${i + 1}. read  → ${seg.step.command}`);
      }
    });
    console.log("");
  }

  for (const segment of segments) {
    // ── Chain segment ──────────────────────────────────────────────────────
    if (segment.kind === "chain") {
      if (dryRun) {
        for (const step of segment.steps) {
          console.log(`  [dry-run] ${buildCommandString(step, options)}`);
          results.push({
            stepId: step.id,
            command: step.command,
            output: "",
            exitCode: 0,
            success: true,
          });
        }
        continue;
      }

      const { output, exitCode } = await execChain(
        segment.steps,
        options,
        debug,
      );
      const success = exitCode === 0;

      for (const step of segment.steps) {
        results.push({
          stepId: step.id,
          command: step.command,
          output,
          exitCode,
          success,
        });
      }

      if (!success) {
        const firstStep = segment.steps[0];
        if (!firstStep) {
          return { success: false, steps: results };
        }
        return {
          success: false,
          steps: results,
          failedAt: firstStep.id,
        };
      }

      // ── Read segment ───────────────────────────────────────────────────────
    } else {
      const { step } = segment;

      if (dryRun) {
        console.log(`  [dry-run] ${buildCommandString(step, options)}  [READ]`);
        results.push({
          stepId: step.id,
          command: step.command,
          output: "",
          exitCode: 0,
          success: true,
        });
        continue;
      }

      const argv = buildArgv(step, options);
      const { output, exitCode } = await execRead(argv, debug);
      const success = exitCode === 0;

      const stepResult: StepResult = {
        stepId: step.id,
        command: step.command,
        output,
        exitCode,
        success,
      };

      // Parse @refs from snapshot output
      if (step.command === "snapshot" && success) {
        stepResult.refs = parseRefs(output);
        if (debug && Object.keys(stepResult.refs).length > 0) {
          console.log("  ● Refs discovered:");
          Object.entries(stepResult.refs).forEach(([ref, label]) =>
            console.log(`    ${ref} → ${label}`),
          );
        }
      }

      results.push(stepResult);

      if (!success) {
        return { success: false, steps: results, failedAt: step.id };
      }
    }
  }

  return { success: true, steps: results };
}

// ---------------------------------------------------------------------------
// Format plan — used by cli.ts to display steps inside @clack/prompts note()
// ---------------------------------------------------------------------------

export function formatPlan(plan: Plan, options: RunnerOptions = {}): string {
  return plan.steps
    .map((step) => {
      const cmd = buildCommandString(step, options).replace(
        "agent-browser ",
        "",
      );
      const kindTag = step.executionKind === "read" ? " [read]" : "";
      return `${step.id}. ${cmd}${kindTag}\n   ${step.description}`;
    })
    .join("\n");
}
