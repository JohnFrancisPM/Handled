"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import type { z } from "zod";
import { PricingPanelSchema } from "@/lib/schemas";
import { useProfileBundle, usePanelSave } from "@/components/profile/panel-utils";
import { ProfileFormFrame } from "@/components/profile/ProfileFormFrame";
import { PanelSkeleton } from "@/components/profile/PanelSkeleton";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
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
        {fields.length === 0 && <p className="type-body-sm text-grey-500">No pricing rows yet.</p>}
        {fields.map((f, i) => (
          <Card key={f.id} elevated className="flex flex-col gap-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Select {...register(`pricing.${i}.service_id`)} aria-label="Service">
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
              <Select {...register(`pricing.${i}.unit`)} aria-label="Unit">
                <option value="flat">Flat</option>
                <option value="hourly">Hourly</option>
                <option value="starting_at">Starting at</option>
              </Select>
              <Input
                type="number"
                placeholder="Min price"
                aria-label="Minimum price"
                {...register(`pricing.${i}.price_min`)}
              />
              <Input
                type="number"
                placeholder="Max price"
                aria-label="Maximum price"
                invalid={!!errors.pricing?.[i]?.price_max}
                {...register(`pricing.${i}.price_max`)}
              />
              <Input
                placeholder="Notes"
                className="sm:col-span-2"
                {...register(`pricing.${i}.notes`)}
              />
            </div>
            {errors.pricing?.[i]?.price_max && (
              <span className="type-body-sm text-red-700" role="alert">
                {errors.pricing[i]?.price_max?.message}
              </span>
            )}
            <div>
              <Button variant="ghost" size="sm" onClick={() => remove(i)} aria-label="Remove pricing row">
                <Trash2 size={16} /> Remove
              </Button>
            </div>
          </Card>
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
