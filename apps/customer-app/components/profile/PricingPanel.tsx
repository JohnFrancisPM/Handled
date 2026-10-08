"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import type { z } from "zod";
import { PricingPanelSchema } from "@/lib/schemas";
import { useProfileBundle, usePanelSave } from "@/components/profile/panel-utils";
import { ProfileFormFrame } from "@/components/profile/ProfileFormFrame";
import { PanelSkeleton } from "@/components/profile/PanelSkeleton";
import { FormField } from "@/components/profile/FormField";
import { RowCard } from "@/components/profile/RowCard";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ErrorCard } from "@/components/ui/ErrorCard";
import type { Service } from "@/lib/types";

type FormValues = z.infer<typeof PricingPanelSchema>;

export function PricingPanel() {
  const { data, isLoading, isError, refetch } = useProfileBundle();
  if (isLoading) return <PanelSkeleton />;
  if (isError || !data) return <ErrorCard message="Could not load pricing." onRetry={() => refetch()} />;
  return (
    <PricingForm
      services={data.services.filter((s) => s.offered)}
      defaults={{
        pricing: data.pricing.map((p) => ({
          service_id: p.service_id,
          price_min: p.price_min ?? 0,
          price_max: p.price_max ?? 0,
          unit: p.unit,
          notes: p.notes ?? ""
        }))
      }}
    />
  );
}

function PricingForm({ services, defaults }: { services: Service[]; defaults: FormValues }) {
  const { save, saving, savedAt, errorMessage, isDemo } = usePanelSave("pricing");
  const {
    control,
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({ resolver: zodResolver(PricingPanelSchema), defaultValues: defaults });
  const { fields, append, remove } = useFieldArray({ control, name: "pricing" });

  return (
    <ProfileFormFrame
      title="Pricing"
      description="Configured ranges the AI quotes within. Leave a service un-priced to force a lead for quote."
      onSubmit={handleSubmit(save)}
      saving={saving}
      savedAt={savedAt}
      errorMessage={errorMessage}
      isDemo={isDemo}
    >
      <div className="flex flex-col gap-3">
        {fields.length === 0 && <p className="type-body-sm text-grey-500">No pricing rows yet — add one below.</p>}
        {fields.map((f, i) => (
          <RowCard key={f.id} title={`Pricing ${i + 1}`} onRemove={() => remove(i)} removeLabel="Remove pricing row">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Service" htmlFor={`pricing-${i}-service`}>
                <Select id={`pricing-${i}-service`} {...register(`pricing.${i}.service_id`)}>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Unit" htmlFor={`pricing-${i}-unit`}>
                <Select id={`pricing-${i}-unit`} {...register(`pricing.${i}.unit`)}>
                  <option value="flat">Flat</option>
                  <option value="hourly">Hourly</option>
                  <option value="starting_at">Starting at</option>
                </Select>
              </FormField>
              <FormField label="Minimum price" htmlFor={`pricing-${i}-min`} hint="In USD.">
                <Input
                  id={`pricing-${i}-min`}
                  type="number"
                  placeholder="150"
                  {...register(`pricing.${i}.price_min`)}
                />
              </FormField>
              <FormField
                label="Maximum price"
                htmlFor={`pricing-${i}-max`}
                error={errors.pricing?.[i]?.price_max?.message}
              >
                <Input
                  id={`pricing-${i}-max`}
                  type="number"
                  placeholder="450"
                  invalid={!!errors.pricing?.[i]?.price_max}
                  {...register(`pricing.${i}.price_max`)}
                />
              </FormField>
              <FormField label="Notes" htmlFor={`pricing-${i}-notes`} className="sm:col-span-2">
                <Input id={`pricing-${i}-notes`} placeholder="e.g. final price depends on inspection" {...register(`pricing.${i}.notes`)} />
              </FormField>
            </div>
          </RowCard>
        ))}
      </div>

      <Button
        variant="secondary"
        size="sm"
        onClick={() =>
          append({
            service_id: services[0]?.id ?? "",
            price_min: 0,
            price_max: 0,
            unit: "starting_at",
            notes: ""
          })
        }
      >
        <Plus size={14} /> Add pricing
      </Button>
    </ProfileFormFrame>
  );
}
