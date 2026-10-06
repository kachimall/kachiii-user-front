import type { Metadata } from "next";
import { RegisterForm } from "@/components/account/auth-forms";
import { AuthShell } from "@/components/account/auth-shell";

export const metadata: Metadata = { title: "Create account" };

export default function Page() {
  return (
    <AuthShell title="Create account" intro="Shop thousands of products from stores across the UAE.">
      <RegisterForm />
    </AuthShell>
  );
}
