"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import type { z } from "zod";
import { EmergencyPanelSchema } from "@/lib/schemas";
import { useProfileBundle, usePanelSave } from "@/components/profile/panel-utils";
import { ProfileFormFrame } from "@/components/profile/ProfileFormFrame";
import { PanelSkeleton } from "@/components/profile/PanelSkeleton";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
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
        {fields.map((f, i) => (
          <Card key={f.id} elevated className="flex flex-col gap-3">
            <Input
              placeholder="Keyword or pattern (e.g. gas / gas smell)"
              aria-label="Keyword or pattern"
              {...register(`emergency_rules.${i}.keyword_or_pattern`)}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Select {...register(`emergency_rules.${i}.severity`)} aria-label="Severity">
                <option value="emergency">Emergency</option>
                <option value="urgent">Urgent</option>
              </Select>
              <Select {...register(`emergency_rules.${i}.action`)} aria-label="Action">
                <option value="escalate_oncall">Escalate to on-call</option>
                <option value="advise_911">Advise 911</option>
                <option value="same_day_priority">Same-day priority</option>
              </Select>
            </div>
            <Textarea
              placeholder="Guidance the AI gives the customer"
              aria-label="Guidance text"
              rows={2}
              {...register(`emergency_rules.${i}.guidance_text`)}
            />
            <div>
              <Button variant="ghost" size="sm" onClick={() => remove(i)} aria-label="Remove rule">
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
