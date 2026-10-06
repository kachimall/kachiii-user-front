import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/account/auth-forms";
import { AuthShell } from "@/components/account/auth-shell";

export const metadata: Metadata = { title: "Reset password" };

export default function Page() {
  return (
    <AuthShell title="Reset password" intro="Enter your email and we’ll send you a link to choose a new password.">
      <ForgotPasswordForm />
    </AuthShell>
  );
}
