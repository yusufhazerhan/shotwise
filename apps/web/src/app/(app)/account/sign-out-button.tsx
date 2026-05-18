"use client";
import { Button } from "@shotwise/ui-primitives";
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
    <Button variant="danger" onClick={signOut} style={{ marginTop: "0.75rem" }}>
      Sign out
    </Button>
  );
}
