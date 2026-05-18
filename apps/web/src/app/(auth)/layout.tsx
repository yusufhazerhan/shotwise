export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-slot="auth-layout" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: 380 }}>{children}</div>
    </div>
  );
}
