/**
 * Minimal Request stand-ins. Routes only call request.json() or
 * request.formData(), so these avoid environment-specific fetch quirks
 * (jsdom FormData vs undici Request) while exercising the real route logic.
 */

export function jsonRequest(body: unknown): Request {
  return { json: async () => body } as unknown as Request;
}

export function formRequest(entries: Record<string, unknown>): Request {
  return {
    formData: async () => ({
      get: (key: string) => entries[key] ?? null,
    }),
  } as unknown as Request;
}

export function codedError(message: string, code: string): Error {
  return Object.assign(new Error(message), { code });
}
