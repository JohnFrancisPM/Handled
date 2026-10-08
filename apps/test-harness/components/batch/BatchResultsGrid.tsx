import { BatchResultRow } from "@/components/batch/BatchResultRow";
import { copy } from "@/content/copy";
import type { BatchResult } from "@/lib/types";

export function BatchResultsGrid({ results }: { results: BatchResult[] }) {
  const c = copy.batch.cols;
  const headers = [c.scenario, c.text, c.expected, c.returned, c.agent, c.latency, c.match, c.error];
  return (
    <table role="table" className="w-full border-collapse">
      <thead>
        <tr className="border-b border-grey-200 text-left">
          {headers.map((h) => (
            <th key={h} className="px-2 py-2 type-body-sm font-medium text-grey-500">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {results.map((r) => (
          <BatchResultRow key={r.scenario_id} r={r} />
        ))}
      </tbody>
    </table>
  );
}
