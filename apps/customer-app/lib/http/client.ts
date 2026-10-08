import type { ApiResult } from "@/lib/types";

/**
 * Client fetch helpers that unwrap the typed envelope `{ ok, data }|{ ok, error }`
 * (dashboard-api.md). On `ok:false` they throw an Error with the server message
 * so TanStack Query surfaces it to the ErrorCard.
 */

async function unwrap<T>(res: Response): Promise<T> {
  let body: ApiResult<T>;
  try {
    body = (await res.json()) as ApiResult<T>;
  } catch {
    throw new Error("Unexpected response from the server.");
  }
  if (!body.ok) throw new Error(body.error.message);
  return body.data;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path, { headers: { accept: "application/json" } });
  return unwrap<T>(res);
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  return unwrap<T>(res);
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  return unwrap<T>(res);
}
