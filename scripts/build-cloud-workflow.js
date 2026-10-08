#!/usr/bin/env node
/**
 * build-cloud-workflow.js — inline secrets for n8n Cloud (Starter, no $env/$vars).
 *
 * Reads the committed workflow, replaces every `$env.X` token with the literal
 * value of X taken from THIS PROCESS'S environment, and writes a ready-to-import
 * file. Values never appear in chat or in git — you supply them in your own
 * shell when you run this.
 *
 * All three Anthropic calls (Guard, Router, Specialist) authenticate with the
 * n8n Anthropic CREDENTIAL you select on import — so there is no ANTHROPIC_API_KEY
 * to inline here. Only Supabase + the webhook secret are inlined; model ids are
 * optional overrides.
 *
 * Usage (from repo root):
 *   N8N_WEBHOOK_SECRET='...' \
 *   SUPABASE_URL='https://xxxx.supabase.co' \
 *   SUPABASE_SERVICE_ROLE_KEY='...' \
 *   [ANTHROPIC_MODEL_GUARD='claude-haiku-4-5'] \
 *   [ANTHROPIC_MODEL_ROUTER='claude-haiku-4-5'] \
 *   [ANTHROPIC_MODEL_SPECIALIST='claude-sonnet-4-5-20250929'] \
 *   node <path>/build-cloud-workflow.js <in.json> <out.json>
 */
const fs = require("fs");

const IN = process.argv[2];
const OUT = process.argv[3];
if (!IN || !OUT) {
  console.error("usage: node build-cloud-workflow.js <in.json> <out.json>");
  process.exit(2);
}

// Non-secret model ids get sensible defaults; the 3 real inputs are required.
// Note: the specialist (LangChain lmChatAnthropic) node needs a DATED model id;
// the undated alias is rejected there, so the default is the dated form.
const DEFAULTS = {
  ANTHROPIC_MODEL_GUARD: "claude-haiku-4-5",
  ANTHROPIC_MODEL_ROUTER: "claude-haiku-4-5",
  ANTHROPIC_MODEL_SPECIALIST: "claude-sonnet-4-5-20250929"
};
const VARS = [
  "N8N_WEBHOOK_SECRET",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ANTHROPIC_MODEL_GUARD",
  "ANTHROPIC_MODEL_ROUTER",
  "ANTHROPIC_MODEL_SPECIALIST"
];

const values = {};
const missing = [];
for (const name of VARS) {
  const v = process.env[name] ?? DEFAULTS[name];
  if (v == null || v === "") missing.push(name);
  else values[name] = String(v);
}
if (missing.length) {
  console.error("Missing required env var(s): " + missing.join(", "));
  process.exit(1);
}

const wf = JSON.parse(fs.readFileSync(IN, "utf8"));

let replaced = 0;
function walk(node) {
  if (Array.isArray(node)) return node.map(walk);
  if (node && typeof node === "object") {
    for (const k of Object.keys(node)) node[k] = walk(node[k]);
    return node;
  }
  if (typeof node === "string") {
    let s = node;
    for (const name of VARS) {
      const token = "$env." + name;
      if (s.includes(token)) {
        // Quoted literal: valid JS in Code nodes AND a valid n8n expression ({{ "v" }}).
        s = s.split(token).join(JSON.stringify(values[name]));
        replaced++;
      }
    }
    return s;
  }
  return node;
}
walk(wf);

// Safety: nothing left referencing $env
const leftovers = JSON.stringify(wf).match(/\$env\.[A-Za-z0-9_]+/g);
if (leftovers) {
  console.error("Unreplaced $env tokens remain: " + [...new Set(leftovers)].join(", "));
  process.exit(1);
}

fs.writeFileSync(OUT, JSON.stringify(wf, null, 2));
console.error(`OK — wrote ${OUT} (${replaced} token sites inlined, ${wf.nodes.length} nodes).`);
