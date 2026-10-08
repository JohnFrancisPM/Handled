import { NextResponse } from "next/server";
import type { ApiError, ApiErrorCode, ApiResult } from "@/lib/types";

/**
 * Typed envelope helpers (dashboard-api.md). Every handler returns
 * `{ ok:true, data } | { ok:false, error }`. Errors never leak internal detail
 * or the service-role key — only a code + a safe message.
 */

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  unauthorized: 401,
  not_found: 404,
  validation: 422,
  server: 500
};

export function ok<T>(data: T, init?: ResponseInit): NextResponse {
  const body: ApiResult<T> = { ok: true, data };
  return NextResponse.json(body, init);
}

export function fail(
  code: ApiErrorCode,
  message?: string,
  init?: ResponseInit
): NextResponse {
  const error: ApiError = { code, message: message ?? DEFAULT_MESSAGE[code] };
  const body: ApiResult<never> = { ok: false, error };
  return NextResponse.json(body, { status: STATUS_BY_CODE[code], ...init });
}

const DEFAULT_MESSAGE: Record<ApiErrorCode, string> = {
  unauthorized: "Sign in to continue.",
  not_found: "Not found.",
  validation: "The submitted data is invalid.",
  server: "Something went wrong. Please try again."
};
