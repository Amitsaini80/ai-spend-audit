import test from "node:test";
import assert from "node:assert/strict";

import { auditTool, resolvePlan, runAudit } from "./audit.js";

test("maps assignment-era aliases to current plan names", () => {
  const cursorBusiness = resolvePlan("cursor", "business");
  const chatgptTeam = resolvePlan("chatgpt", "team");

  assert.equal(cursorBusiness?.planId, "teams");
  assert.equal(chatgptTeam?.planId, "business");
});

test("recommends same-vendor downgrade for undersized Claude Team usage", () => {
  const result = auditTool(
    { toolId: "claude", planId: "team", monthlySpend: 50, seats: 2 },
    { teamSize: 2, primaryUseCase: "research" },
  );

  assert.equal(result.action, "downgrade");
  assert.equal(result.recommendedPlan?.planId, "pro");
  assert.equal(result.estimatedMonthlySavings, 10);
});

test("recommends GitHub Copilot Pro instead of Business for a solo developer", () => {
  const result = auditTool(
    { toolId: "github-copilot", planId: "business", monthlySpend: 19, seats: 1 },
    { teamSize: 1, primaryUseCase: "coding" },
  );

  assert.equal(result.action, "downgrade");
  assert.equal(result.recommendedPlan?.planId, "individual");
  assert.equal(result.estimatedMonthlySavings, 9);
});

test("recommends a cheaper alternative when fit is comparable", () => {
  const result = auditTool(
    { toolId: "cursor", planId: "pro", monthlySpend: 20, seats: 1 },
    { teamSize: 1, primaryUseCase: "coding" },
  );

  assert.equal(result.action, "switch");
  assert.equal(result.recommendedPlan?.toolId, "github-copilot");
  assert.equal(result.recommendedPlan?.planId, "individual");
  assert.equal(result.estimatedMonthlySavings, 10);
});

test("keeps already efficient plans unchanged", () => {
  const result = auditTool(
    { toolId: "chatgpt", planId: "plus", monthlySpend: 20, seats: 1 },
    { teamSize: 1, primaryUseCase: "mixed" },
  );

  assert.equal(result.action, "keep");
  assert.equal(result.estimatedMonthlySavings, 0);
});

test("aggregates monthly and annual savings across multiple tools", () => {
  const audit = runAudit({
    teamSize: 2,
    primaryUseCase: "coding",
    tools: [
      { toolId: "cursor", planId: "teams", monthlySpend: 80, seats: 2 },
      { toolId: "github-copilot", planId: "business", monthlySpend: 38, seats: 2 },
    ],
  });

  assert.equal(audit.totalMonthlySavings, 78);
  assert.equal(audit.totalAnnualSavings, 936);
  assert.equal(audit.leadPriority, "low");
});
