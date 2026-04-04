import type { CatalogSchema } from "../../types.js";

// ---------------------------------------------------------------------------
// Capture — screenshot, pdf, snapshot
// ---------------------------------------------------------------------------
export const captureCatalog: CatalogSchema = {
  screenshot: {
    description: "Take a screenshot of the current page",
    args: {
      path: {
        type: "string",
        required: false,
        description: "Output file path",
      },
    },
    flags: {
      "--full": {
        type: "boolean",
        required: false,
        description: "Full page screenshot",
      },
      "--annotate": {
        type: "boolean",
        required: false,
        description: "Annotated with numbered element labels",
      },
      "--screenshot-dir": {
        type: "string",
        required: false,
        description: "Output directory",
      },
      "--screenshot-format": {
        type: "enum",
        values: ["png", "jpeg"] as const,
        required: false,
        description: "Image format",
      },
      "--screenshot-quality": {
        type: "number",
        required: false,
        description: "JPEG quality 0-100",
      },
    },
    executionKind: "chain",
  },

  pdf: {
    description: "Save the current page as a PDF",
    args: {
      path: { type: "string", required: true, description: "Output PDF path" },
    },
    flags: {},
    executionKind: "chain",
  },

  snapshot: {
    description:
      "Get the accessibility tree with element @refs — run this before interacting by @ref",
    args: {},
    flags: {
      "-i": {
        type: "boolean",
        required: false,
        description: "Interactive elements only",
      },
      "-c": {
        type: "boolean",
        required: false,
        description: "Compact — remove empty structural elements",
      },
      "-d": {
        type: "number",
        required: false,
        description: "Limit tree depth",
      },
      "-s": {
        type: "string",
        required: false,
        description: "Scope to CSS selector",
      },
    },
    executionKind: "read", // must run solo — output contains @refs for subsequent steps
  },
};
