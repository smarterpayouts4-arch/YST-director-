import { NextResponse } from "next/server";
import { createRequestId } from "@/lib/request-id";

export type CiApiErrorCode =
  | "INVALID_INPUT"
  | "FILE_TOO_LARGE"
  | "MODEL_OUTPUT_INVALID"
  | "OPENAI_ERROR"
  | "INTERNAL_ERROR";

export function toCiApiError(
  error: unknown,
  fallback: CiApiErrorCode = "INTERNAL_ERROR",
): NextResponse {
  const requestId = createRequestId();
  let code: CiApiErrorCode = fallback;
  let message = "Something went wrong.";

  if (typeof error === "object" && error && "code" in error) {
    const maybe = String((error as { code?: unknown }).code);
    if (
      (
        [
          "INVALID_INPUT",
          "FILE_TOO_LARGE",
          "MODEL_OUTPUT_INVALID",
          "OPENAI_ERROR",
          "INTERNAL_ERROR",
        ] as string[]
      ).includes(maybe)
    ) {
      code = maybe as CiApiErrorCode;
    }
  }

  if (error instanceof Error && error.message) {
    message = error.message;
  }

  return NextResponse.json(
    {
      error: {
        code,
        message,
        requestId,
      },
    },
    { status: code === "INTERNAL_ERROR" || code === "OPENAI_ERROR" ? 500 : 400 },
  );
}
