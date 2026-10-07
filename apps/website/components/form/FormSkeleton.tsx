export function FormSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <div className="h-5 w-32 rounded-sm bg-grey-50" />
          <div className="h-10 w-full rounded-md bg-grey-50" />
        </div>
      ))}
      <div className="h-12 w-full rounded-md bg-grey-50" />
    </div>
  );
}
