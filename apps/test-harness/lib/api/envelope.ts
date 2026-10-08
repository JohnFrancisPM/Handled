import { NextResponse } from "next/server";
import type { ApiError, ApiErrorCode, ApiResult } from "@/lib/types";

/**
 * Typed envelope helpers (webhook-proxy.md §2). Every handler returns
 * `{ ok:true, data } | { ok:false, error }`. OUR routes return HTTP 200 for every
 * "expected" failure (webhook down, bad secret, unknown customer) so the browser's
 * fetch never rejects — the client branches on `body.ok`. Only bad input to us
 * (validation) → 422 and unexpected faults (server) → 500.
 */
const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  validation: 422,
  not_found: 200, // soft: rendered as an in-thread error, not a crash
  unauthorized: 200, // soft: webhook misconfig feedback
  unknown_business: 200, // soft
  webhook_unavailable: 200, // soft
  server: 500
};

const DEFAULT_MESSAGE: Record<ApiErrorCode, string> = {
  validation: "The message is invalid.",
  not_found: "That customer could not be found.",
  unauthorized: "Acme's assistant rejected the request — check N8N_WEBHOOK_SECRET.",
  unknown_business: "Acme's assistant could not resolve the business — check ACME_BUSINESS_ID.",
  webhook_unavailable: "Acme's assistant is unavailable — check N8N_WEBHOOK_URL.",
  server: "Something went wrong. Please try again."
};

export function ok<T>(data: T, init?: ResponseInit): NextResponse {
  const body: ApiResult<T> = { ok: true, data };
  return NextResponse.json(body, init);
}

export function fail(code: ApiErrorCode, message?: string): NextResponse {
  const error: ApiError = { code, message: message ?? DEFAULT_MESSAGE[code] };
  const body: ApiResult<never> = { ok: false, error };
  return NextResponse.json(body, { status: STATUS_BY_CODE[code] });
}
