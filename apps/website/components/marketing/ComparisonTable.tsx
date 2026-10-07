import { Check, Minus } from "lucide-react";
import type { ComparisonRow, PriceCompareRow } from "@/content/comparison";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";

type ComparisonTableProps =
  | { variant: "capability"; rows: ComparisonRow[]; colA: string; colB: string }
  | { variant: "pricing"; rows: PriceCompareRow[]; note?: string };

// Renders a boolean/string cell: true → green check, false → grey minus, string → text.
function Cell({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center gap-1 text-green-700">
        <Check size={18} className="text-green-500" aria-hidden="true" />
        <span className="sr-only">Yes</span>
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex items-center gap-1 text-grey-400">
        <Minus size={18} aria-hidden="true" />
        <span className="sr-only">No</span>
      </span>
    );
  }
  return <span className="type-body-lg text-grey-900">{value}</span>;
}

function CapabilityTable({ rows, colA, colB }: { rows: ComparisonRow[]; colA: string; colB: string }) {
  return (
    <>
      {/* Desktop table */}
      <table className="hidden w-full border-collapse md:table">
        <thead>
          <tr className="border-b border-grey-100">
            <th scope="col" className="type-body-lg py-4 pr-4 text-left font-medium text-grey-500">Capability</th>
            <th scope="col" className="type-body-lg rounded-t-lg bg-brand-50 px-4 py-4 text-left font-medium text-brand-700">{colA}</th>
            <th scope="col" className="type-body-lg px-4 py-4 text-left font-medium text-grey-500">{colB}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.capability} className="border-b border-grey-100">
              <th scope="row" className="type-body-lg py-4 pr-4 text-left font-medium text-grey-900">{row.capability}</th>
              <td className="bg-brand-50 px-4 py-4"><Cell value={row.handled} /></td>
              <td className="px-4 py-4"><Cell value={row.receptionist} /></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile cards */}
      <ul className="flex flex-col gap-4 md:hidden">
        {rows.map((row) => (
          <li key={row.capability}>
            <Card className="flex flex-col gap-3">
              <p className="type-body-lg font-medium text-grey-900">{row.capability}</p>
              <div className="flex items-center justify-between gap-4">
                <span className="type-body-sm text-brand-700">{colA}</span>
                <Cell value={row.handled} />
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="type-body-sm text-grey-500">{colB}</span>
                <Cell value={row.receptionist} />
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}

const PRICE_COLS: { key: keyof Pick<PriceCompareRow, "booksIntoFsm" | "officeManagerScope" | "emergencyTriage" | "transparentPricing">; label: string }[] = [
  { key: "booksIntoFsm", label: "Books into FSM" },
  { key: "officeManagerScope", label: "Office-manager scope" },
  { key: "emergencyTriage", label: "Emergency triage" },
  { key: "transparentPricing", label: "Transparent pricing" }
];

function PricingComparison({ rows, note }: { rows: PriceCompareRow[]; note?: string }) {
  return (
    <>
      {/* Desktop table */}
      <table className="hidden w-full border-collapse md:table">
        <thead>
          <tr className="border-b border-grey-100">
            <th scope="col" className="type-body-lg py-4 pr-4 text-left font-medium text-grey-500">Product</th>
            <th scope="col" className="type-body-lg px-4 py-4 text-left font-medium text-grey-500">Price</th>
            {PRICE_COLS.map((col) => (
              <th key={col.key} scope="col" className="type-body-lg px-4 py-4 text-left font-medium text-grey-500">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.product} className={cn("border-b border-grey-100", row.highlight && "bg-brand-50")}>
              <th scope="row" className={cn("type-body-lg py-4 pr-4 text-left font-medium", row.highlight ? "text-brand-700" : "text-grey-900")}>{row.product}</th>
              <td className="type-body-lg px-4 py-4 text-grey-900">{row.price}</td>
              {PRICE_COLS.map((col) => (
                <td key={col.key} className="px-4 py-4"><Cell value={row[col.key]} /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile cards */}
      <ul className="flex flex-col gap-4 md:hidden">
        {rows.map((row) => (
          <li key={row.product}>
            <Card highlight={row.highlight} className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <p className={cn("type-body-lg font-medium", row.highlight ? "text-brand-700" : "text-grey-900")}>{row.product}</p>
                <span className="type-body-lg text-grey-900">{row.price}</span>
              </div>
              {PRICE_COLS.map((col) => (
                <div key={col.key} className="flex items-center justify-between gap-4">
                  <span className="type-body-sm text-grey-500">{col.label}</span>
                  <Cell value={row[col.key]} />
                </div>
              ))}
            </Card>
          </li>
        ))}
      </ul>

      {note && <p className="mt-6 type-body-lg text-grey-500">{note}</p>}
    </>
  );
}

export function ComparisonTable(props: ComparisonTableProps) {
  if (props.variant === "capability") {
    return <CapabilityTable rows={props.rows} colA={props.colA} colB={props.colB} />;
  }
  return <PricingComparison rows={props.rows} note={props.note} />;
}
