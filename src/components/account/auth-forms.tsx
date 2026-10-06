"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Field, showApiError } from "@/components/form/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { forgotPassword, login, register, resetPassword } from "@/lib/api/account";
import { ApiError } from "@/lib/api/client";
import {
  loginSchema,
  registerSchema,
  resetSchema,
  type LoginValues,
  type RegisterValues,
  type ResetValues,
} from "@/lib/schemas/auth";
import { startSession } from "@/lib/session";

/** Where to go after signing in: `?next=` when it's a local path, else the account page. */
function useNextPath() {
  const next = useSearchParams().get("next");
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/account";
}

const submitClass = "h-11 rounded-full text-base";

export function LoginForm() {
  const router = useRouter();
  const next = useNextPath();
  const {
    register: field,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginValues) {
    try {
      await startSession(await login(values.email, values.password));
      router.replace(next);
      router.refresh();
    } catch (error) {
      showApiError(error, setError);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <Field label="Email" error={errors.email?.message}>
        <Input type="email" autoComplete="email" {...field("email")} />
      </Field>
      <Field label="Password" error={errors.password?.message}>
        <Input type="password" autoComplete="current-password" {...field("password")} />
      </Field>
      <Link href="/forgot-password" className="self-end text-sm text-primary hover:underline">
        Forgot your password?
      </Link>
      <Button type="submit" disabled={isSubmitting} className={submitClass}>
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        New to Kachi?{" "}
        <Link href={`/register?next=${encodeURIComponent(next)}`} className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const next = useNextPath();
  const {
    register: field,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterValues) {
    try {
      await startSession(await register({ ...values, phone: values.phone || undefined }));
      toast.success("Welcome to Kachi!", { description: "We’ve emailed you a link to verify your address." });
      router.replace(next);
      router.refresh();
    } catch (error) {
      showApiError(error, setError);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <Field label="Full name" error={errors.name?.message}>
        <Input autoComplete="name" {...field("name")} />
      </Field>
      <Field label="Email" error={errors.email?.message}>
        <Input type="email" autoComplete="email" {...field("email")} />
      </Field>
      <Field label="Mobile number (optional)" error={errors.phone?.message} hint="e.g. 050 123 4567">
        <Input type="tel" autoComplete="tel" {...field("phone")} />
      </Field>
      <Field label="Password" error={errors.password?.message}>
        <Input type="password" autoComplete="new-password" {...field("password")} />
      </Field>
      <Field label="Confirm password" error={errors.password_confirmation?.message}>
        <Input type="password" autoComplete="new-password" {...field("password_confirmation")} />
      </Field>
      <Button type="submit" disabled={isSubmitting} className={submitClass}>
        {isSubmitting ? "Creating account…" : "Create account"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const {
    register: field,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<{ email: string }>({ resolver: zodResolver(loginSchema.pick({ email: true })) });

  async function onSubmit({ email }: { email: string }) {
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (error) {
      showApiError(error, setError);
    }
  }

  if (sent) {
    return <p className="text-muted-foreground">If that email has an account, a reset link is on its way. Check your inbox.</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <Field label="Email" error={errors.email?.message}>
        <Input type="email" autoComplete="email" {...field("email")} />
      </Field>
      <Button type="submit" disabled={isSubmitting} className={submitClass}>
        {isSubmitting ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const email = params.get("email") ?? "";
  const {
    register: field,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetValues>({ resolver: zodResolver(resetSchema) });

  async function onSubmit(values: ResetValues) {
    try {
      await resetPassword({ token, email, ...values });
      toast.success("Password changed. Sign in with your new password.");
      router.replace("/login");
    } catch (error) {
      if (error instanceof ApiError && error.field("email")) {
        toast.error(error.field("email"));
        return;
      }
      showApiError(error, setError);
    }
  }

  if (!token || !email) {
    return (
      <p className="text-muted-foreground">
        This reset link is incomplete.{" "}
        <Link href="/forgot-password" className="text-primary hover:underline">
          Request a new one
        </Link>
        .
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">Choose a new password for {email}.</p>
      <Field label="New password" error={errors.password?.message}>
        <Input type="password" autoComplete="new-password" {...field("password")} />
      </Field>
      <Field label="Confirm password" error={errors.password_confirmation?.message}>
        <Input type="password" autoComplete="new-password" {...field("password_confirmation")} />
      </Field>
      <Button type="submit" disabled={isSubmitting} className={submitClass}>
        {isSubmitting ? "Saving…" : "Change password"}
      </Button>
    </form>
  );
}
