"use client";
import { authClient } from "@shotwise/auth/client";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();
  async function signOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }
  return (
    <button className="btn btn-danger" onClick={signOut}>
      Sign out
    </button>
  );
}
