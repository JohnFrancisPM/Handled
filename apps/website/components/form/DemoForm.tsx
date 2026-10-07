"use client";

import { useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { leadSchema, TRADES, PLAN_INTEREST } from "@/lib/validation/lead";
import { Field } from "@/components/form/Field";
import { Select } from "@/components/form/Select";
import { FormSuccess } from "@/components/form/FormSuccess";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

type Status = "idle" | "submitting" | "success" | "error";

type Values = {
  name: string;
  businessName: string;
  email: string;
  phone: string;
  trade: string;
  weeklyCalls: string;
  planInterest: string;
  message: string;
  company: string; // honeypot
};

const EMPTY: Values = {
  name: "",
  businessName: "",
  email: "",
  phone: "",
  trade: "",
  weeklyCalls: "",
  planInterest: "",
  message: "",
  company: ""
};

const inputBase =
  "h-10 w-full rounded-md border bg-white px-3 type-body-lg text-grey-900 transition-colors duration-[var(--motion-fast)] ease-ds-out";

function inputClass(hasError: boolean) {
  return cn(inputBase, hasError ? "border-red-500 bg-red-50 text-red-700" : "border-grey-100 hover:border-grey-200");
}

const FIELD_ORDER: (keyof Values)[] = [
  "name",
  "businessName",
  "email",
  "phone",
  "trade",
  "weeklyCalls",
  "planInterest",
  "message"
];

export function DemoForm() {
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan");
  const initialPlan = (PLAN_INTEREST as readonly string[]).includes(planParam ?? "") ? (planParam as string) : "";

  const formLoadedAt = useRef<number>(Date.now());
  const [values, setValues] = useState<Values>({ ...EMPTY, planInterest: initialPlan });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [banner, setBanner] = useState<string | null>(null);

  const set = (key: keyof Values, v: string) => setValues((prev) => ({ ...prev, [key]: v }));

  const describedBy = (id: string) =>
    errors[id] ? `${id}-error` : undefined;

  function buildPayload() {
    return {
      name: values.name,
      businessName: values.businessName,
      email: values.email,
      phone: values.phone,
      trade: values.trade,
      weeklyCalls: values.weeklyCalls === "" ? undefined : values.weeklyCalls,
      planInterest: values.planInterest,
      message: values.message,
      company: values.company,
      sourcePath: typeof window !== "undefined" ? window.location.pathname : undefined,
      formLoadedAt: formLoadedAt.current
    };
  }

  function focusFirstError(fieldErrors: Record<string, string>) {
    const first = FIELD_ORDER.find((k) => fieldErrors[k]);
    if (first) {
      const el = document.getElementById(first);
      el?.focus();
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBanner(null);

    const payload = buildPayload();
    const parsed = leadSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      setStatus("idle");
      focusFirstError(fieldErrors);
      return;
    }

    setErrors({});
    setStatus("submitting");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.status === 200) {
        setStatus("success");
        return;
      }
      if (res.status === 400) {
        const data = (await res.json().catch(() => null)) as { fields?: Record<string, string> } | null;
        setErrors(data?.fields ?? {});
        setStatus("idle");
        focusFirstError(data?.fields ?? {});
        return;
      }
      if (res.status === 429) {
        setBanner("You've submitted a few times — please wait a minute and try again.");
        setStatus("error");
        return;
      }
      setBanner("Something went wrong. Please try again.");
      setStatus("error");
    } catch {
      setBanner("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return <FormSuccess />;
  }

  const tradeOptions = TRADES.map((t) => ({ value: t, label: t }));
  const planOptions = [
    { value: "starter", label: "Starter" },
    { value: "pro", label: "Pro" },
    { value: "scale", label: "Scale" }
  ];

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {banner && (
        <div role="alert" className="rounded-md border border-red-500 bg-red-50 p-4 type-body-lg text-red-700">
          {banner}
        </div>
      )}

      <Field id="name" label="Your name" required error={errors.name}>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          aria-invalid={!!errors.name}
          aria-describedby={describedBy("name")}
          className={inputClass(!!errors.name)}
        />
      </Field>

      <Field id="businessName" label="Business name" required error={errors.businessName}>
        <input
          id="businessName"
          name="businessName"
          type="text"
          autoComplete="organization"
          value={values.businessName}
          onChange={(e) => set("businessName", e.target.value)}
          aria-invalid={!!errors.businessName}
          aria-describedby={describedBy("businessName")}
          className={inputClass(!!errors.businessName)}
        />
      </Field>

      <Field id="email" label="Email" required error={errors.email}>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(e) => set("email", e.target.value)}
          aria-invalid={!!errors.email}
          aria-describedby={describedBy("email")}
          className={inputClass(!!errors.email)}
        />
      </Field>

      <Field id="phone" label="Phone" error={errors.phone}>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          value={values.phone}
          onChange={(e) => set("phone", e.target.value)}
          aria-invalid={!!errors.phone}
          aria-describedby={describedBy("phone")}
          className={inputClass(!!errors.phone)}
        />
      </Field>

      <Field id="trade" label="Trade" error={errors.trade}>
        <Select
          id="trade"
          name="trade"
          options={tradeOptions}
          value={values.trade}
          onChange={(e) => set("trade", e.target.value)}
          error={!!errors.trade}
          aria-invalid={!!errors.trade}
          aria-describedby={describedBy("trade")}
        />
      </Field>

      <Field id="weeklyCalls" label="Roughly how many calls per week?" error={errors.weeklyCalls}>
        <input
          id="weeklyCalls"
          name="weeklyCalls"
          type="number"
          min={0}
          value={values.weeklyCalls}
          onChange={(e) => set("weeklyCalls", e.target.value)}
          aria-invalid={!!errors.weeklyCalls}
          aria-describedby={describedBy("weeklyCalls")}
          className={inputClass(!!errors.weeklyCalls)}
        />
      </Field>

      <Field id="planInterest" label="Plan you're interested in" error={errors.planInterest}>
        <Select
          id="planInterest"
          name="planInterest"
          options={planOptions}
          value={values.planInterest}
          onChange={(e) => set("planInterest", e.target.value)}
          error={!!errors.planInterest}
          aria-invalid={!!errors.planInterest}
          aria-describedby={describedBy("planInterest")}
        />
      </Field>

      <Field id="message" label="Anything else?" error={errors.message}>
        <textarea
          id="message"
          name="message"
          rows={4}
          maxLength={2000}
          value={values.message}
          onChange={(e) => set("message", e.target.value)}
          aria-invalid={!!errors.message}
          aria-describedby={describedBy("message")}
          className={cn(
            "w-full rounded-md border bg-white px-3 py-2 type-body-lg text-grey-900 transition-colors duration-[var(--motion-fast)] ease-ds-out",
            errors.message ? "border-red-500 bg-red-50 text-red-700" : "border-grey-100 hover:border-grey-200"
          )}
        />
      </Field>

      {/* Honeypot — hidden from users and screen readers; must stay empty (R24) */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="company">Company (leave blank)</label>
        <input
          id="company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.company}
          onChange={(e) => set("company", e.target.value)}
        />
      </div>

      <Button type="submit" size="lg" disabled={status === "submitting"}>
        {status === "submitting" ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 size={20} className="animate-spin" aria-hidden="true" />
            Submitting…
          </span>
        ) : (
          "Book a demo"
        )}
      </Button>

      <p className="type-body-sm text-grey-500">
        By submitting you agree to be contacted about Handled. See our{" "}
        <a href="/privacy" className="text-brand underline hover:text-brand-600">
          Privacy Policy
        </a>
        .
      </p>
    </form>
  );
}
