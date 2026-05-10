import express from "express";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { nanoid } from "nanoid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, "data");
const AUDITS_PATH = join(DATA_DIR, "audits.json");
const LEADS_PATH = join(DATA_DIR, "leads.json");
const PORT = Number(process.env.PORT ?? 8787);
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX = 8;

const app = express();
const rateBuckets = new Map();

ensureFile(AUDITS_PATH);
ensureFile(LEADS_PATH);

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_request, response) => {
  response.json({ ok: true, service: "ledgerlift-api" });
});

app.post("/api/audits", (request, response) => {
  const { companyName = "", teamSize, primaryUseCase, tools = [], audit } = request.body ?? {};

  if (!Array.isArray(tools) || !audit || typeof audit !== "object") {
    response.status(400).json({ error: "Invalid audit payload." });
    return;
  }

  const id = nanoid(10);
  const auditRecord = {
    id,
    createdAt: new Date().toISOString(),
    privateInput: {
      companyName,
      teamSize,
      primaryUseCase,
      tools,
    },
    publicSnapshot: {
      teamSize,
      primaryUseCase,
      tools: tools.map((tool) => ({
        toolId: tool.toolId,
        planId: tool.planId,
        monthlySpend: tool.monthlySpend,
        seats: tool.seats,
      })),
      audit,
    },
  };

  appendRecord(AUDITS_PATH, auditRecord);
  response.status(201).json({ auditId: id });
});

app.post("/api/leads", async (request, response) => {
  const ip =
    request.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ??
    request.socket.remoteAddress ??
    "unknown";

  if (!passesRateLimit(ip)) {
    response.status(429).json({ error: "Too many submissions. Please try again later." });
    return;
  }

  const {
    auditId = "",
    email = "",
    companyName = "",
    role = "",
    teamSize = "",
    honeypot = "",
  } = request.body ?? {};

  if (honeypot) {
    response.status(400).json({ error: "Spam check failed." });
    return;
  }

  if (!auditId || !email || !String(email).includes("@")) {
    response.status(400).json({ error: "Audit ID and a valid email are required." });
    return;
  }

  const audits = readRecords(AUDITS_PATH);
  const auditRecord = audits.find((item) => item.id === auditId);

  if (!auditRecord) {
    response.status(404).json({ error: "Audit not found." });
    return;
  }

  const lead = {
    id: nanoid(12),
    createdAt: new Date().toISOString(),
    auditId,
    email,
    companyName,
    role,
    teamSize,
    emailStatus: "skipped",
  };

  if (process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL) {
    try {
      await sendTransactionalEmail({
        to: email,
        from: process.env.RESEND_FROM_EMAIL,
        subject: "Your LedgerLift AI spend audit",
        html: buildEmailHtml(auditRecord.publicSnapshot.audit),
      });
      lead.emailStatus = "sent";
    } catch (error) {
      lead.emailStatus = "failed";
      lead.emailError = error instanceof Error ? error.message : "Unknown email error";
    }
  }

  appendRecord(LEADS_PATH, lead);
  response.status(201).json({ ok: true, emailStatus: lead.emailStatus });
});

app.listen(PORT, () => {
  console.log(`LedgerLift API listening on http://localhost:${PORT}`);
});

function ensureFile(filePath) {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!existsSync(filePath)) {
    writeFileSync(filePath, "[]\n", "utf8");
  }
}

function readRecords(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function appendRecord(filePath, record) {
  const current = readRecords(filePath);
  current.push(record);
  writeFileSync(filePath, `${JSON.stringify(current, null, 2)}\n`, "utf8");
}

function passesRateLimit(key) {
  const now = Date.now();
  const current = rateBuckets.get(key) ?? [];
  const recent = current.filter((timestamp) => now - timestamp < RATE_WINDOW_MS);

  if (recent.length >= RATE_MAX) {
    rateBuckets.set(key, recent);
    return false;
  }

  recent.push(now);
  rateBuckets.set(key, recent);
  return true;
}

async function sendTransactionalEmail(payload) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Resend request failed with ${response.status}`);
  }
}

function buildEmailHtml(audit) {
  const rows = (audit.toolResults ?? [])
    .map(
      (result) =>
        `<li><strong>${result.currentPlan?.label ?? result.toolId}</strong>: save $${result.estimatedMonthlySavings}/mo by ${
          result.action === "keep" ? "keeping the current plan" : `moving to ${result.recommendedPlan?.label ?? "a better fit"}`
        }.</li>`,
    )
    .join("");

  return `
    <h1>Your AI spend audit is ready</h1>
    <p>Estimated monthly savings: <strong>$${audit.totalMonthlySavings}</strong></p>
    <p>Estimated annual savings: <strong>$${audit.totalAnnualSavings}</strong></p>
    <ul>${rows}</ul>
    <p>If your stack shows substantial savings potential, Credex can help capture more of it.</p>
  `;
}
