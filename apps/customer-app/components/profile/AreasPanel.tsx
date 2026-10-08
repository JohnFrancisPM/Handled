"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import type { z } from "zod";
import { ServiceAreasPanelSchema } from "@/lib/schemas";
import { useProfileBundle, usePanelSave } from "@/components/profile/panel-utils";
import { ProfileFormFrame } from "@/components/profile/ProfileFormFrame";
import { PanelSkeleton } from "@/components/profile/PanelSkeleton";
import { FormField } from "@/components/profile/FormField";
import { RowCard } from "@/components/profile/RowCard";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ChipsInput } from "@/components/profile/ChipsInput";
import { ErrorCard } from "@/components/ui/ErrorCard";

type FormValues = z.infer<typeof ServiceAreasPanelSchema>;

export function AreasPanel() {
  const { data, isLoading, isError, refetch } = useProfileBundle();
  if (isLoading) return <PanelSkeleton />;
  if (isError || !data) return <ErrorCard message="Could not load service areas." onRetry={() => refetch()} />;
  return (
    <AreasForm
      defaults={{
        areas: data.areas.map((a) => ({ region: a.region, zips: a.zips, mode: a.mode }))
      }}
    />
  );
}

function AreasForm({ defaults }: { defaults: FormValues }) {
  const { save, saving, savedAt, errorMessage, isDemo } = usePanelSave("areas");
  const { control, register, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(ServiceAreasPanelSchema),
    defaultValues: defaults
  });
  const { fields, append, remove } = useFieldArray({ control, name: "areas" });

  return (
    <ProfileFormFrame
      title="Service areas"
      description="Regions you serve or explicitly deny, with the ZIPs that belong to each."
      onSubmit={handleSubmit(save)}
      saving={saving}
      savedAt={savedAt}
      errorMessage={errorMessage}
      isDemo={isDemo}
    >
      <div className="flex flex-col gap-3">
        {fields.length === 0 && (
          <p className="type-body-sm text-grey-500">No service areas yet — add one below.</p>
        )}
        {fields.map((f, i) => (
          <RowCard key={f.id} title={`Area ${i + 1}`} onRemove={() => remove(i)} removeLabel="Remove area">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Region" htmlFor={`area-${i}-region`}>
                <Input id={`area-${i}-region`} placeholder="e.g. Queens" {...register(`areas.${i}.region`)} />
              </FormField>
              <FormField label="Mode" htmlFor={`area-${i}-mode`} hint="Serve = book here; Deny = decline here.">
                <Select id={`area-${i}-mode`} {...register(`areas.${i}.mode`)}>
                  <option value="serve">Serve</option>
                  <option value="deny">Deny</option>
                </Select>
              </FormField>
            </div>
            <FormField label="ZIP codes" hint="Add a ZIP and press Enter.">
              <Controller
                control={control}
                name={`areas.${i}.zips`}
                render={({ field }) => (
                  <ChipsInput
                    value={field.value ?? []}
                    onChange={field.onChange}
                    placeholder="e.g. 11375"
                    tone="grey"
                  />
                )}
              />
            </FormField>
          </RowCard>
        ))}
      </div>

      <Button
        variant="secondary"
        size="sm"
        onClick={() => append({ region: "", zips: [], mode: "serve" })}
      >
        <Plus size={14} /> Add area
      </Button>
    </ProfileFormFrame>
  );
}
