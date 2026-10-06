import type { Metadata } from "next";
import { LoginForm } from "@/components/account/auth-forms";
import { AuthShell } from "@/components/account/auth-shell";

export const metadata: Metadata = { title: "Sign in" };

export default function Page() {
  return (
    <AuthShell title="Sign in" intro="Welcome back. Sign in to see your cart and orders.">
      <LoginForm />
    </AuthShell>
  );
}
