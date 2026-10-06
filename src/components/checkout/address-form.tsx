"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, selectClass, showApiError } from "@/components/form/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createAddress, emirates } from "@/lib/api/account";
import type { ApiAddress } from "@/lib/api/schema";
import { addressSchema, type AddressValues } from "@/lib/schemas/checkout";

type Props = {
  token: string;
  defaultName?: string;
  makeDefault?: boolean;
  onSaved: (address: ApiAddress) => void;
  onCancel?: () => void;
};

/** New delivery address. Its own <form>, so it must not be nested inside another form. */
export function AddressForm({ token, defaultName, makeDefault, onSaved, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: { recipient_name: defaultName, emirate: "dubai" },
  });

  async function onSubmit(values: AddressValues) {
    try {
      const address = await createAddress(token, {
        ...values,
        label: values.label || undefined,
        unit: values.unit || undefined,
        landmark: values.landmark || undefined,
        is_default: makeDefault,
      });
      onSaved(address);
    } catch (error) {
      showApiError(error, setError);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 rounded-lg border border-surface-container-highest bg-surface-container-lowest p-4 sm:grid-cols-2">
      <Field label="Recipient name" error={errors.recipient_name?.message}>
        <Input autoComplete="name" {...register("recipient_name")} />
      </Field>
      <Field label="Mobile number" error={errors.phone?.message}>
        <Input type="tel" autoComplete="tel" placeholder="050 123 4567" {...register("phone")} />
      </Field>
      <Field label="Emirate" error={errors.emirate?.message}>
        <select className={selectClass} {...register("emirate")}>
          {emirates.map((e) => (
            <option key={e.value} value={e.value}>
              {e.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Area" error={errors.area?.message}>
        <Input placeholder="Al Barsha 1" {...register("area")} />
      </Field>
      <Field label="Street" error={errors.street?.message}>
        <Input autoComplete="address-line1" {...register("street")} />
      </Field>
      <Field label="Building or villa" error={errors.building?.message}>
        <Input {...register("building")} />
      </Field>
      <Field label="Apartment / unit (optional)" error={errors.unit?.message}>
        <Input autoComplete="address-line2" {...register("unit")} />
      </Field>
      <Field label="Label (optional)" error={errors.label?.message}>
        <Input placeholder="Home, Office…" {...register("label")} />
      </Field>
      <Field label="Landmark (optional)" error={errors.landmark?.message} className="sm:col-span-2">
        <Input placeholder="Near the metro station, blue gate…" {...register("landmark")} />
      </Field>
      <div className="flex gap-3 sm:col-span-2">
        <Button type="submit" disabled={isSubmitting} className="h-10 rounded-full px-5">
          {isSubmitting ? "Saving…" : "Save address"}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} className="h-10 rounded-full px-5">
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

export function formatAddress(a: Pick<ApiAddress, "building" | "unit" | "street" | "area" | "emirate">) {
  const emirate = emirates.find((e) => e.value === a.emirate)?.label ?? a.emirate;
  return [a.unit, a.building, a.street, a.area, emirate].filter(Boolean).join(", ");
}
