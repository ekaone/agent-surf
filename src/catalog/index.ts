export { CORE_CATALOG } from "./core-catalog.js";

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
