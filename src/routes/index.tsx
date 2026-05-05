import { useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { getCurrentUser } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ELV8 — Your 30-day fitness & nutrition program" },
      { name: "description", content: "ELV8 builds you a restrictive 30-day workout and clean-eating nutrition program with 3 plans to choose from." },
      { property: "og:title", content: "ELV8 — Your 30-day fitness & nutrition program" },
      { property: "og:description", content: "Restrictive 30-day plans across 6 disciplines. Three monthly programs per goal — pick your favourite." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    const u = getCurrentUser();
    if (u) navigate({ to: "/app/today" });
  }, [navigate]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(55rem 35rem at 90% -10%, color-mix(in oklab, var(--accent-lime) 22%, transparent), transparent 60%), radial-gradient(40rem 30rem at -10% 110%, color-mix(in oklab, var(--accent-lime) 10%, transparent), transparent 60%)",
        }}
      />

      <nav className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-2xl font-900 tracking-tight text-foreground">
          ELV<span className="text-accent-lime">8</span>
        </span>
        <Link
          to="/login"
          className="font-sans text-xs font-600 uppercase tracking-[0.18em] text-foreground/80 hover:text-foreground"
        >
          Log in
        </Link>
      </nav>

      <section className="relative mx-auto max-w-6xl px-6 pb-24 pt-10 sm:pt-20">
        <p className="font-sans text-xs uppercase tracking-[0.32em] text-muted-foreground">
          30 days · 3 plans · 1 goal
        </p>
        <h1 className="mt-6 font-display text-5xl font-900 leading-[0.98] text-foreground sm:text-7xl">
          Your month, <span className="italic text-accent-lime">engineered</span>.
        </h1>
        <p className="mt-8 max-w-xl text-lg leading-relaxed text-foreground/90">
          A restrictive 30-day workout and clean-eating nutrition program — pick from three monthly versions, follow it, and adapt with weekly progression.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/signup"
            className="rounded-full bg-accent-lime px-7 py-4 font-sans text-sm font-600 uppercase tracking-[0.18em] text-accent-lime-foreground transition hover:-translate-y-0.5"
          >
            Create account →
          </Link>
          <Link
            to="/login"
            className="rounded-full border border-border px-7 py-4 font-sans text-sm font-600 uppercase tracking-[0.18em] text-foreground transition hover:border-accent-lime/60"
          >
            I have an account
          </Link>
        </div>

        <div className="mt-24 grid gap-4 sm:grid-cols-3">
          {[
            { k: "01", t: "Foundation → Peak", d: "Week 1 builds, week 3 peaks, week 4 deloads. Real periodisation." },
            { k: "02", t: "3 plans, your choice", d: "Three different monthly programs per goal. Toggle anytime — progress carries." },
            { k: "03", t: "Personalized Nutrition", d: "Precision-mapped meals that adapt to your daily activity levels and fitness goals." },
          ].map((card) => (
            <div key={card.k} className="rounded-2xl border border-border bg-surface p-6">
              <span className="font-sans text-xs uppercase tracking-[0.24em] text-accent-lime">
                {card.k}
              </span>
              <h3 className="mt-3 font-display text-2xl font-700 text-foreground">{card.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{card.d}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
