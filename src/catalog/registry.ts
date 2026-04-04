import type { CatalogSchema } from "../types.js";
import { CORE_CATALOG } from "./index.js";

// ---------------------------------------------------------------------------
// Extensible registry — core + user extensions
// ---------------------------------------------------------------------------

let ACTIVE_CATALOG: CatalogSchema = { ...CORE_CATALOG };

/**
 * Extend the catalog with custom commands.
 * Extended commands are automatically included in AI system prompt
 * generation and step validation.
 *
 * @example
 * // Third-party extension pack
 * extendCatalog({
 *   "my command": {
 *     description: "...",
 *     args: { ... },
 *     flags: { ... },
 *     executionKind: "chain",
 *   }
 * });
 */
export function extendCatalog(commands: CatalogSchema): void {
  ACTIVE_CATALOG = { ...ACTIVE_CATALOG, ...commands };
}

/**
 * Get the current active catalog (core + any extensions).
 */
export function getActiveCatalog(): CatalogSchema {
  return ACTIVE_CATALOG;
}

/**
 * Reset catalog back to core only.
 * Useful for testing or isolating extension effects.
 */
export function resetCatalog(): void {
  ACTIVE_CATALOG = { ...CORE_CATALOG };
}

/**
 * Check if a command name exists in the active catalog.
 */
export function isValidCommand(command: string): boolean {
  return command in ACTIVE_CATALOG;
}

/**
 * Get the schema for a specific command, or null if not found.
 */
export function getCommandSchema(command: string) {
  return ACTIVE_CATALOG[command] ?? null;
}

/**
 * Build the catalog description injected into the AI system prompt.
 * Dynamically reflects all registered commands including extensions.
 */
export function buildCatalogPrompt(): string {
  const lines = Object.entries(ACTIVE_CATALOG).map(([name, schema]) => {
    const argList = Object.entries(schema.args ?? {})
      .map(([k, v]) => {
        const label = v.required ? `<${k}>` : `[${k}]`;
        const hint = v.type === "enum" ? ` (${v.values?.join("|")})` : "";
        return `${label}${hint}`;
      })
      .join(" ");

    const flagList = Object.entries(schema.flags ?? {})
      .map(([k, v]) => {
        const hint = v.type === "enum" ? ` (${v.values?.join("|")})` : "";
        return v.required ? `${k}${hint}` : `[${k}${hint}]`;
      })
      .join(" ");

    const sig = `  ${name} ${argList} ${flagList}`.trimEnd();
    const kind = schema.executionKind === "read" ? " [READ]" : "";
    return `${sig}  — ${schema.description}${kind}`;
  });

  return `Allowed agent-browser commands:\n${lines.join("\n")}

Note: Commands marked [READ] must run standalone — their output (e.g. @refs from snapshot) is needed before subsequent steps can execute.`;
}
