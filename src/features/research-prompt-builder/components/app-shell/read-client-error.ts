export async function readClientError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return data?.error?.message || `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}
