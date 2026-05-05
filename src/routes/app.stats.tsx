import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { getCurrentUser } from "@/lib/auth";
import { currentProgramDay, dateForDay, ensureMonthlyPlan } from "@/lib/plan";
import { getLog } from "@/lib/progress";
import {
  consistencyScore,
  consumedForDay,
  intensityScore,
} from "@/lib/macros";
import type { MonthlyPlan, UserProfile } from "@/lib/types";

export const Route = createFileRoute("/app/stats")({
  head: () => ({
    meta: [
      { title: "Stats — ELV8" },
      { name: "description", content: "Workout intensity vs nutrition consistency over your 30-day program." },
    ],
  }),
  component: StatsPage,
});

const NEON_GREEN = "oklch(0.88 0.22 130)";
const ELECTRIC_BLUE = "oklch(0.78 0.18 245)";

function StatsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [plan, setPlan] = useState<MonthlyPlan | null>(null);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) { navigate({ to: "/login" }); return; }
    setUser(u);
    setPlan(ensureMonthlyPlan(u));
  }, [navigate]);

  const data = useMemo(() => {
    if (!user || !plan) return [];
    const todayN = currentProgramDay(plan);
    return plan.days.map((d) => {
      const date = dateForDay(plan, d.dayInProgram);
      const log = getLog(user.id, date);
      const isFuture = d.dayInProgram > todayN;
      if (isFuture) {
        return { day: d.dayInProgram, intensity: null, consistency: null };
      }
      const intensity = intensityScore(d.workout, log.workoutDone);
      const consumed = consumedForDay(d, log);
      const consistency = consistencyScore(consumed.calories, d.targetKcal);
      return { day: d.dayInProgram, intensity, consistency };
    });
  }, [user, plan]);

  const stats = useMemo(() => {
    const past = data.filter((d) => d.intensity !== null);
    if (!past.length) return { avgInt: 0, avgCon: 0 };
    const avgInt = Math.round(past.reduce((a, d) => a + (d.intensity ?? 0), 0) / past.length);
    const avgCon = Math.round(past.reduce((a, d) => a + (d.consistency ?? 0), 0) / past.length);
    return { avgInt, avgCon };
  }, [data]);

  if (!user || !plan) return null;

  return (
    <main className="mx-auto max-w-3xl px-5 pt-10">
      <header>
        <div className="font-sans text-xs uppercase tracking-[0.24em] text-muted-foreground">
          Stats · 30-day overlay
        </div>
        <h1 className="mt-2 font-display text-4xl font-900 text-foreground sm:text-5xl">
          Intensity <span className="italic text-accent-lime">×</span> Consistency.
        </h1>
        <p className="mt-1 text-muted-foreground">
          Workout intensity (METs × duration) plotted against how closely you stayed inside your daily macro budget.
        </p>
      </header>

      <section className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="font-sans text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Avg Intensity
          </div>
          <div className="mt-2 font-display text-4xl font-900" style={{ color: NEON_GREEN }}>
            {stats.avgInt}
          </div>
          <div className="text-xs text-muted-foreground">METs-weighted, 0–100</div>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="font-sans text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Avg Consistency
          </div>
          <div className="mt-2 font-display text-4xl font-900" style={{ color: ELECTRIC_BLUE }}>
            {stats.avgCon}
          </div>
          <div className="text-xs text-muted-foreground">Within macro budget, 0–100</div>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-border bg-surface p-4 sm:p-6">
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="oklch(1 0 0 / 0.06)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fill: "oklch(0.78 0.012 260)", fontSize: 11 }}
                axisLine={{ stroke: "oklch(1 0 0 / 0.12)" }}
                tickLine={false}
                label={{ value: "Day", position: "insideBottom", offset: -4, fill: "oklch(0.78 0.012 260)", fontSize: 11 }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "oklch(0.78 0.012 260)", fontSize: 11 }}
                axisLine={{ stroke: "oklch(1 0 0 / 0.12)" }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.19 0.02 260)",
                  border: "1px solid oklch(1 0 0 / 0.14)",
                  borderRadius: 12,
                  color: "white",
                  fontSize: 12,
                }}
                labelFormatter={(d) => `Day ${d}`}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 8, color: "oklch(0.78 0.012 260)" }}
                iconType="plainline"
              />
              <Line
                type="monotone"
                dataKey="intensity"
                name="Intensity (METs)"
                stroke={NEON_GREEN}
                strokeWidth={2.5}
                dot={{ r: 2.5, stroke: NEON_GREEN, fill: NEON_GREEN }}
                activeDot={{ r: 5 }}
                connectNulls={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="consistency"
                name="Consistency (Macros)"
                stroke={ELECTRIC_BLUE}
                strokeWidth={2.5}
                dot={{ r: 2.5, stroke: ELECTRIC_BLUE, fill: ELECTRIC_BLUE }}
                activeDot={{ r: 5 }}
                connectNulls={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Future days are blank until logged. Intensity = METs × hours, capped at 100. Consistency = 100 when consumed kcal is within ±10% of target.
        </p>
      </section>
    </main>
  );
}
