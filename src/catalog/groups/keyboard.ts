import type { CatalogSchema } from "../../types.js";

// ---------------------------------------------------------------------------
// Keyboard — low-level key input commands
// ---------------------------------------------------------------------------
export const keyboardCatalog: CatalogSchema = {
  "keyboard type": {
    description:
      "Type text at current focus using real keystrokes (no selector needed)",
    args: {
      text: { type: "string", required: true, description: "Text to type" },
    },
    flags: {},
    executionKind: "chain",
  },

  "keyboard inserttext": {
    description: "Insert text at current focus without firing key events",
    args: {
      text: { type: "string", required: true, description: "Text to insert" },
    },
    flags: {},
    executionKind: "chain",
  },

  keydown: {
    description: "Hold a key down",
    args: {
      key: { type: "string", required: true, description: "Key to hold" },
    },
    flags: {},
    executionKind: "chain",
  },

  keyup: {
    description: "Release a held key",
    args: {
      key: { type: "string", required: true, description: "Key to release" },
    },
    flags: {},
    executionKind: "chain",
  },
};
