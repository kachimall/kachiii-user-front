// The payment page is reached by a gateway redirect that only carries the
// payment `reference`, so remember which order each reference belongs to.

const key = (reference: string) => `kachiii-payment:${reference}`;

function referenceOf(redirectUrl: string): string | null {
  try {
    return new URL(redirectUrl).searchParams.get("reference");
  } catch {
    return null;
  }
}

export function rememberPendingPayment(redirectUrl: string, purchaseId: string) {
  const reference = referenceOf(redirectUrl);
  if (!reference) return;
  try {
    sessionStorage.setItem(key(reference), purchaseId);
  } catch {
    // Storage blocked: the payment page falls back to the orders list.
  }
}

export function pendingPurchaseFor(reference: string): string | null {
  try {
    return sessionStorage.getItem(key(reference));
  } catch {
    return null;
  }
}
