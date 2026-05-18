import { Suspense } from "react";
import { AuthForm } from "../auth-form";

export const dynamic = "force-dynamic";

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <AuthForm mode="sign-up" />
    </Suspense>
  );
}
