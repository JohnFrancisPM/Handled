import Link from "next/link";
import { footerNav } from "@/content/nav";
import { site } from "@/content/site";
import { Container } from "@/components/ui/Container";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-grey-100 bg-grey-25">
      <Container>
        <div className="grid grid-cols-2 gap-8 py-16 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <span className="type-h5 font-semibold text-grey-900">{site.name}</span>
            <p className="mt-3 type-body-sm text-grey-500">{site.tagline}</p>
          </div>

          {footerNav.map((group) => (
            <div key={group.heading}>
              <h2 className="type-body-sm font-medium uppercase tracking-wide text-grey-400">
                {group.heading}
              </h2>
              <ul className="mt-4 flex flex-col gap-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="type-body-lg text-grey-500 hover:text-grey-900"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-grey-100 py-6 type-body-sm text-grey-400">
          © {year} {site.name}. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}
