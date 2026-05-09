import { useEffect, useMemo, useState } from "react";
import { BarChart3, DollarSign, ExternalLink, ShieldCheck, Sparkles } from "lucide-react";

import { PLAN_CATALOG } from "./data/pricing.js";
import { runAudit } from "./lib/audit.js";

const STORAGE_KEY = "ledgerlift-audit-draft";
const TOOL_OPTIONS = [
  { value: "cursor", label: "Cursor" },
  { value: "github-copilot", label: "GitHub Copilot" },
  { value: "claude", label: "Claude" },
  { value: "chatgpt", label: "ChatGPT" },
  { value: "anthropic-api", label: "Anthropic API direct" },
  { value: "openai-api", label: "OpenAI API direct" },
  { value: "gemini", label: "Gemini" },
  { value: "windsurf", label: "Windsurf" },
];
const USE_CASE_OPTIONS = [
  { value: "coding", label: "Coding" },
  { value: "writing", label: "Writing" },
  { value: "data", label: "Data" },
  { value: "research", label: "Research" },
  { value: "mixed", label: "Mixed" },
];

const DEFAULT_FORM = {
  companyName: "",
  teamSize: 5,
  primaryUseCase: "coding",
  tools: [
    {
      id: crypto.randomUUID(),
      toolId: "cursor",
      planId: "pro",
      monthlySpend: 20,
      seats: 1,
    },
  ],
};

function getPlansForTool(toolId) {
  return PLAN_CATALOG.filter((plan) => plan.toolId === toolId);
}

function createToolEntry(toolId = "cursor") {
  const firstPlan = getPlansForTool(toolId)[0];

  return {
    id: crypto.randomUUID(),
    toolId,
    planId: firstPlan?.planId ?? "",
    monthlySpend: firstPlan?.monthlyPriceUsd ?? 0,
    seats: 1,
  };
}

function parseStoredState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_FORM;
    }

    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_FORM,
      ...parsed,
      tools: Array.isArray(parsed.tools) && parsed.tools.length > 0 ? parsed.tools : DEFAULT_FORM.tools,
    };
  } catch {
    return DEFAULT_FORM;
  }
}

function formatMoney(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

function getLeadMessage(priority) {
  if (priority === "high") {
    return "Large savings opportunity. This is where Credex should be surfaced aggressively as the fastest path to capture the savings.";
  }

  if (priority === "medium") {
    return "Meaningful savings found. Ask for email capture and offer a follow-up audit or procurement review.";
  }

  return "Savings are limited. Stay honest, keep the lead with a light-touch follow-up CTA, and avoid manufacturing urgency.";
}

function SummaryCard({ icon: Icon, title, value, helper }) {
  return (
    <article className="summary-card">
      <div className="summary-card__icon">
        <Icon size={18} />
      </div>
      <p className="summary-card__title">{title}</p>
      <h3>{value}</h3>
      <p className="summary-card__helper">{helper}</p>
    </article>
  );
}

export default function App() {
  const [form, setForm] = useState(DEFAULT_FORM);

  useEffect(() => {
    setForm(parseStoredState());
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
  }, [form]);

  const audit = useMemo(
    () =>
      runAudit({
        teamSize: Number(form.teamSize) || 1,
        primaryUseCase: form.primaryUseCase,
        tools: form.tools.map((tool) => ({
          toolId: tool.toolId,
          planId: tool.planId,
          monthlySpend: Number(tool.monthlySpend) || 0,
          seats: Number(tool.seats) || 1,
        })),
      }),
    [form],
  );

  function updateTopLevel(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateTool(id, field, value) {
    setForm((current) => ({
      ...current,
      tools: current.tools.map((tool) => {
        if (tool.id !== id) {
          return tool;
        }

        if (field === "toolId") {
          const firstPlan = getPlansForTool(value)[0];
          return {
            ...tool,
            toolId: value,
            planId: firstPlan?.planId ?? "",
            monthlySpend: firstPlan?.monthlyPriceUsd ?? tool.monthlySpend,
          };
        }

        return { ...tool, [field]: value };
      }),
    }));
  }

  function addTool() {
    setForm((current) => ({
      ...current,
      tools: [...current.tools, createToolEntry()],
    }));
  }

  function removeTool(id) {
    setForm((current) => ({
      ...current,
      tools: current.tools.length === 1 ? current.tools : current.tools.filter((tool) => tool.id !== id),
    }));
  }

  function resetDraft() {
    setForm(DEFAULT_FORM);
  }

  return (
    <div className="page-shell">
      <div className="ambient ambient--one" />
      <div className="ambient ambient--two" />
      <header className="hero">
        <div className="hero__copy">
          <div className="hero__badge">Day 3 prototype</div>
          <p className="eyebrow">LedgerLift AI Spend Audit</p>
          <h1>See whether your AI stack is expensive, redundant, or simply mis-sized.</h1>
          <p className="hero__lede">
            This prototype turns the Day 2 pricing engine into a usable audit flow: add tools,
            adjust spend, and get a finance-style breakdown of savings opportunities instantly.
          </p>
        </div>
        <div className="hero__panel">
          <SummaryCard
            icon={DollarSign}
            title="Monthly savings"
            value={formatMoney(audit.totalMonthlySavings)}
            helper="Calculated from the current deterministic rule set."
          />
          <SummaryCard
            icon={BarChart3}
            title="Annual savings"
            value={formatMoney(audit.totalAnnualSavings)}
            helper="Useful for the hero number and later lead qualification."
          />
          <SummaryCard
            icon={ShieldCheck}
            title="Lead priority"
            value={audit.leadPriority.toUpperCase()}
            helper={getLeadMessage(audit.leadPriority)}
          />
        </div>
      </header>

      <main className="workspace">
        <section className="panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Spend input</p>
              <h2>Capture the team context first</h2>
            </div>
            <button className="ghost-button" type="button" onClick={resetDraft}>
              Reset draft
            </button>
          </div>

          <div className="form-grid">
            <label>
              <span>Company name</span>
              <input
                value={form.companyName}
                onChange={(event) => updateTopLevel("companyName", event.target.value)}
                placeholder="Example: Acme Labs"
              />
            </label>

            <label>
              <span>Team size</span>
              <input
                type="number"
                min="1"
                value={form.teamSize}
                onChange={(event) => updateTopLevel("teamSize", event.target.value)}
              />
            </label>

            <label className="form-grid__full">
              <span>Primary use case</span>
              <select
                value={form.primaryUseCase}
                onChange={(event) => updateTopLevel("primaryUseCase", event.target.value)}
              >
                {USE_CASE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="tool-stack">
            <div className="tool-stack__header">
              <h3>Tool stack</h3>
              <button className="primary-button" type="button" onClick={addTool}>
                Add tool
              </button>
            </div>

            {form.tools.map((tool, index) => {
              const plans = getPlansForTool(tool.toolId);

              return (
                <article className="tool-card" key={tool.id}>
                  <div className="tool-card__heading">
                    <div>
                      <p className="eyebrow">Tool {index + 1}</p>
                      <h4>{TOOL_OPTIONS.find((option) => option.value === tool.toolId)?.label}</h4>
                    </div>
                    <button className="ghost-button" type="button" onClick={() => removeTool(tool.id)}>
                      Remove
                    </button>
                  </div>

                  <div className="form-grid">
                    <label>
                      <span>Tool</span>
                      <select
                        value={tool.toolId}
                        onChange={(event) => updateTool(tool.id, "toolId", event.target.value)}
                      >
                        {TOOL_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span>Plan</span>
                      <select
                        value={tool.planId}
                        onChange={(event) => updateTool(tool.id, "planId", event.target.value)}
                      >
                        {plans.map((plan) => (
                          <option key={plan.planId} value={plan.planId}>
                            {plan.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span>Monthly spend (USD)</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={tool.monthlySpend}
                        onChange={(event) => updateTool(tool.id, "monthlySpend", event.target.value)}
                      />
                    </label>

                    <label>
                      <span>Seats</span>
                      <input
                        type="number"
                        min="1"
                        value={tool.seats}
                        onChange={(event) => updateTool(tool.id, "seats", event.target.value)}
                      />
                    </label>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="panel panel--results">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Audit result</p>
              <h2>Readable, defensible savings recommendations</h2>
            </div>
            <div className="panel__meta">
              <Sparkles size={16} />
              <span>AI summary and lead capture come next</span>
            </div>
          </div>

          <div className="results-hero">
            <div>
              <p>Total monthly savings</p>
              <h3>{formatMoney(audit.totalMonthlySavings)}</h3>
            </div>
            <div>
              <p>Total annual savings</p>
              <h3>{formatMoney(audit.totalAnnualSavings)}</h3>
            </div>
          </div>

          <div className="result-list">
            {audit.toolResults.map((result, index) => (
              <article className="result-card" key={`${result.toolId}-${index}`}>
                <div className="result-card__top">
                  <div>
                    <p className="eyebrow">{result.currentPlan?.vendor ?? result.toolId}</p>
                    <h4>{result.currentPlan?.label ?? "Manual review"}</h4>
                  </div>
                  <div className={`action-chip action-chip--${result.action}`}>
                    {result.action.replace("-", " ")}
                  </div>
                </div>

                <div className="result-card__metrics">
                  <div>
                    <span>Current</span>
                    <strong>{formatMoney(result.currentMonthlySpend)}</strong>
                  </div>
                  <div>
                    <span>Recommended</span>
                    <strong>{formatMoney(result.recommendedMonthlyCost)}</strong>
                  </div>
                  <div>
                    <span>Monthly savings</span>
                    <strong>{formatMoney(result.estimatedMonthlySavings)}</strong>
                  </div>
                </div>

                <p className="result-card__reason">{result.reason}</p>

                {result.recommendedPlan?.sourceUrl ? (
                  <a className="source-link" href={result.recommendedPlan.sourceUrl} target="_blank" rel="noreferrer">
                    Pricing source
                    <ExternalLink size={14} />
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
