// ---------------------------------------------------------------------------
// @ekaone/browse-ai — public API
// ---------------------------------------------------------------------------

// Catalog — core commands + extension API
export {
  CORE_CATALOG,
  extendCatalog,
  getActiveCatalog,
  resetCatalog,
  buildCatalogPrompt,
  isValidCommand,
  getCommandSchema,
  // individual groups (for extension pack authors)
  coreCatalog,
  keyboardCatalog,
  captureCatalog,
  waitCatalog,
  getCatalog,
  stateCatalog,
  streamCatalog,
} from "./catalog/index.js";

// Validator — Zod schemas + plan validation
export {
  StepSchema,
  PlanSchema,
  validateStep,
  validatePlan,
  buildSystemPrompt,
} from "./validator.js";

// Planner — AI → validated plan
export { generatePlan } from "./planner.js";

// Runner — plan → agent-browser execution
export { runPlan, formatPlan } from "./runner.js";

// Providers
export {
  ClaudeProvider,
  OpenAIProvider,
  OllamaProvider,
  createProvider,
} from "./providers/index.js";

// Types
export type {
  CatalogSchema,
  CommandSchema,
  ArgSchema,
  FlagSchema,
  Step,
  Plan,
  TokenUsage,
  ProviderResponse,
  AIProvider,
  RunnerOptions,
  StepResult,
  RunResult,
} from "./types.js";
