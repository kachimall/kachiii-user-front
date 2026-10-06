import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

export function Field({
  label,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactElement;
}) {
  return (
    <Label className={cn("flex flex-col items-stretch gap-1.5 font-normal", className)}>
      <span className="text-sm font-medium">{label}</span>
      <span className="contents [&_input]:h-11 [&_input]:bg-card [&_select]:bg-card [&_textarea]:bg-card">{children}</span>
      {hint && !error && <span className="text-xs text-muted-foreground">{hint}</span>}
      {error && (
        <span role="alert" className="text-sm text-destructive">
          {error}
        </span>
      )}
    </Label>
  );
}

export const selectClass =
  "h-11 w-full rounded-lg border border-input px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

/**
 * Shows a failed request on the form: validation errors under their fields
 * (`fields` maps API field names to form field names), anything else as a toast.
 */
export function showApiError<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: Partial<Record<string, Path<T>>> = {},
) {
  if (error instanceof ApiError && error.status === 422) {
    let shown = false;
    for (const [apiField, messages] of Object.entries(error.errors)) {
      const name = fields[apiField] ?? (apiField as Path<T>);
      setError(name, { message: messages[0] });
      shown = true;
    }
    if (shown) return;
  }
  toast.error(error instanceof ApiError ? error.message : "Something went wrong. Try again.");
}
