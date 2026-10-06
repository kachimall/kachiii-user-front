// Thin fetch wrapper for the KACHI shop API (Laravel, Sanctum bearer tokens).
// Every response uses one envelope: { success, message, data, meta } on success,
// { success: false, message, errors } on failure.

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

const apiOrigin = new URL(API_URL).origin;

/**
 * Backend images (products, categories) are already resized WebP, and the
 * image optimizer refuses localhost origins, so they skip optimization.
 */
export const isApiImage = (src: string) => src.startsWith(apiOrigin);

export type ApiMeta = {
  current_page?: number;
  per_page?: number;
  has_more?: boolean;
  total?: number;
  last_page?: number;
  next_cursor?: string | null;
  prev_cursor?: string | null;
  fuzzy?: boolean;
};

type Envelope<T> = { success: true; message: string; data: T; meta: ApiMeta };

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly errors: Record<string, string[]> = {},
  ) {
    super(message);
    this.name = "ApiError";
  }

  /** First message for a field, for showing under a form input. */
  field(name: string): string | undefined {
    return this.errors[name]?.[0];
  }
}

type Query = Record<string, string | number | boolean | undefined | null | string[]>;

export type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Query;
  token?: string | null;
  headers?: Record<string, string>;
  /** Server-side caching for catalog reads; ignored in the browser. */
  revalidate?: number | false;
  signal?: AbortSignal;
};

function buildUrl(path: string, query?: Query) {
  const url = new URL(`${API_URL}${path}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) value.forEach((v) => url.searchParams.append(`${key}[]`, v));
    else url.searchParams.set(key, String(value));
  }
  return url;
}

/** Calls the API and returns the whole envelope (use when you need `meta`). */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<Envelope<T>> {
  const { method = "GET", body, query, token, headers, revalidate, signal } = options;

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      signal,
      headers: {
        Accept: "application/json",
        ...(body !== undefined && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...(method === "GET" && revalidate !== undefined
        ? { next: { revalidate } }
        : { cache: "no-store" as const }),
    });
  } catch {
    throw new ApiError("Can’t reach the Kachi servers. Check your connection and try again.", 0);
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.success) {
    throw new ApiError(
      payload?.message ?? `Request failed (${response.status}).`,
      response.status,
      payload?.errors ?? {},
    );
  }
  return payload as Envelope<T>;
}

/** Calls the API and returns just `data`. */
export async function api<T>(path: string, options?: RequestOptions): Promise<T> {
  return (await apiRequest<T>(path, options)).data;
}
