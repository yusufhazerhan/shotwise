import Link from "next/link";
import "./dashboard.css";
import { requireUser } from "@/lib/auth";
import { getDb, queries } from "@shotwise/db";
import { getBalance } from "@shotwise/credits";

export default async function DashboardPage() {
  const user = await requireUser();
  const db = getDb();
  const [projects, balance, ledger, dbUser] = await Promise.all([
    queries.listProjects(db, user.id),
    getBalance(user.id, db),
    queries.listCreditLedger(db, user.id, 6),
    queries.getUserById(db, user.id),
  ]);

  const firstName = (user.email || "there").split("@")[0]!.split(/[.+_-]/)[0]!;
  const monthlyRefillActive = dbUser?.monthlyRefillActive ?? false;

  return (
    <div data-slot="dashboard">
      <section className="hello" data-slot="dashboard-hello">
        <div>
          <h1>
            Welcome back, <em>{capitalize(firstName)}</em>.
          </h1>
          <p>
            You have <b>{balance} credits</b> on your account
            {monthlyRefillActive
              ? " · monthly refill active"
              : " · activate the starter pack to unlock monthly refills"}.
          </p>
        </div>
        <div className="actions">
          {projects[0] && (
            <Link
              href={`/${projects[0].mode === "wizard" ? "wizard" : "editor"}/${projects[0].id}`}
              className="btn btn-ghost"
            >
              Open last project →
            </Link>
          )}
          <Link href="/wizard/new" className="btn btn-primary">+ New project</Link>
        </div>
      </section>

      {!monthlyRefillActive && (
        <div className="upgrade-strip" data-slot="dashboard-upgrade">
          <div>
            <div className="lab">★ You&apos;re on trial credits</div>
            <h4>Unlock the starter pack — $4.99 for 100 credits + 20 free every month.</h4>
            <p>Pay once. No subscription. Credits never expire while you&apos;re active.</p>
          </div>
          <div className="spacer" />
          <Link
            href="/pricing"
            className="btn btn-ghost btn-sm"
            style={{ borderColor: "rgba(245,239,230,0.2)", color: "var(--cream)" }}
          >
            Compare
          </Link>
          <Link href="/credits" className="btn btn-coral btn-sm">Get starter pack →</Link>
        </div>
      )}

      <section className="stats" data-slot="dashboard-stats">
        <div className="stat">
          <div className="lab">Credits</div>
          <div className="num">{balance}</div>
          <div className="delta">{monthlyRefillActive ? "+20 next month" : "free trial"}</div>
          <div className="icon">◆</div>
        </div>
        <div className="stat">
          <div className="lab">Projects</div>
          <div className="num">{projects.length}</div>
          <div className="delta up">+{Math.min(1, projects.length)} this month</div>
          <div className="icon">⊞</div>
        </div>
        <div className="stat">
          <div className="lab">Recent activity</div>
          <div className="num">{ledger.length}</div>
          <div className="delta">credit transactions</div>
          <div className="icon">≡</div>
        </div>
        <div className="stat">
          <div className="lab">Plan</div>
          <div className="num" style={{ fontSize: 24 }}>{monthlyRefillActive ? "Active" : "Trial"}</div>
          <div className="delta">{monthlyRefillActive ? "monthly refill on" : "starter pack pending"}</div>
          <div className="icon">★</div>
        </div>
      </section>

      <div className="layout" data-slot="dashboard-layout">
        <div>
          <div className="sec-head">
            <h3>Recent projects</h3>
            <span className="count">{projects.length} {projects.length === 1 ? "project" : "projects"}</span>
            <div className="spacer" />
            <Link href="/wizard/new" className="btn btn-ghost btn-sm">+ New</Link>
          </div>

          {projects.length === 0 ? (
            <div className="empty card" data-slot="dashboard-empty">
              <h4>No projects yet.</h4>
              <p>Start with the AI wizard — it&apos;s the fastest way to ship a launch.</p>
              <Link href="/wizard/new" className="btn btn-primary btn-sm">+ Start wizard</Link>
            </div>
          ) : (
            <div className="proj-grid">
              {projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/${p.mode === "wizard" ? "wizard" : "editor"}/${p.id}`}
                  className="proj"
                  data-slot="dashboard-project-card"
                >
                  <div className="thumb">
                    <div className="badge">{p.mode}</div>
                    <div className="stack">
                      <div className="phone" />
                      <div className="phone" />
                      <div className="phone" />
                    </div>
                  </div>
                  <div className="meta">
                    <div className="nm">{p.name}</div>
                    <div className="sb">Updated {new Date(p.updatedAt).toLocaleDateString()}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <aside data-slot="dashboard-activity">
          <div className="sec-head"><h3>Activity</h3></div>
          <div className="activity card">
            {ledger.length === 0 ? (
              <div style={{ padding: 18, color: "var(--ink-mute)", fontSize: 13 }}>
                No activity yet.
              </div>
            ) : (
              ledger.map((row) => (
                <div className="ar" key={row.id}>
                  <div className="dot" data-pos={row.amount > 0 ? "true" : undefined} />
                  <div className="ar-body">
                    <strong style={{ color: row.amount > 0 ? "#1E3A2E" : "var(--coral-2)" }}>
                      {row.amount > 0 ? `+${row.amount}` : row.amount}
                    </strong>{" "}
                    <span className="lb">{row.reason.replace(/_/g, " ")}</span>
                    <div className="t">{new Date(row.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
          <Link
            href="/credits"
            className="btn btn-ghost btn-sm"
            style={{ width: "100%", justifyContent: "center", marginTop: 12 }}
          >
            See all activity →
          </Link>
        </aside>
      </div>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
