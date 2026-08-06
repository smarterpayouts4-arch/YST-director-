export type RetentionPolicy = {
  /** Browser localStorage project retention guidance (client-owned). */
  localProjectDays: number;
  /** In-memory AI traces (process lifetime / ring buffer). */
  inMemoryTraceCount: number;
  /** Never persist raw OpenAI API keys or full CSV dumps in traces. */
  forbidSecretsInTraces: true;
  /** Server keeps evidence packets only for the request lifetime. */
  evidencePacketServerLifetime: "request";
};

export function getRetentionPolicy(): RetentionPolicy {
  return {
    localProjectDays: 90,
    inMemoryTraceCount: 200,
    forbidSecretsInTraces: true,
    evidencePacketServerLifetime: "request",
  };
}
