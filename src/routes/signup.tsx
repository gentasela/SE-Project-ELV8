import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { signUp } from "@/lib/auth";
import { ensureMonthlyPlan } from "@/lib/plan";
import { DISCIPLINES, LEVELS, type Discipline, type Level, type Goal, type Sex } from "@/lib/types";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — ELV8" },
      { name: "description", content: "Create your ELV8 account and get a personalized 7-day plan." },
    ],
  }),
  component: SignUpPage,
});

type Step = 1 | 2 | 3 | 4 | 5;

function SignUpPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Step 1
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Step 2
  const [name, setName] = useState("");
  // Step 3
  const [age, setAge] = useState<number | "">("");
  const [heightCm, setHeightCm] = useState<number | "">("");
  const [weightKg, setWeightKg] = useState<number | "">("");
  const [sex, setSex] = useState<Sex>("female");
  // Step 4
  const [discipline, setDiscipline] = useState<Discipline | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  // Step 5
  const [goal, setGoal] = useState<Goal | null>(null);

  const total = 5;

  const next = () => {
    setErr(null);
    if (step === 1) {
      if (!email.trim() || password.length < 6) {
        setErr("Enter a valid email and a password of at least 6 characters.");
        return;
      }
    }
    if (step === 2 && !name.trim()) {
      setErr("Enter your preferred name.");
      return;
    }
    if (step === 3) {
      if (!age || !heightCm || !weightKg) {
        setErr("Fill in age, height and weight.");
        return;
      }
    }
    if (step === 4 && (!discipline || !level)) {
      setErr("Pick a discipline and your level.");
      return;
    }
    setStep((s) => (s + 1) as Step);
  };

  const finish = async () => {
    if (!goal || !discipline || !level || !age || !heightCm || !weightKg) return;
    setBusy(true);
    setErr(null);
    try {
      const user = await signUp({
        email,
        password,
        name: name.trim(),
        age: Number(age),
        heightCm: Number(heightCm),
        weightKg: Number(weightKg),
        sex,
        discipline,
        level,
        goal,
      });
      ensureMonthlyPlan(user);
      navigate({ to: "/app/today" });
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-6 py-12 text-foreground">
      <div className="mx-auto max-w-xl">
        <Link to="/" className="font-sans text-xs uppercase tracking-[0.24em] text-muted-foreground hover:text-foreground">
          ← ELV8
        </Link>

        <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-surface">
          <div
            className="h-full rounded-full bg-accent-lime transition-all"
            style={{ width: `${(step / total) * 100}%` }}
          />
        </div>
        <div className="mt-2 font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Step {step} of {total}
        </div>

        <div className="mt-8">
          {step === 1 && (
            <div className="space-y-4">
              <h1 className="font-display text-4xl font-900">Create your account.</h1>
              <p className="text-muted-foreground">Your credentials live in this browser only.</p>
              <Field label="Email" type="email" value={email} onChange={setEmail} required />
              <Field label="Password" type="password" value={password} onChange={setPassword} required hint="At least 6 characters" />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h1 className="font-display text-4xl font-900">What should we call you?</h1>
              <p className="text-muted-foreground">Your preferred name — we'll greet you with it.</p>
              <Field label="Preferred name" value={name} onChange={setName} required />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h1 className="font-display text-4xl font-900">Tell us about you.</h1>
              <p className="text-muted-foreground">We use these to calibrate your calorie target.</p>
              <div className="grid grid-cols-3 gap-3">
                <NumField label="Age" value={age} onChange={setAge} />
                <NumField label="Height (cm)" value={heightCm} onChange={setHeightCm} />
                <NumField label="Weight (kg)" value={weightKg} onChange={setWeightKg} />
              </div>
              <div>
                <span className="font-sans text-xs uppercase tracking-[0.18em] text-muted-foreground">Biological sex (for calorie math)</span>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {(["female", "male", "other"] as Sex[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSex(s)}
                      className={[
                        "rounded-xl border px-3 py-3 font-sans text-sm capitalize transition",
                        sex === s
                          ? "border-accent-lime bg-accent-lime/10 text-foreground"
                          : "border-border bg-surface text-muted-foreground hover:text-foreground",
                      ].join(" ")}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h1 className="font-display text-4xl font-900">Pick your discipline.</h1>
              <div className="grid gap-3 sm:grid-cols-2">
                {DISCIPLINES.map((d) => {
                  const selected = discipline === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDiscipline(d.id)}
                      className={[
                        "rounded-2xl border p-4 text-left transition",
                        selected
                          ? "border-accent-lime ring-1 ring-accent-lime"
                          : "border-border bg-surface hover:border-accent-lime/60",
                      ].join(" ")}
                    >
                      <div className="font-display text-lg font-700 text-foreground">{d.label}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{d.blurb}</div>
                    </button>
                  );
                })}
              </div>

              <h2 className="mt-6 font-display text-2xl font-700">Your level</h2>
              <div className="grid gap-2 sm:grid-cols-3">
                {LEVELS.map((lv) => {
                  const selected = level === lv.id;
                  return (
                    <button
                      key={lv.id}
                      type="button"
                      onClick={() => setLevel(lv.id)}
                      className={[
                        "rounded-xl border px-4 py-3 text-left transition",
                        selected
                          ? "border-accent-lime ring-1 ring-accent-lime"
                          : "border-border bg-surface hover:border-accent-lime/60",
                      ].join(" ")}
                    >
                      <div className="font-600 text-foreground">{lv.label}</div>
                      <div className="text-xs text-muted-foreground">{lv.tagline}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h1 className="font-display text-4xl font-900">What's your goal?</h1>
              <p className="text-muted-foreground">We'll tune your meal calories to match.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    { id: "lose" as Goal, label: "Lose weight", blurb: "Calorie deficit ≈ 500 kcal/day" },
                    { id: "gain" as Goal, label: "Gain weight", blurb: "Calorie surplus ≈ 400 kcal/day" },
                  ]
                ).map((g) => {
                  const selected = goal === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGoal(g.id)}
                      className={[
                        "rounded-2xl border p-5 text-left transition",
                        selected
                          ? "border-accent-lime ring-1 ring-accent-lime"
                          : "border-border bg-surface hover:border-accent-lime/60",
                      ].join(" ")}
                    >
                      <div className="font-display text-xl font-700 text-foreground">{g.label}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{g.blurb}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {err && (
            <div className="mt-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-foreground">
              {err}
            </div>
          )}

          <div className="mt-10 flex justify-between">
            <button
              type="button"
              onClick={() => setStep((s) => (s > 1 ? ((s - 1) as Step) : s))}
              disabled={step === 1}
              className="rounded-full border border-border px-5 py-3 font-sans text-xs font-600 uppercase tracking-[0.18em] text-foreground transition hover:border-accent-lime/60 disabled:opacity-40"
            >
              ← Back
            </button>
            {step < 5 ? (
              <button
                type="button"
                onClick={next}
                className="rounded-full bg-accent-lime px-6 py-3 font-sans text-xs font-600 uppercase tracking-[0.18em] text-accent-lime-foreground"
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                disabled={!goal || busy}
                onClick={finish}
                className="rounded-full bg-accent-lime px-6 py-3 font-sans text-xs font-600 uppercase tracking-[0.18em] text-accent-lime-foreground disabled:opacity-40"
              >
                {busy ? "Building plan…" : "Build my plan →"}
              </button>
            )}
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-600 text-accent-lime hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="font-sans text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-accent-lime focus:outline-none"
      />
      {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | "";
  onChange: (v: number | "") => void;
}) {
  return (
    <label className="block">
      <span className="font-sans text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === "" ? "" : Number(v));
        }}
        className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground focus:border-accent-lime focus:outline-none"
      />
    </label>
  );
}