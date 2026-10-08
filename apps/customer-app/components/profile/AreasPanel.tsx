"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import type { z } from "zod";
import { ServiceAreasPanelSchema } from "@/lib/schemas";
import { useProfileBundle, usePanelSave } from "@/components/profile/panel-utils";
import { ProfileFormFrame } from "@/components/profile/ProfileFormFrame";
import { PanelSkeleton } from "@/components/profile/PanelSkeleton";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
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
        {fields.map((f, i) => (
          <Card key={f.id} elevated className="flex flex-col gap-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input placeholder="Region" aria-label="Region" {...register(`areas.${i}.region`)} />
              <Select {...register(`areas.${i}.mode`)} aria-label="Mode">
                <option value="serve">Serve</option>
                <option value="deny">Deny</option>
              </Select>
            </div>
            <Controller
              control={control}
              name={`areas.${i}.zips`}
              render={({ field }) => (
                <ChipsInput
                  value={field.value ?? []}
                  onChange={field.onChange}
                  placeholder="Add a ZIP and press Enter"
                  tone="grey"
                />
              )}
            />
            <div>
              <Button variant="ghost" size="sm" onClick={() => remove(i)} aria-label="Remove area">
                <Trash2 size={16} /> Remove
              </Button>
            </div>
          </Card>
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
