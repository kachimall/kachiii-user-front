import { z } from "zod";
import { looksLikePhone } from "@/lib/schemas/phone";

export const loginSchema = z.object({
  email: z.email("Enter a valid email, like name@example.com"),
  password: z.string().min(1, "Enter your password"),
});

export type LoginValues = z.infer<typeof loginSchema>;

// The backend has the final say (unique email, phone format, password rules).
export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name").max(100),
    email: z.email("Enter a valid email, like name@example.com"),
    phone: z
      .string()
      .trim()
      .refine((v) => !v || looksLikePhone(v), "Enter a valid mobile number, e.g. 050 123 4567")
      .optional(),
    password: z.string().min(8, "Use at least 8 characters"),
    password_confirmation: z.string(),
  })
  .refine((v) => v.password === v.password_confirmation, {
    path: ["password_confirmation"],
    message: "The passwords don’t match",
  });

export type RegisterValues = z.infer<typeof registerSchema>;

export const resetSchema = z
  .object({
    password: z.string().min(8, "Use at least 8 characters"),
    password_confirmation: z.string(),
  })
  .refine((v) => v.password === v.password_confirmation, {
    path: ["password_confirmation"],
    message: "The passwords don’t match",
  });

export type ResetValues = z.infer<typeof resetSchema>;
