import Link from "next/link";
import { site } from "@/content/site";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { MobileNav } from "@/components/layout/MobileNav";
import { NavLinks } from "@/components/layout/NavLinks";

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-grey-100 bg-white/90 backdrop-blur">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="type-h5 font-semibold text-grey-900">
            {site.name}
          </Link>

          <NavLinks />

          <div className="hidden items-center gap-3 md:flex">
            <Button href={site.loginCta.href} variant="secondary">
              {site.loginCta.label}
            </Button>
            <Button href={site.primaryCta.href}>{site.primaryCta.label}</Button>
          </div>

          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
