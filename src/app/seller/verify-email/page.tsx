import type { Metadata } from "next";
import { AuthShell } from "@/components/account/auth-shell";
import { VerifyEmail } from "@/components/account/verify-email";

export const metadata: Metadata = { title: "Verify your email", robots: { index: false } };

// The backend sends a vendor applicant's verification link here (FRONTEND_URL/seller/verify-email).
export default function Page() {
  return (
    <AuthShell title="Verify your email">
      <VerifyEmail seller />
    </AuthShell>
  );
}
