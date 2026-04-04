import type { CatalogSchema } from "../types.js";
import { coreCatalog } from "./groups/core.js";
import { keyboardCatalog } from "./groups/keyboard.js";
import { captureCatalog } from "./groups/capture.js";
import { waitCatalog } from "./groups/wait.js";
import { getCatalog } from "./groups/get.js";
import { stateCatalog } from "./groups/state.js";
import { streamCatalog } from "./groups/stream.js";

// ---------------------------------------------------------------------------
// CORE_CATALOG — single source of truth (imported by registry + index)
// Kept out of index.ts so registry does not depend on index (avoids circular
// imports and broken bundle order: ACTIVE_CATALOG must init after CORE_CATALOG).
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
