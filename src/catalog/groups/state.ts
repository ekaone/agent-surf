import type { CatalogSchema } from "../../types.js";

// ---------------------------------------------------------------------------
// Check State — boolean checks on element state (all executionKind: "read")
// ---------------------------------------------------------------------------
export const stateCatalog: CatalogSchema = {
  "is visible": {
    description: "Check if an element is visible",
    args: {
      selector: {
        type: "string",
        required: true,
        description: "CSS selector or @ref",
      },
    },
    flags: {},
    executionKind: "read",
  },

  "is enabled": {
    description: "Check if an element is enabled (not disabled)",
    args: {
      selector: {
        type: "string",
        required: true,
        description: "CSS selector or @ref",
      },
    },
    flags: {},
    executionKind: "read",
  },

  "is checked": {
    description: "Check if a checkbox or radio is checked",
    args: {
      selector: {
        type: "string",
        required: true,
        description: "CSS selector or @ref",
      },
    },
    flags: {},
    executionKind: "read",
  },
};
