import type { Metadata } from "next";
import Link from "next/link";
import { ConversationList } from "@/components/messages/conversation-list";

export const metadata: Metadata = { title: "Messages" };

export default function MessagesPage() {
  return (
    <div className="mx-auto max-w-3xl px-3 pt-3 pb-10 md:px-6 md:pt-6">
      <Link href="/account" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
        ← My account
      </Link>
      <h1 className="mt-3 mb-4 font-heading text-headline-lg-mobile md:text-headline-lg">Messages</h1>
      <ConversationList />
    </div>
  );
}
