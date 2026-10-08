"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProfileIdentitySchema, type ProfileIdentityInput } from "@/lib/schemas";
import type { BusinessProfile } from "@/lib/types";
import { useProfileBundle, usePanelSave } from "@/components/profile/panel-utils";
import { ProfileFormFrame } from "@/components/profile/ProfileFormFrame";
import { FormField } from "@/components/profile/FormField";
import { ChipsInput } from "@/components/profile/ChipsInput";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorCard } from "@/components/ui/ErrorCard";

export function IdentityPanel() {
  const { data, isLoading, isError, refetch } = useProfileBundle();
  if (isLoading) return <PanelSkeleton />;
  if (isError || !data) return <ErrorCard message="Could not load your profile." onRetry={() => refetch()} />;
  return <IdentityForm defaults={data.profile} />;
}

function IdentityForm({ defaults }: { defaults: BusinessProfile }) {
  const { save, saving, savedAt, errorMessage, isDemo } = usePanelSave("identity");
  const {
    register,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<ProfileIdentityInput>({
    resolver: zodResolver(ProfileIdentitySchema),
    defaultValues: {
      legal_name: defaults.legal_name,
      trade: defaults.trade ?? "",
      base_zip: defaults.base_zip ?? "",
      customer_types: defaults.customer_types ?? [],
      about: defaults.about ?? "",
      ai_disclosure_text: defaults.ai_disclosure_text ?? "",
      spanish_enabled: defaults.spanish_enabled
    }
  });

  return (
    <ProfileFormFrame
      title="Business identity"
      description="How the AI introduces your business and who you serve."
      onSubmit={handleSubmit(save)}
      saving={saving}
      savedAt={savedAt}
      errorMessage={errorMessage}
      isDemo={isDemo}
    >
      <FormField label="Business name" htmlFor="legal_name" error={errors.legal_name?.message}>
        <Input id="legal_name" invalid={!!errors.legal_name} {...register("legal_name")} />
      </FormField>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <FormField label="Trade" htmlFor="trade" error={errors.trade?.message}>
          <Input id="trade" invalid={!!errors.trade} {...register("trade")} />
        </FormField>
        <FormField label="Base ZIP" htmlFor="base_zip" error={errors.base_zip?.message}>
          <Input id="base_zip" invalid={!!errors.base_zip} {...register("base_zip")} />
        </FormField>
      </div>

      <FormField label="Customer types" hint="Add the customer types you serve (press Enter).">
        <Controller
          control={control}
          name="customer_types"
          render={({ field }) => (
            <ChipsInput value={field.value} onChange={field.onChange} tone="brand" />
          )}
        />
      </FormField>

      <FormField label="About" htmlFor="about" error={errors.about?.message}>
        <Textarea id="about" {...register("about")} />
      </FormField>

      <FormField
        label="AI disclosure text"
        htmlFor="ai_disclosure_text"
        hint="Shown to customers so they know they're chatting with your AI assistant."
        error={errors.ai_disclosure_text?.message}
      >
        <Textarea
          id="ai_disclosure_text"
          invalid={!!errors.ai_disclosure_text}
          {...register("ai_disclosure_text")}
        />
      </FormField>

      <FormField label="Spanish support">
        <label className="flex items-center gap-2 type-body-lg text-grey-900">
          <input
            type="checkbox"
            className="h-4 w-4 accent-[color:var(--brand)]"
            {...register("spanish_enabled")}
          />
          Enable Spanish replies
        </label>
      </FormField>
    </ProfileFormFrame>
  );
}

function PanelSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}
