import type { Metadata } from "next";
import { ConversationThread } from "@/components/messages/conversation-thread";

export const metadata: Metadata = { title: "Message a store" };

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/** A conversation not started yet: the first message sent here starts it. */
export default async function NewConversationPage({ searchParams }: PageProps<"/account/messages/new">) {
  const params = await searchParams;
  const id = first(params.store);
  const slug = first(params.slug);
  const name = first(params.name);

  return (
    <div className="mx-auto max-w-3xl px-3 pt-3 pb-6 md:px-6 md:pt-6">
      <ConversationThread store={id && slug && name ? { id, slug, name } : undefined} about={first(params.about)} />
    </div>
  );
}
