import type { Stat } from "@/content/stats";
import { Section } from "@/components/layout/Section";

type StatBandProps = { stats: Stat[]; heading?: string };

export function StatBand({ stats, heading }: StatBandProps) {
  return (
    <Section surface>
      {heading && (
        <h2 className="type-h3 text-grey-900 text-center max-w-[40ch] mx-auto">{heading}</h2>
      )}
      <dl className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-2">
            <dt className="type-h2 text-brand">{stat.value}</dt>
            <dd className="type-body-lg text-grey-500">{stat.label}</dd>
            <dd className="type-body-sm text-grey-400">{stat.source}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
