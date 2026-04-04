import { buildSystemPrompt, validatePlan } from "./validator.js";
import type { AIProvider, Plan, TokenUsage } from "./types.js";

// ---------------------------------------------------------------------------
// Planner — Layer 1: AI generation + Layer 2+3: validation pipeline
// ---------------------------------------------------------------------------

export interface PlannerResult {
  plan: Plan;
  usage: TokenUsage;
}

export async function generatePlan(
  userPrompt: string,
  provider: AIProvider,
  debug = false,
): Promise<PlannerResult> {
  const systemPrompt = buildSystemPrompt();

  if (debug) {
    console.log("");
    console.log("┌─ System Prompt ──────────────────────────────────────────");
    systemPrompt
      .split("\n")
      .slice(0, 10)
      .forEach((l) => console.log("│  " + l));
    console.log("│  ...");
    console.log("└──────────────────────────────────────────────────────────");
    console.log("");
  }

  // Layer 1: AI generation
  const response = await provider.generate(userPrompt, systemPrompt);

  if (debug) {
    console.log("┌─ Raw AI Response ─────────────────────────────────────────");
    try {
      const parsed = JSON.parse(response.content);
      JSON.stringify(parsed, null, 2)
        .split("\n")
        .forEach((l) => console.log("│  " + l));
    } catch {
      console.log("│  " + response.content);
    }
    console.log("└───────────────────────────────────────────────────────────");
    console.log("");
  }

  // Strip markdown fences if provider wraps output
  const cleaned = response.content.replace(/```json|```/g, "").trim();

  // Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`AI returned invalid JSON:\n${cleaned}`);
  }

  // Layer 2 + 3: Zod shape + catalog validation
  const validation = validatePlan(parsed);
  if (!validation.success) {
    throw new Error(`Plan validation failed:\n${validation.errors.join("\n")}`);
  }

  return {
    plan: validation.plan!,
    usage: response.usage,
  };
}
