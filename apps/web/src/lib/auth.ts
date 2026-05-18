/**
 * Server-side auth helpers used by API routes and server components.
 */
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "@shotwise/auth";

export async function getSession() {
  const auth = getAuth();
  return auth.api.getSession({ headers: await headers() });
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }
  return user;
}

/** For API routes — returns null instead of redirecting. */
export async function requireUserOrNull() {
  return getCurrentUser();
}
