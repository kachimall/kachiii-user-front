import type { Metadata } from "next";
import { AccountOverview } from "@/components/account/account-overview";

export const metadata: Metadata = { title: "My account" };

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 pb-16 sm:px-6">
      <h1 className="mb-8 font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">My account</h1>
      <AccountOverview />
    </div>
  );
}
