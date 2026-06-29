import { ApiError } from "@/shared/lib/http/api-error";

type ApiClientOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string;
};

const normalizeBaseUrl = (baseUrl: string) => baseUrl.replace(/\/$/, "");

const isAbsoluteUrl = (value: string) => /^https?:\/\//.test(value);

const getApiBaseUrl = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "/api";

  if (typeof window !== "undefined" || isAbsoluteUrl(baseUrl)) {
    return normalizeBaseUrl(baseUrl);
  }

  const { headers } = await import("next/headers");
  const requestHeaders = await headers();
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");

  if (!host) {
    throw new Error("Missing host header while building server API URL.");
  }

  return `${protocol}://${host}${normalizeBaseUrl(baseUrl)}`;
};

const buildUrl = async (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${await getApiBaseUrl()}${normalizedPath}`;
};

const buildHeaders = (options: ApiClientOptions) => {
  const headers = new Headers(options.headers);

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (options.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  return headers;
};

async function request<T>(
  path: string,
  options: ApiClientOptions = {},
): Promise<T> {
  const response = await fetch(await buildUrl(path), {
    ...options,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    headers: buildHeaders(options),
    cache: options.cache ?? "no-store",
  });

  if (!response.ok) {
    throw await ApiError.fromResponse(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const apiClient = {
  get: <T>(path: string, options?: ApiClientOptions) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, options?: ApiClientOptions) =>
    request<T>(path, { ...options, method: "POST" }),
  put: <T>(path: string, options?: ApiClientOptions) =>
    request<T>(path, { ...options, method: "PUT" }),
};
