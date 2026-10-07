import { api, apiRequest } from "@/lib/api/client";
import type {
  ApiAddress,
  ApiAuthResult,
  ApiCart,
  ApiCheckoutPreview,
  ApiPaymentMethod,
  ApiPurchase,
  ApiReturn,
  ApiReturnReason,
  ApiUser,
  Emirate,
} from "@/lib/api/schema";

// Signed-in shopper endpoints. Every call takes the bearer token from the auth store.

const DEVICE = "kachi-storefront";

export function login(email: string, password: string) {
  return api<ApiAuthResult>("/auth/login", { method: "POST", body: { email, password, device_name: DEVICE } });
}

export type RegisterInput = {
  name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
};

export function register(input: RegisterInput) {
  return api<ApiAuthResult>("/auth/register", { method: "POST", body: { ...input, device_name: DEVICE } });
}

export function logout(token: string) {
  return api<null>("/auth/logout", { method: "POST", token });
}

export function getMe(token: string) {
  return api<ApiUser>("/auth/me", { token });
}

export function resendVerification(token: string) {
  return api<null>("/auth/email/verification-notification", { method: "POST", token });
}

export function forgotPassword(email: string) {
  return api<null>("/auth/forgot-password", { method: "POST", body: { email } });
}

export function resetPassword(body: { token: string; email: string; password: string; password_confirmation: string }) {
  return api<null>("/auth/reset-password", { method: "POST", body });
}

// Cart — every mutation answers with the whole cart.

export function getCart(token: string) {
  return api<ApiCart>("/cart", { token });
}

export function addCartItem(token: string, variantId: string, quantity: number) {
  return api<ApiCart>("/cart/items", { method: "POST", token, body: { variant_id: variantId, quantity } });
}

export function updateCartItem(token: string, lineId: string, quantity: number) {
  return api<ApiCart>(`/cart/items/${lineId}`, { method: "PATCH", token, body: { quantity } });
}

export function removeCartItem(token: string, lineId: string) {
  return api<ApiCart>(`/cart/items/${lineId}`, { method: "DELETE", token });
}

// Addresses

export const emirates: { value: Emirate; label: string }[] = [
  { value: "abu_dhabi", label: "Abu Dhabi" },
  { value: "dubai", label: "Dubai" },
  { value: "sharjah", label: "Sharjah" },
  { value: "ajman", label: "Ajman" },
  { value: "umm_al_quwain", label: "Umm Al Quwain" },
  { value: "ras_al_khaimah", label: "Ras Al Khaimah" },
  { value: "fujairah", label: "Fujairah" },
];

export type AddressInput = Omit<ApiAddress, "id" | "label" | "unit" | "landmark" | "is_default"> & {
  label?: string;
  unit?: string;
  landmark?: string;
  is_default?: boolean;
};

export function getAddresses(token: string) {
  return api<ApiAddress[]>("/account/addresses", { token });
}

export function createAddress(token: string, input: AddressInput) {
  return api<ApiAddress>("/account/addresses", { method: "POST", token, body: input });
}

// Checkout

export type CheckoutInput = {
  address_id: string;
  shipping?: Record<string, string>;
  voucher_code?: string;
};

export function previewCheckout(token: string, input: CheckoutInput) {
  return api<ApiCheckoutPreview>("/checkout/preview", { method: "POST", token, body: input });
}

export function placeOrder(
  token: string,
  input: CheckoutInput & { payment_method: ApiPaymentMethod; expected_total: string },
  idempotencyKey: string,
) {
  return api<ApiPurchase>("/checkout", {
    method: "POST",
    token,
    body: input,
    headers: { "Idempotency-Key": idempotencyKey },
  });
}

// Orders

export function getPurchases(token: string, page = 1) {
  return apiRequest<ApiPurchase[]>("/purchases", { token, query: { page, per_page: 10 } });
}

export function getPurchase(token: string, id: string) {
  return api<ApiPurchase>(`/purchases/${id}`, { token });
}

export function cancelPurchase(token: string, id: string) {
  return api<ApiPurchase>(`/purchases/${id}/cancel`, { method: "POST", token, body: {} });
}

export function retryPayment(token: string, id: string) {
  return api<ApiPurchase>(`/purchases/${id}/payments`, { method: "POST", token });
}

/** Dev-only stand-in for the payment gateway (backend NOQODI_DRIVER=mock). */
export function completeMockPayment(token: string, id: string, outcome: "paid" | "failed") {
  return api<ApiPurchase>(`/purchases/${id}/payments/mock`, { method: "POST", token, body: { outcome } });
}

// Returns: delivered items of one store's package, within the days after delivery.

export const returnReasons: { value: ApiReturnReason; label: string }[] = [
  { value: "damaged", label: "Arrived damaged" },
  { value: "defective", label: "Does not work" },
  { value: "wrong_item", label: "Wrong item, size or colour" },
  { value: "not_as_described", label: "Not as described" },
  { value: "missing_parts", label: "Parts or accessories missing" },
  { value: "other", label: "Another reason" },
];

export type ReturnInput = {
  items: { id: string; quantity: number }[];
  reason: ApiReturnReason;
  details?: string;
  photos: File[];
};

export function getOrderReturns(token: string, orderId: string) {
  return api<ApiReturn[]>("/returns", { token, query: { order_id: orderId, per_page: 50 } });
}

/** Sent as multipart form data, for the photos. */
export function requestReturn(token: string, orderId: string, input: ReturnInput) {
  const body = new FormData();
  input.items.forEach((item, i) => {
    body.append(`items[${i}][id]`, item.id);
    body.append(`items[${i}][quantity]`, String(item.quantity));
  });
  body.append("reason", input.reason);
  if (input.details) body.append("details", input.details);
  input.photos.forEach((photo) => body.append("photos[]", photo));
  return api<ApiReturn>(`/purchases/${orderId}/returns`, { method: "POST", token, body });
}

/** Asks KACHIII to review the store's rejection; KACHIII's decision is final. */
export function escalateReturn(token: string, id: string, reason?: string) {
  return api<ApiReturn>(`/returns/${id}/escalate`, { method: "POST", token, body: { reason } });
}

export function withdrawReturn(token: string, id: string) {
  return api<ApiReturn>(`/returns/${id}/withdraw`, { method: "POST", token, body: {} });
}
