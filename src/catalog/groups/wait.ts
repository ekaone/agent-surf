import type { CatalogSchema } from "../../types.js";

// ---------------------------------------------------------------------------
// Wait — versatile wait with multiple modes
// ---------------------------------------------------------------------------
export const waitCatalog: CatalogSchema = {
  wait: {
    description: "Wait for an element, time, text, URL pattern, or load state",
    args: {
      target: {
        type: "string",
        required: false,
        description: "CSS selector to wait for, or milliseconds to wait",
      },
    },
    flags: {
      "--text": {
        type: "string",
        required: false,
        description: "Wait for text substring to appear on page",
      },
      "--url": {
        type: "string",
        required: false,
        description: "Wait for URL to match pattern",
      },
      "--load": {
        type: "enum",
        values: ["load", "domcontentloaded", "networkidle"] as const,
        required: false,
        description: "Wait for page load state",
      },
      "--fn": {
        type: "string",
        required: false,
        description: "Wait for JavaScript condition to be truthy",
      },
      "--download": {
        type: "string",
        required: false,
        description: "Wait for a file download to complete",
      },
      "--state": {
        type: "enum",
        values: ["visible", "hidden", "attached", "detached"] as const,
        required: false,
        description: "Wait for element to reach a specific state",
      },
    },
    executionKind: "chain",
  },
};
