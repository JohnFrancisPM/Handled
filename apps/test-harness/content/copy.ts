// All literal UI copy (content-driven). Components import from here so wording changes
// never touch component logic.

export const copy = {
  appTitle: "Handled — Test Harness",
  smsHeader: "Texting Acme Plumbing",
  subheading: "Impersonate a customer, send a text, watch the AI respond.",

  roster: {
    heading: "Customers",
    searchPlaceholder: "Search by name or phone",
    count: (n: number) => `${n} seeded customers`
  },

  thread: {
    emptyTitle: "Select a customer to start texting",
    emptyBody: "Pick someone on the left to see their history and send a message as them.",
    headerAs: (label: string, phone: string) => `Texting Acme Plumbing as ${label} (${phone})`,
    spamNoReply: "no reply (spam filtered)",
    noReply: "(no reply)"
  },

  composer: {
    placeholder: "Message as this customer…",
    send: "Send",
    sending: "Sending…",
    reset: "Reset thread",
    typing: "Acme's assistant is thinking… (can take 20–50s)"
  },

  batch: {
    trigger: "Run batch",
    running: "Running…",
    title: "Batch run",
    subtitle: "All 50 eval scenarios + 5 extras, 5 at a time.",
    close: "Close",
    summary: (s: { sent: number; ok: number; matched: number; errored: number }) =>
      `${s.sent} sent · ${s.ok} ok · ${s.matched} matched · ${s.errored} errored`,
    cols: {
      scenario: "Scenario",
      text: "Message",
      expected: "Expected",
      returned: "Returned",
      agent: "Agent",
      latency: "Latency",
      match: "Match",
      error: "Error"
    },
    pass: "pass",
    fail: "fail",
    any: "n/a"
  },

  banner: {
    mock: "Offline mock mode — the webhook isn't configured, so replies are simulated.",
    error: "Offline: the webhook isn't configured. Sends will show an error."
  },

  tags: {
    mock: "offline mock",
    actions: "actions"
  }
} as const;
