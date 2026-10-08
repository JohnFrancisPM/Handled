"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import type { z } from "zod";
import { TeamPanelSchema } from "@/lib/schemas";
import { useProfileBundle, usePanelSave } from "@/components/profile/panel-utils";
import { ProfileFormFrame } from "@/components/profile/ProfileFormFrame";
import { PanelSkeleton } from "@/components/profile/PanelSkeleton";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
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
        {fields.map((f, i) => (
          <Card key={f.id} elevated className="flex flex-col gap-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Input placeholder="Name" aria-label="Technician name" {...register(`technicians.${i}.name`)} />
              <Select {...register(`technicians.${i}.status`)} aria-label="Availability status">
                <option value="available">Available</option>
                <option value="sick">Sick</option>
                <option value="vacation">Vacation</option>
                <option value="off">Off</option>
              </Select>
              <Input
                type="date"
                aria-label="Status until"
                {...register(`technicians.${i}.status_until`)}
              />
            </div>
            <Controller
              control={control}
              name={`technicians.${i}.skills`}
              render={({ field }) => (
                <ChipsInput
                  value={field.value ?? []}
                  onChange={field.onChange}
                  placeholder="Add a skill (e.g. drain) and press Enter"
                  tone="brand"
                />
              )}
            />
            <div>
              <Button variant="ghost" size="sm" onClick={() => remove(i)} aria-label="Remove technician">
                <Trash2 size={16} /> Remove
              </Button>
            </div>
          </Card>
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
