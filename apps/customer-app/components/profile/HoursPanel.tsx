"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { HoursPanelSchema } from "@/lib/schemas";
import { useProfileBundle, usePanelSave } from "@/components/profile/panel-utils";
import { ProfileFormFrame } from "@/components/profile/ProfileFormFrame";
import { PanelSkeleton } from "@/components/profile/PanelSkeleton";
import { FormField } from "@/components/profile/FormField";
import { Input } from "@/components/ui/Input";
import { ChipsInput } from "@/components/profile/ChipsInput";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { weekdayName } from "@/lib/utils/format";

type FormValues = z.infer<typeof HoursPanelSchema>;

export function HoursPanel() {
  const { data, isLoading, isError, refetch } = useProfileBundle();
  if (isLoading) return <PanelSkeleton />;
  if (isError || !data) return <ErrorCard message="Could not load business hours." onRetry={() => refetch()} />;

  // Ensure all 7 days are present and ordered 0..6.
  const byDay = new Map(data.hours.map((h) => [h.day_of_week, h]));
  const hours = Array.from({ length: 7 }, (_, d) => {
    const h = byDay.get(d);
    return { day_of_week: d, open_time: h?.open_time ?? "", close_time: h?.close_time ?? "" };
  });

  return <HoursForm defaults={{ hours, closed_dates: data.closed_dates }} />;
}

function HoursForm({ defaults }: { defaults: FormValues }) {
  const { save, saving, savedAt, errorMessage, isDemo } = usePanelSave("hours");
  const { control, register, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(HoursPanelSchema),
    defaultValues: defaults
  });
  const { fields } = useFieldArray({ control, name: "hours" });

  return (
    <ProfileFormFrame
      title="Business hours"
      description="Weekly hours and holiday closures. Leave both times blank to mark a day closed."
      onSubmit={handleSubmit(save)}
      saving={saving}
      savedAt={savedAt}
      errorMessage={errorMessage}
      isDemo={isDemo}
    >
      <div className="flex flex-col gap-3">
        {fields.map((f, i) => (
          <div
            key={f.id}
            className="grid grid-cols-1 items-center gap-3 border-b border-grey-50 pb-3 sm:grid-cols-3"
          >
            <input type="hidden" {...register(`hours.${i}.day_of_week`, { valueAsNumber: true })} />
            <span className="type-body-lg text-grey-900">{weekdayName(i)}</span>
            <label className="flex items-center gap-2">
              <span className="sr-only">{weekdayName(i)} open time</span>
              <Input type="time" {...register(`hours.${i}.open_time`)} />
            </label>
            <label className="flex items-center gap-2">
              <span className="sr-only">{weekdayName(i)} close time</span>
              <Input type="time" {...register(`hours.${i}.close_time`)} />
            </label>
          </div>
        ))}
      </div>

      <FormField label="Closed dates" hint="Add holiday dates (YYYY-MM-DD) and press Enter.">
        <Controller
          control={control}
          name="closed_dates"
          render={({ field }) => (
            <ChipsInput
              value={field.value ?? []}
              onChange={field.onChange}
              placeholder="2026-12-25"
              tone="red"
            />
          )}
        />
      </FormField>
    </ProfileFormFrame>
  );
}
