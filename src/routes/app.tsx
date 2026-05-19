import { useEffect, useState } from "react";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { getCurrentUser } from "@/lib/auth";
import { ensureMonthlyPlan } from "@/lib/plan";
import type { UserProfile } from "@/lib/types";
import { BottomNav } from "@/components/elv8/BottomNav";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      const u = await getCurrentUser();
      if (!u) {
        navigate({ to: "/login" });
        return;
      }
      await ensureMonthlyPlan(u);
      setUser(u);
      setReady(true);
    };
    init();
  }, [navigate]);

  if (!ready || !user) {
    return <main className="min-h-screen bg-background" />;
  }

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      <Outlet />
      <BottomNav />
    </div>
  );
}
