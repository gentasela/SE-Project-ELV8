import { Link, useLocation } from "@tanstack/react-router";

const items = [
  { to: "/app/today", label: "Today", icon: "home" },
  { to: "/app/month", label: "Program", icon: "grid" },
  { to: "/app/fridge", label: "Fridge", icon: "fridge" },
  { to: "/app/stats", label: "Stats", icon: "spark" },
  { to: "/app/grocery", label: "Grocery", icon: "cart" },
  { to: "/app/me", label: "Me", icon: "user" },
] as const;

function Icon({ name }: { name: (typeof items)[number]["icon"] }) {
  const stroke = "currentColor";
  const common = {
    fill: "none",
    stroke,
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    viewBox: "0 0 24 24",
    className: "h-5 w-5",
  };
  if (name === "home")
    return (
      <svg {...common}>
        <path d="M3 11.5 12 4l9 7.5" />
        <path d="M5 10v10h14V10" />
      </svg>
    );
  if (name === "grid")
    return (
      <svg {...common}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    );
  if (name === "spark")
    return (
      <svg {...common}>
        <path d="M3 17l5-6 4 4 4-7 5 9" />
      </svg>
    );
  if (name === "cart")
    return (
      <svg {...common}>
        <circle cx="9" cy="20" r="1.5" />
        <circle cx="17" cy="20" r="1.5" />
        <path d="M3 4h2l2.5 11h11l2-7H7" />
      </svg>
    );
  if (name === "fridge")
    return (
      <svg {...common}>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M5 10h14" />
        <path d="M8 6.5v1.5" />
        <path d="M8 13v2" />
      </svg>
    );
  return (
    <svg {...common}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c1-4 5-5 7-5s6 1 7 5" />
    </svg>
  );
}

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70"
    >
      <div className="mx-auto flex max-w-xl items-stretch justify-around px-2 py-2">
        {items.map((it) => {
          const active = pathname.startsWith(it.to);
          return (
            <Link
              key={it.to}
              to={it.to}
              className={[
                "flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] uppercase tracking-[0.15em] transition",
                active ? "text-accent-lime" : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              <Icon name={it.icon} />
              <span>{it.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
