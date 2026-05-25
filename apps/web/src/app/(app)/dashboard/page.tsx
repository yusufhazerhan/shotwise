import * as React from "react";
import Link from "next/link";
import "./dashboard.css";
import { requireUser } from "@/lib/auth";
import { getDb, queries } from "@shotwise/db";
import type { CreditLedgerRow, Project } from "@shotwise/db";
import { getBalance, hasLifetimeAccess } from "@shotwise/credits";

export default async function DashboardPage() {
  const user = await requireUser();
  const db = getDb();
  const [projectsResult, balance, ledgerResult, dbUser, lifetimeResult] = await Promise.all([
    queries.listProjects(db, user.id),
    getBalance(user.id, db),
    queries.listCreditLedger(db, user.id, 6),
    queries.getUserById(db, user.id),
    hasLifetimeAccess(user.id, db),
  ]);
  const projects = projectsResult as Project[];
  const ledger = ledgerResult as CreditLedgerRow[];

  const firstName = (user.email || "there").split("@")[0]!.split(/[.+_-]/)[0]!;
  const lifetimeActive = lifetimeResult || (dbUser?.monthlyRefillActive ?? false);

  return (
    <div data-slot="dashboard">
      <section className="hello" data-slot="dashboard-hello">
        <div>
          <h1>
            Welcome back, <em>{capitalize(firstName)}</em>.
          </h1>
          <p>
            You have <b>{balance} credits</b> on your account
            {lifetimeActive
              ? " · lifetime unlocked"
              : " · server mode is optional"}.
          </p>
        </div>
        <div className="actions">
          {projects[0] && (
            <Link
              href={`/editor/${projects[0].id}`}
              className="btn btn-ghost"
            >
              Open last project →
            </Link>
          )}
          <Link href="/studio" className="btn btn-primary">Open local Studio</Link>
        </div>
      </section>

      {!lifetimeActive && (
        <div className="upgrade-strip" data-slot="dashboard-upgrade">
          <div>
            <div className="lab">Hosted convenience</div>
            <h4>Local Studio is free. Hosted export credits are optional.</h4>
            <p>Use server mode only when you want account-backed storage and hosted rendering.</p>
          </div>
          <div className="spacer" />
          <Link
            href="/pricing"
            className="btn btn-ghost btn-sm"
            style={{ borderColor: "rgba(245,239,230,0.2)", color: "var(--cream)" }}
          >
            Compare
          </Link>
          <Link href="/studio" className="btn btn-coral btn-sm">Use Local Studio →</Link>
        </div>
      )}

      <section className="stats" data-slot="dashboard-stats">
        <div className="stat">
          <div className="lab">Credits</div>
          <div className="num">{balance}</div>
          <div className="delta">{lifetimeActive ? "lifetime" : "hosted only"}</div>
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
          <div className="num" style={{ fontSize: 24 }}>{lifetimeActive ? "Lifetime" : "Free"}</div>
          <div className="delta">{lifetimeActive ? "unlocked" : "upgrade optional"}</div>
          <div className="icon">★</div>
        </div>
      </section>

      <div className="layout" data-slot="dashboard-layout">
        <div>
          <div className="sec-head">
            <h3>Recent projects</h3>
            <span className="count">{projects.length} {projects.length === 1 ? "project" : "projects"}</span>
            <div className="spacer" />
            <Link href="/studio" className="btn btn-ghost btn-sm">Start from template</Link>
          </div>

          {projects.length === 0 ? (
            <div className="empty card" data-slot="dashboard-empty">
              <h4>No projects yet.</h4>
              <p>Start locally from a template, then add server sync only when you need it.</p>
              <Link href="/studio" className="btn btn-primary btn-sm">Choose template</Link>
            </div>
          ) : (
            <div className="proj-grid">
              {projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/editor/${p.id}`}
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
            href="/studio"
            className="btn btn-ghost btn-sm"
            style={{ width: "100%", justifyContent: "center", marginTop: 12 }}
          >
            Open local Studio →
          </Link>
        </aside>
      </div>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
