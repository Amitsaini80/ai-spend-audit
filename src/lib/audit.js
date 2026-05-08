import { PLAN_CATALOG } from "../data/pricing.js";

function normalize(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

export function resolvePlan(toolId, planId) {
  const normalizedToolId = normalize(toolId);
  const normalizedPlanId = normalize(planId);

  return (
    PLAN_CATALOG.find((plan) => {
      if (normalize(plan.toolId) !== normalizedToolId) {
        return false;
      }

      if (normalize(plan.planId) === normalizedPlanId) {
        return true;
      }

      return plan.aliases.some((alias) => normalize(alias) === normalizedPlanId);
    }) ?? null
  );
}

function getUseCaseScore(plan, useCase) {
  const normalizedUseCase = normalize(useCase) || "mixed";
  return plan.useCaseScores[normalizedUseCase] ?? plan.useCaseScores.mixed ?? 0;
}

function isPlanOperationallySuitable(plan, entry, context) {
  const seats = Number(entry.seats ?? 0);
  const teamSize = Number(context.teamSize ?? seats ?? 0);
  const useCaseScore = getUseCaseScore(plan, context.primaryUseCase);

  if (useCaseScore < 6) {
    return false;
  }

  if (plan.planKind === "team" && plan.minSeats && Math.max(seats, teamSize) < plan.minSeats) {
    return false;
  }

  if (plan.planKind === "enterprise" && Math.max(seats, teamSize) < (plan.minSeats ?? 25)) {
    return false;
  }

  return true;
}

function getExpectedMonthlyCost(plan, seats) {
  if (typeof plan.monthlyPriceUsd !== "number") {
    return null;
  }

  return Number((plan.monthlyPriceUsd * Math.max(1, seats)).toFixed(2));
}

function getCurrentCostBasis(entry, currentPlan) {
  const reportedSpend = Number(entry.monthlySpend ?? 0);
  const expectedCost = currentPlan ? getExpectedMonthlyCost(currentPlan, entry.seats) : null;

  if (reportedSpend > 0) {
    return reportedSpend;
  }

  return expectedCost ?? 0;
}

function buildReason(action, currentPlan, targetPlan, context, entry) {
  const useCase = context.primaryUseCase || "mixed";

  if (action === "keep") {
    return "Current plan already fits the team's size and primary workflow without a clearly cheaper like-for-like option.";
  }

  if (action === "downgrade" && currentPlan && targetPlan) {
    return `${currentPlan.label} is more plan than this ${useCase}-heavy setup appears to need, so ${targetPlan.label} preserves the workflow at a lower monthly cost.`;
  }

  if (action === "switch" && currentPlan && targetPlan) {
    return `${targetPlan.label} is materially cheaper for a ${useCase}-focused team while still covering the core capability this tool is being used for.`;
  }

  if (action === "review-api" && currentPlan) {
    return `${currentPlan.label} is usage-based, so the main question is whether this spend is really interactive seat usage or should stay API-driven for automation-heavy workloads.`;
  }

  if (action === "review") {
    return `This plan needs manual review because the pricing is custom or the reported spend does not line up neatly with a public self-serve tier.`;
  }

  return `${entry.toolId} should be reviewed manually.`;
}

function findSameVendorDowngrade(currentPlan, entry, context) {
  if (!currentPlan) {
    return null;
  }

  const currentCost = getExpectedMonthlyCost(currentPlan, entry.seats);
  if (currentCost == null) {
    return null;
  }

  const sameVendor = PLAN_CATALOG.filter(
    (plan) =>
      plan.toolId === currentPlan.toolId &&
      typeof plan.monthlyPriceUsd === "number" &&
      plan.monthlyPriceUsd > 0 &&
      plan.monthlyPriceUsd < currentPlan.monthlyPriceUsd &&
      isPlanOperationallySuitable(plan, entry, context),
  );

  const ranked = sameVendor
    .map((plan) => ({
      plan,
      monthlyCost: getExpectedMonthlyCost(plan, entry.seats),
      score: getUseCaseScore(plan, context.primaryUseCase),
    }))
    .filter((candidate) => candidate.monthlyCost != null)
    .sort((left, right) => left.monthlyCost - right.monthlyCost || right.score - left.score);

  return ranked[0] ?? null;
}

function findCrossVendorAlternative(currentPlan, entry, context) {
  const currentScore = currentPlan ? getUseCaseScore(currentPlan, context.primaryUseCase) : 0;

  const candidates = PLAN_CATALOG.filter((plan) => {
    if (plan.toolId === currentPlan?.toolId) {
      return false;
    }

    if (typeof plan.monthlyPriceUsd !== "number") {
      return false;
    }

    if (plan.monthlyPriceUsd === 0) {
      return false;
    }

    if (plan.planKind === "enterprise" || plan.planKind === "api") {
      return false;
    }

    if (!isPlanOperationallySuitable(plan, entry, context)) {
      return false;
    }

    const planScore = getUseCaseScore(plan, context.primaryUseCase);
    return planScore >= Math.max(6, currentScore - 1);
  });

  const ranked = candidates
    .map((plan) => ({
      plan,
      monthlyCost: getExpectedMonthlyCost(plan, entry.seats),
      score: getUseCaseScore(plan, context.primaryUseCase),
    }))
    .filter((candidate) => candidate.monthlyCost != null)
    .sort((left, right) => left.monthlyCost - right.monthlyCost || right.score - left.score);

  return ranked[0] ?? null;
}

function evaluateApiPlan(currentPlan, entry, context) {
  const spend = Number(entry.monthlySpend ?? 0);
  const seats = Math.max(1, Number(entry.seats ?? 1));
  const useCase = normalize(context.primaryUseCase);

  const thresholds = {
    coding: { chatgpt: 20, claude: 20, gemini: 19.99 },
    writing: { chatgpt: 20, claude: 20, gemini: 19.99 },
    research: { chatgpt: 20, claude: 20, gemini: 19.99 },
    data: { chatgpt: 20, claude: 20, gemini: 19.99 },
    mixed: { chatgpt: 20, claude: 20, gemini: 19.99 },
  };

  const limit = thresholds[useCase] ?? thresholds.mixed;

  if (currentPlan.toolId === "openai-api" || currentPlan.toolId === "chatgpt") {
    const alternative = resolvePlan("chatgpt", "plus");
    const targetCost = limit.chatgpt * seats;
    if (spend > targetCost && alternative) {
      return {
        action: "switch",
        recommendedPlan: alternative,
        recommendedMonthlyCost: targetCost,
      };
    }
  }

  if (currentPlan.toolId === "anthropic-api" || currentPlan.toolId === "claude") {
    const alternative = resolvePlan("claude", "pro");
    const targetCost = limit.claude * seats;
    if (spend > targetCost && alternative) {
      return {
        action: "switch",
        recommendedPlan: alternative,
        recommendedMonthlyCost: targetCost,
      };
    }
  }

  if (currentPlan.toolId === "gemini") {
    const alternative = resolvePlan("gemini", "pro");
    const targetCost = Number((limit.gemini * seats).toFixed(2));
    if (spend > targetCost && alternative) {
      return {
        action: "switch",
        recommendedPlan: alternative,
        recommendedMonthlyCost: targetCost,
      };
    }
  }

  return {
    action: "review-api",
    recommendedPlan: currentPlan,
    recommendedMonthlyCost: spend,
  };
}

export function auditTool(entry, context) {
  const currentPlan = resolvePlan(entry.toolId, entry.planId);
  const currentCostBasis = getCurrentCostBasis(entry, currentPlan);

  if (!currentPlan) {
    return {
      toolId: entry.toolId,
      currentPlan: null,
      action: "review",
      recommendedPlan: null,
      currentMonthlySpend: currentCostBasis,
      recommendedMonthlyCost: currentCostBasis,
      estimatedMonthlySavings: 0,
      reason: "Plan could not be matched to the current catalog and needs manual review.",
    };
  }

  if (currentPlan.planKind === "api") {
    const apiDecision = evaluateApiPlan(currentPlan, entry, context);
    const savings = Math.max(0, Number((currentCostBasis - apiDecision.recommendedMonthlyCost).toFixed(2)));

    return {
      toolId: entry.toolId,
      currentPlan,
      action: apiDecision.action,
      recommendedPlan: apiDecision.recommendedPlan,
      currentMonthlySpend: currentCostBasis,
      recommendedMonthlyCost: apiDecision.recommendedMonthlyCost,
      estimatedMonthlySavings: savings,
      reason: buildReason(apiDecision.action, currentPlan, apiDecision.recommendedPlan, context, entry),
    };
  }

  const sameVendorCandidate = findSameVendorDowngrade(currentPlan, entry, context);
  const crossVendorCandidate = findCrossVendorAlternative(currentPlan, entry, context);
  const currentExpectedCost = getExpectedMonthlyCost(currentPlan, entry.seats);
  const planLooksOversized = !isPlanOperationallySuitable(currentPlan, entry, context);

  let action = "keep";
  let recommendedPlan = currentPlan;
  let recommendedMonthlyCost = currentExpectedCost ?? currentCostBasis;

  if (sameVendorCandidate && (planLooksOversized || currentCostBasis > sameVendorCandidate.monthlyCost)) {
    action = "downgrade";
    recommendedPlan = sameVendorCandidate.plan;
    recommendedMonthlyCost = sameVendorCandidate.monthlyCost;
  }

  if (
    crossVendorCandidate &&
    crossVendorCandidate.monthlyCost < recommendedMonthlyCost &&
    currentCostBasis - crossVendorCandidate.monthlyCost >= 5
  ) {
    action = currentPlan.toolId === crossVendorCandidate.plan.toolId ? "downgrade" : "switch";
    recommendedPlan = crossVendorCandidate.plan;
    recommendedMonthlyCost = crossVendorCandidate.monthlyCost;
  }

  const estimatedMonthlySavings = Math.max(
    0,
    Number((currentCostBasis - recommendedMonthlyCost).toFixed(2)),
  );

  if (estimatedMonthlySavings < 5 && action !== "review") {
    action = "keep";
    recommendedPlan = currentPlan;
    recommendedMonthlyCost = currentExpectedCost ?? currentCostBasis;
  }

  return {
    toolId: entry.toolId,
    currentPlan,
    action,
    recommendedPlan,
    currentMonthlySpend: currentCostBasis,
    recommendedMonthlyCost,
    estimatedMonthlySavings:
      action === "keep" ? 0 : Math.max(0, Number((currentCostBasis - recommendedMonthlyCost).toFixed(2))),
    reason: buildReason(action, currentPlan, recommendedPlan, context, entry),
  };
}

export function runAudit(input) {
  const context = {
    teamSize: Number(input.teamSize ?? 1),
    primaryUseCase: input.primaryUseCase ?? "mixed",
  };

  const toolResults = (input.tools ?? []).map((entry) => auditTool(entry, context));
  const totalMonthlySavings = Number(
    toolResults.reduce((sum, result) => sum + result.estimatedMonthlySavings, 0).toFixed(2),
  );

  return {
    toolResults,
    totalMonthlySavings,
    totalAnnualSavings: Number((totalMonthlySavings * 12).toFixed(2)),
    leadPriority:
      totalMonthlySavings > 500 ? "high" : totalMonthlySavings >= 100 ? "medium" : "low",
  };
}
