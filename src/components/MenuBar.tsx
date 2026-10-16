import { Link } from "@tanstack/react-router";
import { Home, Users, MessageSquare, History } from "lucide-react";

const items = [
  { to: "/", label: "Home", icon: Home, exact: true },
  { to: "/community", label: "Community", icon: Users, exact: false },
  { to: "/feedback", label: "Feedback", icon: MessageSquare, exact: false },
  { to: "/history", label: "History", icon: History, exact: false },
] as const;

export function MenuBar() {
  return (
    <nav aria-label="Main menu" className="fixed inset-x-0 bottom-0 z-50 border-t bg-card pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto grid max-w-lg grid-cols-4">
        {items.map(({ to, label, icon: Icon, exact }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact }}
            className="flex min-h-16 min-w-0 flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground [&.active]:bg-accent [&.active]:text-primary"
            activeProps={{ className: "active" }}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
