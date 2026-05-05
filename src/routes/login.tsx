import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { logIn } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — ELV8" },
      { name: "description", content: "Log in to your ELV8 account to see today's plan." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await logIn(email, password);
      navigate({ to: "/app/today" });
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16 text-foreground">
      <div className="w-full max-w-md">
        <Link to="/" className="font-sans text-xs uppercase tracking-[0.24em] text-muted-foreground hover:text-foreground">
          ← ELV8
        </Link>
        <h1 className="mt-6 font-display text-4xl font-900 text-foreground">Welcome back.</h1>
        <p className="mt-2 text-muted-foreground">Log in to see today's plan.</p>

        <form onSubmit={submit} className="mt-10 space-y-4">
          <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" required />
          <Field label="Password" type="password" value={password} onChange={setPassword} autoComplete="current-password" required />

          {err && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-foreground">
              {err}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-accent-lime px-6 py-4 font-sans text-sm font-600 uppercase tracking-[0.18em] text-accent-lime-foreground transition disabled:opacity-50"
          >
            {busy ? "Logging in…" : "Log in →"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link to="/signup" className="font-600 text-accent-lime hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="font-sans text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required={required}
        className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-accent-lime focus:outline-none"
      />
    </label>
  );
}