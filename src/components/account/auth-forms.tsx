"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm, type FieldValues, type UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Field, showApiError } from "@/components/form/field";
import { useTurnstile } from "@/components/form/turnstile";
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

const ROBOT_CHECK = "Confirm you are not a robot, then try again.";

/**
 * A failed sign-in, sign-up or reset: the bot check's error under the widget, a locked or
 * throttled account (429) or an inactive one (403) as the backend words it above the button,
 * field errors under their fields, anything else as a toast.
 */
function showAuthError<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  onRobotCheck: (message: string) => void,
) {
  if (error instanceof ApiError) {
    const robot = error.field("turnstile_token");
    if (robot) {
      onRobotCheck(robot);
      const rest = Object.fromEntries(Object.entries(error.errors).filter(([key]) => key !== "turnstile_token"));
      if (Object.keys(rest).length === 0) return;
      error = new ApiError(error.message, error.status, rest);
    }
    if (error instanceof ApiError && (error.status === 429 || error.status === 403)) {
      // The per-minute limit answers with Laravel's bare "Too Many Attempts."; the account lockout words its own.
      const generic = error.status === 429 && /^too many attempts\.?$/i.test(error.message);
      setError("root.server", { message: generic ? "Too many sign-in attempts. Wait a minute and try again." : error.message });
      return;
    }
  }
  showApiError(error, setError);
}

function FormAlert({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
      {message}
    </p>
  );
}

export function LoginForm() {
  const router = useRouter();
  const next = useNextPath();
  const {
    register: field,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  const turnstile = useTurnstile();

  async function onSubmit(values: LoginValues) {
    if (turnstile.enabled && !turnstile.token) return turnstile.setError(ROBOT_CHECK);
    try {
      await startSession(await login(values.email, values.password, turnstile.token));
      router.replace(next);
      router.refresh();
    } catch (error) {
      turnstile.reset();
      showAuthError(error, setError, turnstile.setError);
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
      {turnstile.widget}
      <FormAlert message={errors.root?.server?.message} />
      <Button type="submit" disabled={isSubmitting} className={submitClass}>
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        New to Kachiii?{" "}
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
  const turnstile = useTurnstile();

  async function onSubmit(values: RegisterValues) {
    if (turnstile.enabled && !turnstile.token) return turnstile.setError(ROBOT_CHECK);
    try {
      await startSession(
        await register({ ...values, phone: values.phone || undefined, turnstile_token: turnstile.token }),
      );
      toast.success("Welcome to Kachiii!", { description: "We’ve emailed you a link to verify your address." });
      router.replace(next);
      router.refresh();
    } catch (error) {
      turnstile.reset();
      showAuthError(error, setError, turnstile.setError);
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
      {turnstile.widget}
      <FormAlert message={errors.root?.server?.message} />
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
  const turnstile = useTurnstile();

  async function onSubmit({ email }: { email: string }) {
    if (turnstile.enabled && !turnstile.token) return turnstile.setError(ROBOT_CHECK);
    try {
      await forgotPassword(email, turnstile.token);
      setSent(true);
    } catch (error) {
      turnstile.reset();
      showAuthError(error, setError, turnstile.setError);
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
      {turnstile.widget}
      <FormAlert message={errors.root?.server?.message} />
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
