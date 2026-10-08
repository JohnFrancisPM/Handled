import { PageHeader } from "@/components/dashboard/PageHeader";
import { InboxView } from "@/components/inbox/InboxView";

// Inbox (dashboard-pages.md /inbox, notepad CE8, Flow I).
export default function InboxPage() {
  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title="Inbox"
        description="Every customer conversation, with the AI's replies, reasoning, and citations."
      />
      <InboxView selectedId={null} />
    </section>
  );
}
