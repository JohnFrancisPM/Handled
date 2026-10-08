"use client";

import { useForm, useFieldArray, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { ServicesPanelSchema } from "@/lib/schemas";
import type { z } from "zod";
import { useProfileBundle, usePanelSave } from "@/components/profile/panel-utils";
import { ProfileFormFrame } from "@/components/profile/ProfileFormFrame";
import { PanelSkeleton } from "@/components/profile/PanelSkeleton";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
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
      <h3 className="type-body-lg text-grey-700">{heading}</h3>
      {indices.length === 0 && <p className="type-body-sm text-grey-500">None yet.</p>}
      {indices.map((i) => (
        <Card key={i} elevated className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
            <Input placeholder="Service name" {...register(`services.${i}.name`)} />
            <Input placeholder="Category" {...register(`services.${i}.category`)} />
            <Input
              placeholder="Notes (e.g. why it's not provided)"
              className="sm:col-span-2"
              {...register(`services.${i}.notes`)}
            />
            <label className="flex items-center gap-2 type-body-sm text-grey-700">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[color:var(--brand)]"
                {...register(`services.${i}.offered`)}
              />
              Offered to customers
            </label>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => remove(i)}
            aria-label="Remove service"
          >
            <Trash2 size={16} />
          </Button>
        </Card>
      ))}
    </section>
  );
}
