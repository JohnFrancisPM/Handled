/**
 * build-harness-fixture.ts — builder-side extractor (repo-root scripts/, outside the apps).
 *
 * Parses the canonical Supabase seed SQL (01/04/05/06) with pgsql-ast-parser and emits the
 * committed, DB-free fixture apps/test-harness/fixtures/customers.json. The seed stays
 * canonical; re-run and commit when it changes. Spec: docs/test-harness/implementation/
 * fixture-extraction.md. No DB, no network — static file reads only.
 *
 * Run:  npx tsx scripts/build-harness-fixture.ts
 *   or: (from apps/test-harness) npm run build:fixture
 */
import { readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parse, type Statement } from "pgsql-ast-parser";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, "..");
const SEED_DIR = join(REPO_ROOT, "supabase", "seed");
const OUT_PATH = join(REPO_ROOT, "apps", "test-harness", "fixtures", "customers.json");

const SEED_FILES = {
  profile: "01_acme_profile.sql",
  customers: "04_end_customers_30.sql",
  conversations: "05_conversations_messages.sql",
  appointments: "06_appointments.sql"
} as const;

const TABLES_OF_INTEREST = new Set([
  "end_customers",
  "conversations",
  "messages",
  "appointments",
  "services"
]);

// ---------------------------------------------------------------------------
// AST decoding
// ---------------------------------------------------------------------------

type Row = Record<string, unknown>;

/** A parsed interval offset, e.g. { sign: -1, amount: 6, unit: "days" }. */
interface TimeOffset {
  sign: 1 | -1;
  amount: number;
  unit: string;
}

/** Decode a VALUES expression for a DATA column (string / null / number / jsonb / bool). */
function decode(expr: any): unknown {
  if (!expr || typeof expr !== "object") return null;
  switch (expr.type) {
    case "string":
      return expr.value; // parser already unescapes '' → ' and preserves accents
    case "null":
      return null;
    case "integer":
    case "numeric":
    case "float":
      return Number(expr.value);
    case "boolean":
      return Boolean(expr.value);
    case "unary":
      if (expr.op === "-") return -(decode(expr.operand) as number);
      return decode(expr.operand);
    case "cast": {
      const to = expr.to?.name;
      const inner = decode(expr.operand);
      if (to === "jsonb" || to === "json") {
        return typeof inner === "string" ? JSON.parse(inner) : inner;
      }
      return inner; // interval handled by decodeTimeOffset, not here
    }
    default:
      return null;
  }
}

/** Parse an interval string like "10 seconds" / "6 days" / "320 days". */
function parseInterval(value: string): { amount: number; unit: string } {
  const m = /^\s*(-?\d+)\s+([a-zA-Z]+)\s*$/.exec(value);
  if (!m) return { amount: 0, unit: "seconds" };
  return { amount: Number(m[1]!), unit: m[2]!.toLowerCase() };
}

/** Decode a TIMESTAMP column: now() | now() ± interval 'N unit'. */
function decodeTimeOffset(expr: any): TimeOffset {
  if (!expr || typeof expr !== "object") return { sign: 1, amount: 0, unit: "seconds" };
  // bare now()
  if (expr.type === "call" && expr.function?.name === "now") {
    return { sign: 1, amount: 0, unit: "seconds" };
  }
  // now() + interval '...' | now() - interval '...'
  if (expr.type === "binary" && (expr.op === "+" || expr.op === "-")) {
    const intervalCast = expr.right;
    const value =
      intervalCast?.type === "cast" && intervalCast.operand?.type === "string"
        ? (intervalCast.operand.value as string)
        : "0 seconds";
    const { amount, unit } = parseInterval(value);
    return { sign: expr.op === "-" ? -1 : 1, amount, unit };
  }
  return { sign: 1, amount: 0, unit: "seconds" };
}

/** Message created_at → relative label "t+<seconds>s" (ordering only, no wall clock). */
function toMessageTs(expr: any): string {
  const off = decodeTimeOffset(expr);
  const seconds = off.unit.startsWith("second") ? off.amount : 0;
  return `t+${off.sign < 0 ? "-" : ""}${seconds}s`;
}

/** Appointment scheduled_at → "N days ago" | "in N days". */
function toScheduledRel(expr: any): string {
  const off = decodeTimeOffset(expr);
  return off.sign < 0 ? `${off.amount} ${off.unit} ago` : `in ${off.amount} ${off.unit}`;
}

/** Signed magnitude in days, for "most recent appointment" comparison. */
function toSignedDays(expr: any): number {
  const off = decodeTimeOffset(expr);
  const perDay: Record<string, number> = {
    second: 1 / 86400, seconds: 1 / 86400,
    day: 1, days: 1,
    week: 7, weeks: 7,
    month: 30, months: 30,
    year: 365, years: 365
  };
  return off.sign * off.amount * (perDay[off.unit] ?? 1);
}

// ---------------------------------------------------------------------------
// Parse seed files → typed rows per table
// ---------------------------------------------------------------------------

/** Extract rows for a table. `timestampCols` are decoded as offsets (kept as raw AST here). */
function collectRows(statements: Statement[], table: string): Array<{ cols: string[]; exprs: any[] }> {
  const out: Array<{ cols: string[]; exprs: any[] }> = [];
  for (const stmt of statements as any[]) {
    if (stmt.type !== "insert") continue;
    if (stmt.into?.name !== table) continue;
    if (stmt.insert?.type !== "values") continue;
    const cols: string[] = (stmt.columns ?? []).map((c: any) => c.name);
    for (const rowExprs of stmt.insert.values as any[][]) {
      out.push({ cols, exprs: rowExprs });
    }
  }
  return out;
}

/** Build a plain {col: decodedValue} object, keeping chosen timestamp columns as raw AST. */
function rowToObject(
  cols: string[],
  exprs: any[],
  rawTimestampCols: string[] = []
): Row {
  const obj: Row = {};
  cols.forEach((col, i) => {
    if (rawTimestampCols.includes(col)) {
      obj[col] = exprs[i]; // keep raw AST for timestamp normalization
    } else {
      obj[col] = decode(exprs[i]);
    }
  });
  return obj;
}

// ---------------------------------------------------------------------------
// Fixture types (mirror lib/fixtures/types.ts)
// ---------------------------------------------------------------------------

interface Action {
  type: string;
  [k: string]: unknown;
}
interface HistoryTurn {
  role: "user" | "assistant";
  content: string;
  intent: string | null;
  agent: string | null;
  actions: Action[] | null;
  ts: string;
}
interface LastJob {
  service: string;
  price: number | null;
  status: string;
  scheduled_rel: string;
}
interface Customer {
  id: string;
  phone: string;
  name: string | null;
  address: string | null;
  last_intent: string | null;
  status: string | null;
  history: HistoryTurn[];
  last_job: LastJob | null;
}

/** tool_calls jsonb array → actions[] with `tool` renamed to `type`. */
function toActions(toolCalls: unknown): Action[] | null {
  if (!Array.isArray(toolCalls)) return null;
  return toolCalls.map((tc: any) => {
    const { tool, ...rest } = tc ?? {};
    return { type: String(tool ?? rest.type ?? "action"), ...rest };
  });
}

function idSuffix(id: string): number {
  const m = /(\d+)\s*$/.exec(id);
  return m ? Number(m[1]) : 0;
}

// ---------------------------------------------------------------------------
// Core builder (pure) — parse the four SQL sources → sorted Customer[]
// ---------------------------------------------------------------------------

export interface SeedSources {
  profile: string;
  customers: string;
  conversations: string;
  appointments: string;
}

export function buildCustomers(sources: SeedSources): Customer[] {
  const profileAst = parse(sources.profile);
  const customersAst = parse(sources.customers);
  const convAst = parse(sources.conversations);
  const apptAst = parse(sources.appointments);

  // services id → { name, category } (only the insert that lists an `id` column, seed 01)
  const servicesById = new Map<string, { name: string; category: string }>();
  for (const { cols, exprs } of collectRows(profileAst, "services")) {
    if (!cols.includes("id")) continue;
    const r = rowToObject(cols, exprs);
    if (r.id) servicesById.set(String(r.id), { name: String(r.name), category: String(r.category) });
  }

  // end_customers (30)
  const customerRows = collectRows(customersAst, "end_customers").map(({ cols, exprs }) =>
    rowToObject(cols, exprs)
  );

  // conversations — one per customer
  const convByCustomer = new Map<string, Row>();
  for (const { cols, exprs } of collectRows(convAst, "conversations")) {
    const r = rowToObject(cols, exprs);
    const cid = String(r.end_customer_id);
    if (convByCustomer.has(cid)) {
      throw new Error(`More than one conversation for end_customer ${cid} — seed invariant broken.`);
    }
    convByCustomer.set(cid, r);
  }

  // messages grouped by conversation_id (created_at kept raw for ts normalization)
  const msgsByConversation = new Map<string, Row[]>();
  for (const { cols, exprs } of collectRows(convAst, "messages")) {
    const r = rowToObject(cols, exprs, ["created_at"]);
    const conv = String(r.conversation_id);
    if (!msgsByConversation.has(conv)) msgsByConversation.set(conv, []);
    msgsByConversation.get(conv)!.push(r);
  }

  // appointments grouped by end_customer_id (scheduled_at kept raw)
  const apptsByCustomer = new Map<string, Row[]>();
  for (const { cols, exprs } of collectRows(apptAst, "appointments")) {
    const r = rowToObject(cols, exprs, ["scheduled_at"]);
    const cid = String(r.end_customer_id);
    if (!apptsByCustomer.has(cid)) apptsByCustomer.set(cid, []);
    apptsByCustomer.get(cid)!.push(r);
  }

  // assemble customers
  const customers: Customer[] = customerRows.map((cr) => {
    const id = String(cr.id);
    const conv = convByCustomer.get(id);
    const convId = conv ? String(conv.id) : null;

    const rawMsgs = convId ? msgsByConversation.get(convId) ?? [] : [];
    // stable order by created_at offset (seconds)
    const history: HistoryTurn[] = rawMsgs
      .map((m) => ({
        role: (m.role === "assistant" ? "assistant" : "user") as "user" | "assistant",
        content: String(m.content ?? ""),
        intent: (m.intent as string | null) ?? null,
        agent: (m.agent as string | null) ?? null,
        actions: toActions(m.tool_calls),
        ts: toMessageTs(m.created_at),
        _order: tsSeconds(m.created_at)
      }))
      .sort((a, b) => a._order - b._order)
      .map(({ _order, ...turn }) => turn);

    // last_job selection: prefer the appt tied to this conversation, else most recent
    const appts = apptsByCustomer.get(id) ?? [];
    let lastJob: LastJob | null = null;
    if (appts.length > 0) {
      const tied = convId ? appts.find((a) => String(a.source_conversation_id ?? "") === convId) : undefined;
      const chosen =
        tied ?? [...appts].sort((a, b) => toSignedDays(b.scheduled_at) - toSignedDays(a.scheduled_at))[0]!;
      const svc = servicesById.get(String(chosen.service_id));
      lastJob = {
        service: svc?.name ?? String(chosen.service_id),
        price: chosen.price == null ? null : Number(chosen.price),
        status: String(chosen.status),
        scheduled_rel: toScheduledRel(chosen.scheduled_at)
      };
    }

    return {
      id,
      phone: String(cr.phone),
      name: (cr.name as string | null) ?? null,
      address: (cr.address as string | null) ?? null,
      last_intent: conv ? (conv.last_intent as string | null) ?? null : null,
      status: conv ? (conv.status as string | null) ?? null : null,
      history,
      last_job: lastJob
    };
  });

  customers.sort((a, b) => idSuffix(a.id) - idSuffix(b.id));
  return customers;
}

// ---------------------------------------------------------------------------
// CLI entry — read the seed files, write the committed fixture
// ---------------------------------------------------------------------------

function main() {
  const sources: SeedSources = {
    profile: readFileSync(join(SEED_DIR, SEED_FILES.profile), "utf8"),
    customers: readFileSync(join(SEED_DIR, SEED_FILES.customers), "utf8"),
    conversations: readFileSync(join(SEED_DIR, SEED_FILES.conversations), "utf8"),
    appointments: readFileSync(join(SEED_DIR, SEED_FILES.appointments), "utf8")
  };

  const customers = buildCustomers(sources);

  // Deterministic: newest seed-file mtime, so reruns are byte-identical until the seed changes.
  const newestSeedMtime = Math.max(
    ...Object.values(SEED_FILES).map((f) => statSync(join(SEED_DIR, f)).mtimeMs)
  );

  const fixture = {
    generated_from: [
      "supabase/seed/04_end_customers_30.sql",
      "supabase/seed/05_conversations_messages.sql",
      "supabase/seed/06_appointments.sql",
      "supabase/seed/01_acme_profile.sql"
    ],
    generated_at: new Date(newestSeedMtime).toISOString(),
    business_id_note: "business_id comes from env (ACME_BUSINESS_ID), NOT from this file",
    customer_count: customers.length,
    customers
  };

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(fixture, null, 2) + "\n", "utf8");

  const totalTurns = customers.reduce((n, c) => n + c.history.length, 0);
  const nullNames = customers.filter((c) => c.name === null).length;
  const spamThreads = customers.filter(
    (c) => c.history.length > 0 && !c.history.some((t) => t.role === "assistant")
  ).length;
  const withAppt = customers.filter((c) => c.last_job !== null).length;
  console.log(`✓ Wrote ${OUT_PATH}`);
  console.log(`  customers: ${customers.length}`);
  console.log(`  history turns: ${totalTurns}`);
  console.log(`  customers with null name: ${nullNames}`);
  console.log(`  spam threads (user turn, no assistant reply): ${spamThreads}`);
  console.log(`  customers with a last_job: ${withAppt}`);
}

/** Offset in seconds for message ordering (bare now => 0). */
function tsSeconds(expr: any): number {
  const off = decodeTimeOffset(expr);
  const perSec: Record<string, number> = {
    second: 1, seconds: 1, day: 86400, days: 86400
  };
  return off.sign * off.amount * (perSec[off.unit] ?? 1);
}

// Run only when invoked directly (tsx scripts/build-harness-fixture.ts), not when imported by tests.
const invokedDirectly =
  typeof process !== "undefined" &&
  Array.isArray(process.argv) &&
  typeof process.argv[1] === "string" &&
  import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) main();
