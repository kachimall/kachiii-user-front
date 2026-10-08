import type { Metadata } from "next";
import { ConversationThread } from "@/components/messages/conversation-thread";

export const metadata: Metadata = { title: "Messages" };

// Linked from the "new message" email, so the path must stay /account/messages/{id}.
export default async function ConversationPage({ params }: PageProps<"/account/messages/[id]">) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-3xl px-3 pt-3 pb-6 md:px-6 md:pt-6">
      <ConversationThread id={id} />
    </div>
  );
}
