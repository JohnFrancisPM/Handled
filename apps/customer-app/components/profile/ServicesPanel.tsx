"use client";

import { useForm, useFieldArray, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { ServicesPanelSchema } from "@/lib/schemas";
import type { z } from "zod";
import { useProfileBundle, usePanelSave } from "@/components/profile/panel-utils";
import { ProfileFormFrame } from "@/components/profile/ProfileFormFrame";
import { PanelSkeleton } from "@/components/profile/PanelSkeleton";
import { FormField } from "@/components/profile/FormField";
import { RowCard } from "@/components/profile/RowCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ErrorCard } from "@/components/ui/ErrorCard";

type FormValues = z.infer<typeof ServicesPanelSchema>;

export function ServicesPanel() {
  const { data, isLoading, isError, refetch } = useProfileBundle();
  if (isLoading) return <PanelSkeleton />;
  if (isError || !data) return <ErrorCard message="Could not load your services." onRetry={() => refetch()} />;
  return (
    <ServicesForm
      defaults={{
        services: data.services.map((s) => ({
          name: s.name,
          category: s.category ?? "",
          offered: s.offered,
          description: s.description ?? "",
          notes: s.notes ?? ""
        }))
      }}
    />
  );
}

function ServicesForm({ defaults }: { defaults: FormValues }) {
  const { save, saving, savedAt, errorMessage, isDemo } = usePanelSave("services");
  const { control, register, handleSubmit, watch } = useForm<FormValues>({
    resolver: zodResolver(ServicesPanelSchema),
    defaultValues: defaults
  });
  const { fields, append, remove } = useFieldArray({ control, name: "services" });
  const current = watch("services");

  const offeredIdx = fields.map((_, i) => i).filter((i) => current?.[i]?.offered);
  const notOfferedIdx = fields.map((_, i) => i).filter((i) => !current?.[i]?.offered);

  return (
    <ProfileFormFrame
      title="Services"
      description="What you offer — and what you explicitly don't — so the AI can book or decline honestly."
      onSubmit={handleSubmit(save)}
      saving={saving}
      savedAt={savedAt}
      errorMessage={errorMessage}
      isDemo={isDemo}
    >
      <ServiceGroup
        heading="Services offered"
        indices={offeredIdx}
        register={register}
        remove={remove}
      />
      <Button
        variant="secondary"
        size="sm"
        onClick={() => append({ name: "", category: "", offered: true, description: "", notes: "" })}
      >
        <Plus size={14} /> Add offered service
      </Button>

      <ServiceGroup
        heading="Services NOT offered"
        indices={notOfferedIdx}
        register={register}
        remove={remove}
      />
      <Button
        variant="secondary"
        size="sm"
        onClick={() => append({ name: "", category: "", offered: false, description: "", notes: "" })}
      >
        <Plus size={14} /> Add won&apos;t-provide service
      </Button>
    </ProfileFormFrame>
  );
}

function ServiceGroup({
  heading,
  indices,
  register,
  remove
}: {
  heading: string;
  indices: number[];
  register: UseFormRegister<FormValues>;
  remove: (index: number) => void;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="type-body-lg font-medium text-grey-900">{heading}</h3>
      {indices.length === 0 && (
        <p className="type-body-sm text-grey-500">None yet — add one below.</p>
      )}
      {indices.map((i, pos) => (
        <RowCard
          key={i}
          title={`${heading.replace(/s$/, "")} ${pos + 1}`}
          onRemove={() => remove(i)}
          removeLabel="Remove service"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Service name" htmlFor={`service-${i}-name`}>
              <Input id={`service-${i}-name`} placeholder="e.g. Drain clearing" {...register(`services.${i}.name`)} />
            </FormField>
            <FormField label="Category" htmlFor={`service-${i}-category`}>
              <Input id={`service-${i}-category`} placeholder="e.g. drain" {...register(`services.${i}.category`)} />
            </FormField>
            <FormField
              label="Notes"
              htmlFor={`service-${i}-notes`}
              hint="Optional — e.g. why it's not provided."
              className="sm:col-span-2"
            >
              <Input id={`service-${i}-notes`} {...register(`services.${i}.notes`)} />
            </FormField>
          </div>
          <label className="flex items-center gap-2 type-body-sm text-grey-700">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[color:var(--brand)]"
              {...register(`services.${i}.offered`)}
            />
            Offered to customers
          </label>
        </RowCard>
      ))}
    </section>
  );
}
