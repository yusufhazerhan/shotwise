import * as React from "react";
import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="logo" data-slot="logo">
      <span className="logo-mark">S</span>
      shotwise
    </Link>
  );
}
