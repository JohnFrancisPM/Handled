type StepItem = { number?: number; title: string; body: string };

type StepListProps = { steps: StepItem[] };

// Some content modules embed the number in the title ("1. Check real availability"),
// others carry a separate `number` field. Normalize so the numbered circle is never duplicated.
function parse(step: StepItem, index: number): { num: number; title: string } {
  const match = step.title.match(/^(\d+)\.\s+(.*)$/);
  if (match) {
    return { num: step.number ?? Number(match[1]), title: match[2] ?? step.title };
  }
  return { num: step.number ?? index + 1, title: step.title };
}

export function StepList({ steps }: StepListProps) {
  return (
    <ol className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
      {steps.map((step, index) => {
        const { num, title } = parse(step, index);
        return (
          <li key={step.title} className="flex flex-col gap-3">
            <span
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand type-body-lg font-medium text-white"
              aria-hidden="true"
            >
              {num}
            </span>
            <h3 className="type-h5 text-grey-900">{title}</h3>
            <p className="type-body-lg text-grey-500">{step.body}</p>
          </li>
        );
      })}
    </ol>
  );
}
