import { z } from "zod";
import { looksLikePhone } from "@/lib/schemas/phone";

const emirate = z.enum(["abu_dhabi", "dubai", "sharjah", "ajman", "umm_al_quwain", "ras_al_khaimah", "fujairah"], {
  error: "Choose an emirate",
});

const optional = (max: number) => z.string().trim().max(max).optional();

// Mirrors the backend's SaveAddressRequest. The API normalises and checks the phone: UAE
// numbers, plus Philippine mobiles on a test server, so this only catches a non-number.
export const addressSchema = z.object({
  label: optional(30),
  recipient_name: z.string().trim().min(2, "Enter the recipient’s name").max(100),
  phone: z
    .string()
    .trim()
    .min(1, "Enter a mobile number, e.g. 050 123 4567")
    .refine(looksLikePhone, "Enter a valid mobile number, e.g. 050 123 4567"),
  emirate,
  area: z.string().trim().min(2, "Enter the area, e.g. Al Barsha 1").max(100),
  street: z.string().trim().min(2, "Enter the street").max(150),
  building: z.string().trim().min(1, "Enter the building or villa").max(100),
  unit: optional(50),
  landmark: optional(150),
});

export type AddressValues = z.infer<typeof addressSchema>;
