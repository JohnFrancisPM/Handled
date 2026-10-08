"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import type { z } from "zod";
import { EmergencyPanelSchema } from "@/lib/schemas";
import { useProfileBundle, usePanelSave } from "@/components/profile/panel-utils";
import { ProfileFormFrame } from "@/components/profile/ProfileFormFrame";
import { PanelSkeleton } from "@/components/profile/PanelSkeleton";
import { FormField } from "@/components/profile/FormField";
import { RowCard } from "@/components/profile/RowCard";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { ErrorCard } from "@/components/ui/ErrorCard";

type FormValues = z.infer<typeof EmergencyPanelSchema>;

export function EmergencyPanel() {
  const { data, isLoading, isError, refetch } = useProfileBundle();
  if (isLoading) return <PanelSkeleton />;
  if (isError || !data) return <ErrorCard message="Could not load emergency rules." onRetry={() => refetch()} />;
  return (
    <EmergencyForm
      defaults={{
        emergency_rules: data.emergency_rules.map((r) => ({
          keyword_or_pattern: r.keyword_or_pattern,
          severity: r.severity,
          action: r.action,
          guidance_text: r.guidance_text ?? ""
        }))
      }}
    />
  );
}

function EmergencyForm({ defaults }: { defaults: FormValues }) {
  const { save, saving, savedAt, errorMessage, isDemo } = usePanelSave("emergency");
  const { control, register, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(EmergencyPanelSchema),
    defaultValues: defaults
  });
  const { fields, append, remove } = useFieldArray({ control, name: "emergency_rules" });

  return (
    <ProfileFormFrame
      title="Emergency rules"
      description="How the AI triages safety situations — the keywords it matches, severity, and the action + guidance it takes."
      onSubmit={handleSubmit(save)}
      saving={saving}
      savedAt={savedAt}
      errorMessage={errorMessage}
      isDemo={isDemo}
    >
      <div className="flex flex-col gap-3">
        {fields.length === 0 && (
          <p className="type-body-sm text-grey-500">No emergency rules yet — add one below.</p>
        )}
        {fields.map((f, i) => (
          <RowCard key={f.id} title={`Rule ${i + 1}`} onRemove={() => remove(i)} removeLabel="Remove rule">
            <FormField label="Keyword or pattern" htmlFor={`er-${i}-keyword`}>
              <Input
                id={`er-${i}-keyword`}
                placeholder="e.g. gas / gas smell"
                {...register(`emergency_rules.${i}.keyword_or_pattern`)}
              />
            </FormField>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Severity" htmlFor={`er-${i}-severity`}>
                <Select id={`er-${i}-severity`} {...register(`emergency_rules.${i}.severity`)}>
                  <option value="emergency">Emergency</option>
                  <option value="urgent">Urgent</option>
                </Select>
              </FormField>
              <FormField label="Action" htmlFor={`er-${i}-action`}>
                <Select id={`er-${i}-action`} {...register(`emergency_rules.${i}.action`)}>
                  <option value="escalate_oncall">Escalate to on-call</option>
                  <option value="advise_911">Advise 911</option>
                  <option value="same_day_priority">Same-day priority</option>
                </Select>
              </FormField>
            </div>
            <FormField label="Guidance text" htmlFor={`er-${i}-guidance`} hint="What the AI tells the customer.">
              <Textarea
                id={`er-${i}-guidance`}
                placeholder="e.g. Leave the house now and call 911 from outside."
                rows={2}
                {...register(`emergency_rules.${i}.guidance_text`)}
              />
            </FormField>
          </RowCard>
        ))}
      </div>

      <Button
        variant="secondary"
        size="sm"
        onClick={() =>
          append({
            keyword_or_pattern: "",
            severity: "emergency",
            action: "escalate_oncall",
            guidance_text: ""
          })
        }
      >
        <Plus size={14} /> Add rule
      </Button>
    </ProfileFormFrame>
  );
}
