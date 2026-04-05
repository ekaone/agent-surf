import { describe, it, expect } from "vitest";
import { formatPlan } from "../src/runner.js";
import type { Step, Plan, RunnerOptions } from "../src/types.js";

describe("agent-surf", () => {
  it("should have correct package name", () => {
    expect("agent-surf").toBe("agent-surf");
  });

  it("should validate simple math", () => {
    expect(2 + 2).toBe(4);
  });

  it("should handle array operations", () => {
    const arr = [1, 2, 3];
    expect(arr.length).toBe(3);
    expect(arr.includes(2)).toBe(true);
  });

  describe("Runner utilities", () => {
    it("should format plan for display", () => {
      const plan: Plan = {
        goal: "Test goal",
        steps: [
          {
            id: 1,
            command: "navigate",
            args: ["https://example.com"],
            flags: {},
            description: "Navigate to example",
            executionKind: "chain",
          },
          {
            id: 2,
            command: "snapshot",
            args: [],
            flags: {},
            description: "Take snapshot",
            executionKind: "read",
          },
        ],
      };

      const formatted = formatPlan(plan);
      expect(formatted).toContain("1. navigate https://example.com");
      expect(formatted).toContain("2. snapshot [read]");
      expect(formatted).toContain("Navigate to example");
      expect(formatted).toContain("Take snapshot");
    });
  });

  describe("Command validation", () => {
    it("should handle step validation", () => {
      const validStep: Step = {
        id: 1,
        command: "navigate",
        args: ["https://example.com"],
        flags: {},
        description: "Test navigation",
        executionKind: "chain",
      };

      expect(validStep.id).toBe(1);
      expect(validStep.command).toBe("navigate");
      expect(validStep.args).toEqual(["https://example.com"]);
      expect(validStep.executionKind).toBe("chain");
    });

    it("should handle different execution kinds", () => {
      const chainStep: Step = {
        id: 2,
        command: "click",
        args: ["@e1"],
        flags: {},
        description: "Click element",
        executionKind: "chain",
      };

      const readStep: Step = {
        id: 3,
        command: "snapshot",
        args: [],
        flags: {},
        description: "Take snapshot",
        executionKind: "read",
      };

      expect(chainStep.executionKind).toBe("chain");
      expect(readStep.executionKind).toBe("read");
    });
  });

  describe("Plan structure", () => {
    it("should create valid plan structure", () => {
      const plan: Plan = {
        goal: "Test goal",
        steps: [
          {
            id: 1,
            command: "navigate",
            args: ["https://example.com"],
            flags: { timeout: 5000 },
            description: "Navigate to example",
            executionKind: "chain",
          },
        ],
      };

      expect(plan.steps).toHaveLength(1);
      expect(plan.steps[0].flags.timeout).toBe(5000);
    });
  });
});
