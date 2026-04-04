import type { CatalogSchema } from "../../types.js";

// ---------------------------------------------------------------------------
// Core — Navigation + Interaction commands
// ---------------------------------------------------------------------------
export const coreCatalog: CatalogSchema = {
  // Navigation
  open: {
    description: "Navigate to a URL",
    args: {
      url: {
        type: "string",
        required: true,
        description: "URL to navigate to",
      },
    },
    flags: {},
    executionKind: "chain",
  },

  close: {
    description: "Close the browser",
    args: {},
    flags: {
      "--all": {
        type: "boolean",
        required: false,
        description: "Close all active sessions",
      },
    },
    executionKind: "chain",
  },

  back: {
    description: "Go back in browser history",
    args: {},
    flags: {},
    executionKind: "chain",
  },

  forward: {
    description: "Go forward in browser history",
    args: {},
    flags: {},
    executionKind: "chain",
  },

  reload: {
    description: "Reload the current page",
    args: {},
    flags: {},
    executionKind: "chain",
  },

  // Interaction
  click: {
    description: "Click an element by CSS selector or @ref",
    args: {
      selector: {
        type: "string",
        required: true,
        description: "CSS selector or @ref",
      },
    },
    flags: {
      "--new-tab": {
        type: "boolean",
        required: false,
        description: "Open link in new tab",
      },
    },
    executionKind: "chain",
  },

  dblclick: {
    description: "Double-click an element",
    args: {
      selector: {
        type: "string",
        required: true,
        description: "CSS selector or @ref",
      },
    },
    flags: {},
    executionKind: "chain",
  },

  fill: {
    description: "Clear an input and fill it with text",
    args: {
      selector: {
        type: "string",
        required: true,
        description: "CSS selector or @ref",
      },
      text: { type: "string", required: true, description: "Text to fill" },
    },
    flags: {},
    executionKind: "chain",
  },

  type: {
    description: "Type into an element without clearing it first",
    args: {
      selector: {
        type: "string",
        required: true,
        description: "CSS selector or @ref",
      },
      text: { type: "string", required: true, description: "Text to type" },
    },
    flags: {},
    executionKind: "chain",
  },

  press: {
    description: "Press a key (e.g. Enter, Tab, Control+a)",
    args: {
      key: { type: "string", required: true, description: "Key name or combo" },
    },
    flags: {},
    executionKind: "chain",
  },

  hover: {
    description: "Hover over an element",
    args: {
      selector: {
        type: "string",
        required: true,
        description: "CSS selector or @ref",
      },
    },
    flags: {},
    executionKind: "chain",
  },

  focus: {
    description: "Focus an element",
    args: {
      selector: {
        type: "string",
        required: true,
        description: "CSS selector or @ref",
      },
    },
    flags: {},
    executionKind: "chain",
  },

  select: {
    description: "Select a dropdown option by value",
    args: {
      selector: {
        type: "string",
        required: true,
        description: "CSS selector or @ref",
      },
      value: {
        type: "string",
        required: true,
        description: "Option value to select",
      },
    },
    flags: {},
    executionKind: "chain",
  },

  check: {
    description: "Check a checkbox",
    args: {
      selector: {
        type: "string",
        required: true,
        description: "CSS selector or @ref",
      },
    },
    flags: {},
    executionKind: "chain",
  },

  uncheck: {
    description: "Uncheck a checkbox",
    args: {
      selector: {
        type: "string",
        required: true,
        description: "CSS selector or @ref",
      },
    },
    flags: {},
    executionKind: "chain",
  },

  scroll: {
    description: "Scroll the page or a specific element",
    args: {
      dir: {
        type: "enum",
        values: ["up", "down", "left", "right"] as const,
        required: true,
        description: "Scroll direction",
      },
      px: { type: "number", required: false, description: "Pixels to scroll" },
    },
    flags: {
      "--selector": {
        type: "string",
        required: false,
        description: "Element to scroll",
      },
    },
    executionKind: "chain",
  },

  scrollintoview: {
    description: "Scroll an element into the visible viewport",
    args: {
      selector: {
        type: "string",
        required: true,
        description: "CSS selector or @ref",
      },
    },
    flags: {},
    executionKind: "chain",
  },

  drag: {
    description: "Drag an element to a target",
    args: {
      source: {
        type: "string",
        required: true,
        description: "Source CSS selector or @ref",
      },
      target: {
        type: "string",
        required: true,
        description: "Target CSS selector or @ref",
      },
    },
    flags: {},
    executionKind: "chain",
  },

  upload: {
    description: "Upload files via a file input element",
    args: {
      selector: {
        type: "string",
        required: true,
        description: "CSS selector or @ref",
      },
      files: {
        type: "string",
        required: true,
        description: "File path(s) to upload",
      },
    },
    flags: {},
    executionKind: "chain",
  },

  connect: {
    description: "Connect to a running browser via CDP port or WebSocket URL",
    args: {
      target: {
        type: "string",
        required: true,
        description: "CDP port number or WebSocket URL",
      },
    },
    flags: {},
    executionKind: "chain",
  },

  eval: {
    description: "Run JavaScript in the page context",
    args: {
      js: {
        type: "string",
        required: true,
        description: "JavaScript expression to evaluate",
      },
    },
    flags: {},
    executionKind: "read",
  },
};
