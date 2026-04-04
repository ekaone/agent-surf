import { z } from "zod";
import {
  buildCatalogPrompt,
  getCommandSchema,
  isValidCommand,
} from "./catalog/index.js";
import type { Plan, Step } from "./types.js";

// ---------------------------------------------------------------------------
// Zod schemas — Layer 2 defense against hallucinated AI output
// ---------------------------------------------------------------------------

export const StepSchema = z.object({
  id: z.number().int().positive(),
  command: z.string().min(1),
  args: z.array(z.string()).default([]),
  flags: z
    .record(z.string(), z.union([z.string(), z.boolean(), z.number()]))
    .default({}),
  description: z.string().min(1),
});

export const PlanSchema = z.object({
  goal: z.string().min(1),
  steps: z.array(StepSchema).min(1).max(20),
});

// ---------------------------------------------------------------------------
// Layer 3: Catalog schema validation
// ---------------------------------------------------------------------------

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

export function validateStep(
  step: z.infer<typeof StepSchema>,
): ValidationResult {
  // Check command exists in catalog
  if (!isValidCommand(step.command)) {
    return {
      valid: false,
      reason: `"${step.command}" is not a recognized agent-browser command. Check the catalog for allowed commands.`,
    };
  }

  const schema = getCommandSchema(step.command)!;

  // Check required args are present
  const requiredArgs = Object.entries(schema.args ?? {}).filter(
    ([, v]) => v.required,
  );
  if (requiredArgs.length > step.args.length) {
    const missing = requiredArgs
      .slice(step.args.length)
      .map(([k]) => k)
      .join(", ");
    return {
      valid: false,
      reason: `Command "${step.command}" is missing required args: ${missing}`,
    };
  }

  // Check enum args have valid values
  const argEntries = Object.entries(schema.args ?? {});
  for (let i = 0; i < step.args.length; i++) {
    const argSchema = argEntries[i]?.[1];
    const argValue = step.args[i];
    if (argSchema?.type === "enum" && argSchema.values) {
      if (argValue && !argSchema.values.includes(argValue)) {
        const argName = argEntries[i]?.[0];
        if (argName) {
          return {
            valid: false,
            reason: `Arg "${argName}" for command "${step.command}" must be one of: ${argSchema.values.join(", ")}. Got: "${argValue}"`,
          };
        }
      }
    }
  }

  // Check flags exist in schema
  for (const flagKey of Object.keys(step.flags)) {
    const flagSchema = schema.flags?.[flagKey];
    if (!flagSchema) {
      return {
        valid: false,
        reason: `Flag "${flagKey}" is not valid for command "${step.command}".`,
      };
    }
    // Check enum flag values
    if (flagSchema.type === "enum" && flagSchema.values) {
      const val = String(step.flags[flagKey]);
      if (!flagSchema.values.includes(val)) {
        return {
          valid: false,
          reason: `Flag "${flagKey}" for command "${step.command}" must be one of: ${flagSchema.values.join(", ")}. Got: "${val}"`,
        };
      }
    }
  }

  return { valid: true };
}

// ---------------------------------------------------------------------------
// Enrich validated steps with executionKind from catalog
// ---------------------------------------------------------------------------

function enrichStep(step: z.infer<typeof StepSchema>): Step {
  const schema = getCommandSchema(step.command);
  return {
    ...step,
    executionKind: schema?.executionKind ?? "chain",
  };
}

// ---------------------------------------------------------------------------
// Full plan validation — runs all 3 layers
// ---------------------------------------------------------------------------

export interface PlanValidationResult {
  success: boolean;
  plan?: Plan;
  errors: string[];
}

export function validatePlan(raw: unknown): PlanValidationResult {
  const errors: string[] = [];

  // Layer 2: Zod shape
  const result = PlanSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues.map(
      (i) => `  step[${i.path.join(".")}]: ${i.message}`,
    );
    return { success: false, errors: issues };
  }

  // Layer 3: Catalog whitelist + schema
  for (const step of result.data.steps) {
    const check = validateStep(step);
    if (!check.valid) {
      errors.push(`  Step ${step.id} (${step.command}): ${check.reason}`);
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  // Enrich steps with executionKind
  const enrichedSteps = result.data.steps.map(enrichStep);

  return {
    success: true,
    plan: { ...result.data, steps: enrichedSteps },
    errors: [],
  };
}

// ---------------------------------------------------------------------------
// System prompt builder
// ---------------------------------------------------------------------------

export function buildSystemPrompt(): string {
  return `You are a browser automation planner. Given a user's goal in plain English, generate a precise JSON execution plan using agent-browser commands.

${buildCatalogPrompt()}

Rules:
- ONLY use commands listed above — never invent new ones
- Commands marked [READ] must be their own step — they cannot be chained
- Always include a "snapshot" step before using @ref selectors (e.g. @e1, @e2)
- Prefer semantic selectors (role, label, placeholder) over CSS when possible
- Use "wait --load networkidle" after navigation for slow pages
- Keep steps minimal — don't add unnecessary steps
- Each step must have a short, clear description
- flags object: use exact flag names including leading dashes (e.g. "--full", "-i")
- args array: ordered positional arguments only, no flag names in args

Respond ONLY with valid JSON matching this exact shape — no markdown, no explanation:
{
  "goal": "string describing the overall goal",
  "steps": [
    {
      "id": 1,
      "command": "open",
      "args": ["https://example.com"],
      "flags": {},
      "description": "Navigate to example.com"
    },
    {
      "id": 2,
      "command": "wait",
      "args": [],
      "flags": { "--load": "networkidle" },
      "description": "Wait for page to fully load"
    },
    {
      "id": 3,
      "command": "snapshot",
      "args": [],
      "flags": { "-i": true },
      "description": "Get interactive elements and @refs"
    },
    {
      "id": 4,
      "command": "fill",
      "args": ["@e2", "hello world"],
      "flags": {},
      "description": "Fill search input"
    },
    {
      "id": 5,
      "command": "screenshot",
      "args": ["result.png"],
      "flags": { "--full": true },
      "description": "Capture full page screenshot"
    }
  ]
}`;
}
