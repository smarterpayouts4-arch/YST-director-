import {
  resolveAtomIdentity,
  type ResolveAtomIdentityInput,
  type ResolveAtomIdentityResult,
} from "@/features/content-intelligence/contracts/resolve-atom-identity";

/** Shorts-facing alias — identity logic lives on the Atom contract. */
export type ResolveShortsIdentityInput = ResolveAtomIdentityInput;
export type ResolveShortsIdentityResult = ResolveAtomIdentityResult;

export function resolveShortsIdentity(
  input: ResolveShortsIdentityInput,
): ResolveShortsIdentityResult {
  return resolveAtomIdentity(input);
}
