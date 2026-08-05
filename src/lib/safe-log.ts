export function safeLog(
  message: string,
  data?: Record<string, string | number | boolean | null | undefined>,
): void {
  if (process.env.NODE_ENV === "production") {
    console.info(message, data ?? {});
    return;
  }
  console.info(message, data ?? {});
}
