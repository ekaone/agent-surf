// ---------------------------------------------------------------------------
// Core types for @ekaone/browse-ai
// ---------------------------------------------------------------------------

export type ArgType = "string" | "number" | "boolean" | "enum";

export interface ArgSchema {
  type: ArgType;
  values?: readonly string[]; // for enum type
  required: boolean;
  description?: string;
}

export interface FlagSchema {
  type: ArgType;
  values?: readonly string[]; // for enum type
  required: boolean;
  description?: string;
}

export interface CommandSchema {
  description: string;
  args?: Record<string, ArgSchema>;
  flags?: Record<string, FlagSchema>;
  /** "chain" — safe to join with &&, no intermediate output needed
   *  "read"  — must run solo, output is parsed before next step */
  executionKind: "chain" | "read";
}

export type CatalogSchema = Record<string, CommandSchema>;

// ---------------------------------------------------------------------------
// Plan types
// ---------------------------------------------------------------------------

export interface Step {
  id: number;
  command: string;
  args: string[];
  flags: Record<string, string | boolean | number>;
  description: string;
  /** Resolved from catalog at validation time */
  executionKind: "chain" | "read";
}

export interface Plan {
  goal: string;
  steps: Step[];
}

// ---------------------------------------------------------------------------
// Provider types
// ---------------------------------------------------------------------------

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface ProviderResponse {
  content: string;
  usage: TokenUsage;
}

export interface AIProvider {
  name: string;
  generate(userPrompt: string, systemPrompt: string): Promise<ProviderResponse>;
}

// ---------------------------------------------------------------------------
// Runner types
// ---------------------------------------------------------------------------

export interface RunnerOptions {
  dryRun?: boolean;
  debug?: boolean;
  session?: string;
  provider?: string; // agent-browser provider: browseruse, browserbase, etc.
  headed?: boolean;
}

export interface StepResult {
  stepId: number;
  command: string;
  output: string;
  exitCode: number;
  success: boolean;
  /** Parsed @refs from snapshot output, if applicable */
  refs?: Record<string, string>;
}

export interface RunResult {
  success: boolean;
  steps: StepResult[];
  failedAt?: number;
}
