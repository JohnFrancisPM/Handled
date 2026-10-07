/* eslint-disable @next/next/no-img-element */
type LogoItem = { name: string; logo?: string };

type LogoCloudProps = { items: LogoItem[]; heading?: string };

export function LogoCloud({ items, heading }: LogoCloudProps) {
  return (
    <div className="flex flex-col gap-6">
      {heading && <h2 className="type-h3 text-grey-900 text-center">{heading}</h2>}
      <div className="flex flex-wrap items-center justify-center gap-6">
        {items.map((item) =>
          item.logo ? (
            <img key={item.name} src={item.logo} alt={item.name} className="h-8 w-auto" />
          ) : (
            <span
              key={item.name}
              className="inline-flex items-center rounded-md bg-grey-50 px-4 py-2 type-body-lg font-medium text-grey-700"
            >
              {item.name}
            </span>
          )
        )}
      </div>
    </div>
  );
}
