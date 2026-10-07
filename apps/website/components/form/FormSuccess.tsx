import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export function FormSuccess() {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-green-500 bg-green-50 p-6">
      <CheckCircle2 size={32} className="text-green-500" aria-hidden="true" />
      <h2 className="type-h5 text-green-700">Thanks — we&apos;ll reach out within 1 business day.</h2>
      <p className="type-body-lg text-grey-900">
        In the meantime, explore{" "}
        <Link href="/features" className="text-brand underline hover:text-brand-600">
          what Handled does
        </Link>{" "}
        or{" "}
        <Link href="/" className="text-brand underline hover:text-brand-600">
          return home
        </Link>
        .
      </p>
    </div>
  );
}
