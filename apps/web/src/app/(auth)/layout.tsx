import "./auth.css";
import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="split" data-slot="auth-layout">
      {/* LEFT — brand */}
      <aside className="left" data-slot="auth-brand">
        <Logo />

        <div className="brand-body">
          <span className="step-eyebrow">// Auth</span>
          <h1>
            Ship your app in <em>five minutes</em>.
          </h1>
          <p>
            Drop raw screenshots, tell us about your app, and download a 9-locale ZIP. No design
            vocabulary required.
          </p>

          <div className="demo">
            <div className="raw" />
            <div className="arr">→</div>
            <div className="out">
              <div className="ot">
                Track your pets <em>without chaos</em>.
              </div>
              <div className="oc" />
            </div>
          </div>
        </div>

        <div className="left-foot">
          <div className="avatars">
            <span className="a">M</span>
            <span className="a">A</span>
            <span className="a">J</span>
            <span className="a">+</span>
          </div>
          <span>1,000+ developers shipping with Shotwise.</span>
        </div>
      </aside>

      {/* RIGHT — form slot */}
      <section className="right" data-slot="auth-right">
        <div className="form-wrap">{children}</div>
      </section>
    </div>
  );
}
