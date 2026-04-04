import type { CatalogSchema } from "../../types.js";

// ---------------------------------------------------------------------------
// Get Info — read data from the page (all are executionKind: "read")
// ---------------------------------------------------------------------------
export const getCatalog: CatalogSchema = {
  "get text": {
    description: "Get the text content of an element",
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

  "get html": {
    description: "Get the innerHTML of an element",
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

  "get value": {
    description: "Get the current value of an input element",
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

  "get attr": {
    description: "Get an attribute value from an element",
    args: {
      selector: {
        type: "string",
        required: true,
        description: "CSS selector or @ref",
      },
      attribute: {
        type: "string",
        required: true,
        description: "Attribute name",
      },
    },
    flags: {},
    executionKind: "read",
  },

  "get title": {
    description: "Get the current page title",
    args: {},
    flags: {},
    executionKind: "read",
  },

  "get url": {
    description: "Get the current page URL",
    args: {},
    flags: {},
    executionKind: "read",
  },

  "get count": {
    description: "Count elements matching a selector",
    args: {
      selector: { type: "string", required: true, description: "CSS selector" },
    },
    flags: {},
    executionKind: "read",
  },

  "get box": {
    description: "Get the bounding box of an element",
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

  "get styles": {
    description: "Get computed styles of an element",
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

  "get cdp-url": {
    description: "Get the CDP WebSocket URL for the current session",
    args: {},
    flags: {},
    executionKind: "read",
  },
};
