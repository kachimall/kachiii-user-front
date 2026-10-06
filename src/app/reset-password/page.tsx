import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/account/auth-forms";
import { AuthShell } from "@/components/account/auth-shell";

export const metadata: Metadata = { title: "Choose a new password" };

export default function Page() {
  return (
    <AuthShell title="Choose a new password">
      <ResetPasswordForm />
    </AuthShell>
  );
}
