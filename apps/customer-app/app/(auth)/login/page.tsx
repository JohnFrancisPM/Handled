"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, type LoginInput } from "@/lib/schemas";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { isDemoMode } from "@/lib/env";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/profile/FormField";

// Login (auth-and-middleware.md Flow K): email/password → signInWithPassword →
// redirect /dashboard. In demo mode there's no auth env, so offer a direct entry.
export default function LoginPage() {
  const router = useRouter();
  const demo = isDemoMode();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginInput>({ resolver: zodResolver(LoginSchema) });

  async function onSubmit(values: LoginInput) {
    setFormError(null);
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      router.push("/dashboard");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password
    });
    setSubmitting(false);
    if (error) {
      setFormError("Those credentials didn't work. Please try again.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main id="main" className="flex min-h-screen items-center justify-center bg-grey-25 p-8">
      <Card className="w-full max-w-[400px]">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <span className="type-h5 text-grey-900">Handled</span>
            <h1 className="type-h3 text-grey-900">Sign in</h1>
            <p className="type-body-sm text-grey-500">
              Sign in to your Acme Plumbing dashboard.
            </p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            <FormField label="Email" htmlFor="email" error={errors.email?.message}>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="mike@acmeplumbing.com"
                invalid={!!errors.email}
                {...register("email")}
              />
            </FormField>

            <FormField label="Password" htmlFor="password" error={errors.password?.message}>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                invalid={!!errors.password}
                {...register("password")}
              />
            </FormField>

            {formError && (
              <p role="alert" className="rounded-md border border-red-500 bg-red-50 px-3 py-2 type-body-sm text-red-700">
                {formError}
              </p>
            )}

            <Button type="submit" fullWidth disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          {demo && (
            <div className="flex flex-col gap-2 border-t border-grey-100 pt-4">
              <p className="type-body-sm text-grey-500">
                Running in demo mode — explore the dashboard with seeded Acme data.
              </p>
              <Button variant="secondary" fullWidth href="/dashboard">
                Enter demo dashboard
              </Button>
            </div>
          )}
        </div>
      </Card>
    </main>
  );
}
