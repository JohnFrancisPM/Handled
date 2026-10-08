"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import type { z } from "zod";
import { TeamPanelSchema } from "@/lib/schemas";
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

type FormValues = z.infer<typeof TeamPanelSchema>;

export function TeamPanel() {
  const { data, isLoading, isError, refetch } = useProfileBundle();
  if (isLoading) return <PanelSkeleton />;
  if (isError || !data) return <ErrorCard message="Could not load your team." onRetry={() => refetch()} />;
  return (
    <TeamForm
      defaults={{
        technicians: data.technicians.map((t) => ({
          name: t.name,
          skills: t.skills,
          status: t.status,
          status_until: t.status_until ?? ""
        }))
      }}
    />
  );
}

function TeamForm({ defaults }: { defaults: FormValues }) {
  const { save, saving, savedAt, errorMessage, isDemo } = usePanelSave("team");
  const { control, register, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(TeamPanelSchema),
    defaultValues: defaults
  });
  const { fields, append, remove } = useFieldArray({ control, name: "technicians" });

  return (
    <ProfileFormFrame
      title="Team"
      description="Your technicians and their availability — mark anyone sick, on vacation, or off."
      onSubmit={handleSubmit(save)}
      saving={saving}
      savedAt={savedAt}
      errorMessage={errorMessage}
      isDemo={isDemo}
    >
      <div className="flex flex-col gap-3">
        {fields.length === 0 && (
          <p className="type-body-sm text-grey-500">No technicians yet — add one below.</p>
        )}
        {fields.map((f, i) => (
          <RowCard key={f.id} title={`Technician ${i + 1}`} onRemove={() => remove(i)} removeLabel="Remove technician">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField label="Name" htmlFor={`tech-${i}-name`}>
                <Input id={`tech-${i}-name`} placeholder="e.g. Dave Chen" {...register(`technicians.${i}.name`)} />
              </FormField>
              <FormField label="Availability" htmlFor={`tech-${i}-status`}>
                <Select id={`tech-${i}-status`} {...register(`technicians.${i}.status`)}>
                  <option value="available">Available</option>
                  <option value="sick">Sick</option>
                  <option value="vacation">Vacation</option>
                  <option value="off">Off</option>
                </Select>
              </FormField>
              <FormField label="Status until" htmlFor={`tech-${i}-until`} hint="Optional — when they return.">
                <Input id={`tech-${i}-until`} type="date" {...register(`technicians.${i}.status_until`)} />
              </FormField>
            </div>
            <FormField label="Skills" hint="Add a skill (e.g. drain) and press Enter.">
              <Controller
                control={control}
                name={`technicians.${i}.skills`}
                render={({ field }) => (
                  <ChipsInput
                    value={field.value ?? []}
                    onChange={field.onChange}
                    placeholder="e.g. drain"
                    tone="brand"
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
        onClick={() => append({ name: "", skills: [], status: "available", status_until: "" })}
      >
        <Plus size={14} /> Add technician
      </Button>
    </ProfileFormFrame>
  );
}
