import type { Metadata } from "next";
import { AuthShell } from "@/components/account/auth-shell";
import { VerifyEmail } from "@/components/account/verify-email";

export const metadata: Metadata = { title: "Verify your email", robots: { index: false } };

export default function Page() {
  return (
    <AuthShell title="Verify your email">
      <VerifyEmail />
    </AuthShell>
  );
}
