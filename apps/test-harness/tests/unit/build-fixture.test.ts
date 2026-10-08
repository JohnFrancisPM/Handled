import { describe, it, expect } from "vitest";
import { buildCustomers, type SeedSources } from "../../../../scripts/build-harness-fixture";

const sources: SeedSources = {
  profile: `insert into public.services (id, org_id, name, category, offered, description) values
    ('50000000-0000-0000-0000-000000000001','a0','Drain clearing & clog removal','drain',true,'desc');`,
  customers: `insert into public.end_customers (id, org_id, phone, name, address) values
    ('c0000000-0000-0000-0000-000000000001','a0','+15551230001','Jane Doe','112-20 72nd Ave'),
    ('c0000000-0000-0000-0000-000000000023','a0','+15551230023', null, null),
    ('c0000000-0000-0000-0000-000000000024','a0','+15551230024','Spam Source', null);`,
  conversations: `insert into public.conversations (id, org_id, end_customer_id, channel, status, last_intent) values
    ('d0000000-0000-0000-0000-000000000001','a0','c0000000-0000-0000-0000-000000000001','sms','booked','book'),
    ('d0000000-0000-0000-0000-000000000024','a0','c0000000-0000-0000-0000-000000000024','sms','spam','spam');
  insert into public.messages (org_id, conversation_id, role, content, intent, agent, tool_calls, created_at) values
    ('a0','d0000000-0000-0000-0000-000000000001','user','My sink is clogged','book',null,null, now()),
    ('a0','d0000000-0000-0000-0000-000000000001','assistant','You''re booked, I''m on it','book','new_booking','[{"tool":"check_availability"},{"tool":"create_appointment","price":180}]'::jsonb, now() + interval '10 seconds'),
    ('a0','d0000000-0000-0000-0000-000000000024','user','buy now extended warranty','spam',null,null, now());`,
  appointments: `insert into public.appointments (org_id, end_customer_id, service_id, scheduled_at, status, price, source_conversation_id) values
    ('a0','c0000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000001', now() - interval '6 days','closed_won',180,'d0000000-0000-0000-0000-000000000001');`
};

describe("buildCustomers (fixture extractor)", () => {
  const customers = buildCustomers(sources);

  it("parses all customers, sorted by id suffix", () => {
    expect(customers.map((c) => c.id.slice(-2))).toEqual(["01", "23", "24"]);
  });

  it("decodes SQL-escaped quotes ('' → ')", () => {
    const jane = customers[0]!;
    const assistant = jane.history.find((t) => t.role === "assistant")!;
    expect(assistant.content).toBe("You're booked, I'm on it");
  });

  it("maps tool_calls jsonb → actions with tool→type and preserves extra keys", () => {
    const assistant = customers[0]!.history.find((t) => t.role === "assistant")!;
    expect(assistant.actions).toEqual([
      { type: "check_availability" },
      { type: "create_appointment", price: 180 }
    ]);
  });

  it("normalizes now()+interval to relative ts labels in order", () => {
    expect(customers[0]!.history.map((t) => t.ts)).toEqual(["t+0s", "t+10s"]);
  });

  it("resolves service_id → name and now()-interval → '6 days ago' for last_job", () => {
    expect(customers[0]!.last_job).toEqual({
      service: "Drain clearing & clog removal",
      price: 180,
      status: "closed_won",
      scheduled_rel: "6 days ago"
    });
  });

  it("handles null name/address (#23) and leaves last_job null when no appointment", () => {
    const c23 = customers[1]!;
    expect(c23.name).toBeNull();
    expect(c23.address).toBeNull();
    expect(c23.last_job).toBeNull();
  });

  it("keeps a spam thread as a single user turn with no assistant reply", () => {
    const spam = customers[2]!;
    expect(spam.history).toHaveLength(1);
    expect(spam.history[0]!.role).toBe("user");
    expect(spam.last_job).toBeNull();
  });

  it("is idempotent: same input → identical output", () => {
    expect(buildCustomers(sources)).toEqual(customers);
  });
});
