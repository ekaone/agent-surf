import type { CatalogSchema } from "../types.js";
import { coreCatalog } from "./groups/core.js";
import { keyboardCatalog } from "./groups/keyboard.js";
import { captureCatalog } from "./groups/capture.js";
import { waitCatalog } from "./groups/wait.js";
import { getCatalog } from "./groups/get.js";
import { stateCatalog } from "./groups/state.js";
import { streamCatalog } from "./groups/stream.js";

// ---------------------------------------------------------------------------
// CORE_CATALOG — composed from all built-in command groups
//
// To add a new group:
//   1. Create src/catalog/groups/<name>.ts
//   2. Import it here and spread into CORE_CATALOG
// ---------------------------------------------------------------------------

export const CORE_CATALOG: CatalogSchema = {
  ...coreCatalog,
  ...keyboardCatalog,
  ...captureCatalog,
  ...waitCatalog,
  ...getCatalog,
  ...stateCatalog,
  ...streamCatalog,
};

// Re-export groups individually for consumers who want fine-grained access
export { coreCatalog } from "./groups/core.js";
export { keyboardCatalog } from "./groups/keyboard.js";
export { captureCatalog } from "./groups/capture.js";
export { waitCatalog } from "./groups/wait.js";
export { getCatalog } from "./groups/get.js";
export { stateCatalog } from "./groups/state.js";
export { streamCatalog } from "./groups/stream.js";

// Re-export registry functions as the catalog public API
export {
  extendCatalog,
  getActiveCatalog,
  resetCatalog,
  isValidCommand,
  getCommandSchema,
  buildCatalogPrompt,
} from "./registry.js";
