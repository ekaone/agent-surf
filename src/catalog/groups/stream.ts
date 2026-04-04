import type { CatalogSchema } from "../../types.js";

// ---------------------------------------------------------------------------
// Stream — WebSocket streaming for live session observation
// ---------------------------------------------------------------------------
export const streamCatalog: CatalogSchema = {
  "stream enable": {
    description: "Start runtime WebSocket streaming for this session",
    args: {},
    flags: {
      "--port": {
        type: "number",
        required: false,
        description: "Bind streaming to a specific localhost port",
      },
    },
    executionKind: "chain",
  },

  "stream status": {
    description:
      "Show current streaming state, active port, and browser connection",
    args: {},
    flags: {},
    executionKind: "read",
  },

  "stream disable": {
    description: "Stop runtime WebSocket streaming",
    args: {},
    flags: {},
    executionKind: "chain",
  },
};
