import { PageHeader } from "@/components/dashboard/PageHeader";
import { InboxView } from "@/components/inbox/InboxView";

// Conversation thread (dashboard-pages.md /inbox/[conversationId]). Master/detail.
export default function ConversationThreadPage({
  params
}: {
  params: { conversationId: string };
}) {
  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title="Inbox"
        description="Every customer conversation, with the AI's replies, reasoning, and citations."
      />
      <InboxView selectedId={params.conversationId} />
    </section>
  );
}
