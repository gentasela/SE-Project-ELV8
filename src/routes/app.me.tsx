import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { getCurrentUser, logOut, updateCurrentUser } from "@/lib/auth";
import { calcTargetKcal, regenerateMonthlyPlans } from "@/lib/plan";
import type { UserProfile } from "@/lib/types";
import { DISCIPLINES, LEVELS } from "@/lib/types";

export const Route = createFileRoute("/app/me")({
  head: () => ({
    meta: [
      { title: "Profile — ELV8" },
      { name: "description", content: "Your ELV8 profile and program settings." },
    ],
  }),
  component: MePage,
});

function MePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const load = async () => {
      const u = await getCurrentUser();
      if (!u) {
        navigate({ to: "/login" });
        return;
      }
      setUser(u);
    };
    load();
  }, [navigate]);

  if (!user) return null;

  const disciplineLabel = DISCIPLINES.find((d) => d.id === user.discipline)?.label ?? user.discipline;
  const levelLabel = LEVELS.find((l) => l.id === user.level)?.label ?? user.level;
  const kcal = calcTargetKcal(user);

  return (
    <main className="mx-auto max-w-3xl px-5 pt-10">
      <header>
        <div className="font-sans text-xs uppercase tracking-[0.24em] text-muted-foreground">Profile</div>
        <h1 className="mt-2 font-display text-4xl font-900 text-foreground sm:text-5xl">
          {user.name}
        </h1>
        <p className="mt-1 text-muted-foreground">{user.email}</p>
      </header>

      <section className="mt-8 grid gap-3 sm:grid-cols-2">
        <Row label="Discipline" value={disciplineLabel} />
        <Row label="Level" value={levelLabel} />
        <Row label="Goal" value={user.goal === "lose" ? "Lose weight" : "Gain weight"} />
        <Row label="Target calories" value={`${kcal} kcal/day`} />
        <Row label="Age" value={`${user.age}`} />
        <Row label="Height" value={`${user.heightCm} cm`} />
        <Row label="Weight" value={`${user.weightKg} kg`} />
        
        <div className="rounded-2xl border border-border bg-surface px-5 py-4 flex items-center justify-between col-span-1 sm:col-span-2">
          <div>
            <div className="font-sans text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Notifications & Reminders
            </div>
            <div className="mt-1 font-display text-lg font-700 text-foreground">
              {user.remindersEnabled ? "Daily Reminders Enabled" : "Reminders Muted"}
            </div>
          </div>
          <button
            type="button"
            onClick={async () => {
              const updated = await updateCurrentUser({ remindersEnabled: !user.remindersEnabled });
              if (updated) setUser(updated);
            }}
            className={`rounded-full px-4 py-2 font-sans text-xs font-600 uppercase tracking-wider transition ${
              user.remindersEnabled
                ? "bg-accent-lime text-accent-lime-foreground hover:opacity-90"
                : "border border-border text-muted-foreground hover:border-foreground/40"
            }`}
          >
            {user.remindersEnabled ? "Disable" : "Enable"}
          </button>
        </div>
      </section>

      <section className="mt-10 space-y-3">
        <button
          type="button"
          onClick={async () => {
            await regenerateMonthlyPlans(user);
            navigate({ to: "/app/month" });
          }}
          className="w-full rounded-full border border-border bg-surface px-6 py-4 font-sans text-xs font-600 uppercase tracking-[0.18em] text-foreground transition hover:border-accent-lime/60"
        >
          Restart 30-day program (regenerate Plans 1, 2, 3)
        </button>
        <button
          type="button"
          onClick={async () => {
            await logOut();
            navigate({ to: "/" });
          }}
          className="w-full rounded-full border border-destructive/40 bg-destructive/10 px-6 py-4 font-sans text-xs font-600 uppercase tracking-[0.18em] text-foreground transition hover:border-destructive"
        >
          Log out
        </button>
      </section>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface px-5 py-4">
      <div className="font-sans text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-display text-lg font-700 text-foreground">{value}</div>
    </div>
  );
}
