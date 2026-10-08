"use client";

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { useSemanticPalette } from "@/lib/charts/palette";

/**
 * FunnelChart — inbound → booked → closed_won (dashboard-pages.md /analytics).
 * Series map to the semantic palette: brand for inbound, green for won stages.
 */
export function FunnelChart({
  inbound,
  booked,
  closedWon
}: {
  inbound: number;
  booked: number;
  closedWon: number;
}) {
  const palette = useSemanticPalette();
  const data = [
    { stage: "Inbound", value: inbound, fill: palette.brand },
    { stage: "Booked", value: booked, fill: palette.green },
    { stage: "Closed won", value: closedWon, fill: palette.green }
  ];

  return (
    <div className="h-64 w-full" role="img" aria-label={`Funnel: ${inbound} inbound, ${booked} booked, ${closedWon} closed won`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 12, right: 24, top: 8, bottom: 8 }}>
          <XAxis type="number" stroke={palette.axis} tick={{ fill: palette.axis, fontSize: 12 }} allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="stage"
            width={90}
            stroke={palette.axis}
            tick={{ fill: palette.axis, fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: palette.grid, opacity: 0.3 }}
            contentStyle={{ borderRadius: 8, border: `1px solid ${palette.grid}`, fontSize: 12 }}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={36}>
            <LabelList dataKey="value" position="right" fill={palette.axis} fontSize={12} />
            {data.map((d) => (
              <Cell key={d.stage} fill={d.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
