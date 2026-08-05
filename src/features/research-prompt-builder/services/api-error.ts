import { NextResponse } from "next/server";
import { createRequestId } from "@/lib/request-id";
import type { ApiError } from "@/features/research-prompt-builder/schemas";

type ErrorCode = ApiError["error"]["code"];

export function toApiError(
  error: unknown,
  fallback: ErrorCode = "INTERNAL_ERROR",
): NextResponse {
  const requestId = createRequestId();
  let code: ErrorCode = fallback;
  let message = "Something went wrong.";

  if (typeof error === "object" && error && "code" in error) {
    const maybe = String((error as { code?: unknown }).code);
    if (
      [
        "INVALID_INPUT",
        "UNSUPPORTED_FILE",
        "FILE_TOO_LARGE",
        "CSV_PARSE_FAILED",
        "DOCUMENT_EXTRACTION_FAILED",
        "MODEL_REFUSAL",
        "MODEL_OUTPUT_INVALID",
        "OPENAI_ERROR",
        "REQUEST_TIMEOUT",
        "INTERNAL_ERROR",
      ].includes(maybe)
    ) {
      code = maybe as ErrorCode;
    }
  }

  if (error instanceof Error && error.message) {
    message = error.message;
  }

  // Never leak stack traces or provider payloads.
  return NextResponse.json(
    {
      error: {
        code,
        message,
        requestId,
      },
    } satisfies ApiError,
    { status: code === "INTERNAL_ERROR" || code === "OPENAI_ERROR" ? 500 : 400 },
  );
}
