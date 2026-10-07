# Spec: Legal Pages — Privacy & Terms

**App:** `apps/website`
**Implements:** R26, R27, R39
**Depends on:** `components.md`, `seo.md`
**Routes:** `/privacy` (`app/privacy/page.tsx`), `/terms` (`app/terms/page.tsx`) — Server Components, statically generated.

Static legal content covering lead-data handling (the only PII the site collects), consent, retention, and cookie posture. Content derives from ED §7 (privacy / data-lifecycle). These are marketing-site legal pages, not product T&Cs for the customer app.

> Copy below is launch-ready boilerplate tailored to what the site actually does (collects demo-request leads, no tracking). A lawyer should review before public launch (PRD open question flags legal review) — add a comment to that effect in each file.

---

## 1. Privacy Policy (`/privacy`) — R27

Render as a readable long-form article: `Hero as="h1"` ("Privacy Policy") + a `Container` of prose using `type-body-lg` / `type-h5` section headings. Include a "Last updated: {date}" line.

Required sections (content):

1. **What we collect.** When you submit the "Book a demo" form we collect the information you provide: your name, business name, email, and optionally phone number, trade, weekly call volume, plan interest, and message. We also record the page you submitted from and your browser's user-agent for coarse attribution. We do not collect any other personal information through this website.
2. **Why we collect it.** Solely to contact you about Handled and respond to your demo request. We do not sell or share your information with third parties for advertising.
3. **Consent.** We collect this information only when you actively submit the form. By submitting, you agree to be contacted about Handled (this consent line also appears on the form — R26).
4. **How it's stored & protected.** Submissions are transmitted over HTTPS and stored encrypted at rest in our database (Supabase/Postgres). Access is restricted to our team via a server-side service role; the browser never has direct database access.
5. **Cookies & tracking.** This website uses no non-essential cookies and no third-party advertising or analytics trackers (R39). Any cookies are strictly functional.
6. **Data retention.** We keep demo-request data only as long as needed to evaluate and follow up on your interest, and we periodically purge non-converted leads (target: within 24 months). You may request deletion at any time (see Contact).
7. **Your choices / contact.** To access, correct, or delete your information, email `hello@handled.ai`.
8. **Children.** The site and product are not directed to children under 13.
9. **Changes.** We may update this policy; the "Last updated" date reflects the latest version.

### Metadata
```ts
export const metadata = pageMetadata({
  title: "Privacy Policy — Handled",
  description: "How Handled collects, uses, and protects the information you submit through our website.",
  path: "/privacy",
  noindex: false
});
```

---

## 2. Terms of Service (`/terms`)

Render same layout. Include "Last updated: {date}".

Required sections (content):

1. **Acceptance.** By using this website you agree to these terms.
2. **Use of the site.** The site is provided for informational and marketing purposes. Don't misuse it, attempt to disrupt it, or submit unlawful content through the form.
3. **No warranty / informational content.** Information on the site (including pricing, features, stats, and roadmap items) is provided "as is" and may change. Pricing and feature availability are subject to change; roadmap items are not guarantees.
4. **Lead submissions.** Information you submit is handled per the Privacy Policy. Submitting the form does not create a contract or obligate either party.
5. **Intellectual property.** The Handled name, content, and design are owned by Handled. Don't copy or reuse them without permission.
6. **Third-party references.** Competitor names and prices referenced on the site (e.g., in comparisons) belong to their respective owners and are cited for comparison as of the stated date; they may change.
7. **Limitation of liability.** To the extent permitted by law, Handled is not liable for indirect or consequential damages arising from use of the site.
8. **Contact.** Questions: `hello@handled.ai`.

### Metadata
```ts
export const metadata = pageMetadata({
  title: "Terms of Service — Handled",
  description: "The terms that govern your use of the Handled website.",
  path: "/terms"
});
```

---

## 3. Acceptance criteria
- Both pages render with one `<h1>` each and reachable from the footer (R5) on every page.
- Privacy page covers: what/why collected, consent, storage/protection, cookies (none non-essential), retention (~24 months target), deletion/contact (R27).
- Privacy consent framing matches the form's consent line and privacy link (R26).
- Terms page notes pricing/roadmap may change and that competitor references are cited for comparison (keeps the comparison tables defensible).
- Each file carries a code comment that the copy is boilerplate pending legal review.
- Both pages are statically generated and indexable.
