import type { Metadata } from "next";
import { AccountOverview } from "@/components/account/account-overview";

export const metadata: Metadata = { title: "My account" };

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-7xl px-3 pt-3 md:px-6 md:pt-6 pb-10">
      <h1 className="mb-3 font-heading text-headline-lg-mobile md:text-headline-lg md:mb-4">My account</h1>
      <AccountOverview />
    </div>
  );
}
