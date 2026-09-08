import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useMyRoles, useSession } from "@/hooks/use-session";

type NavItem = { to: string; label: string };

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const { data: roles = [] } = useMyRoles();

  const items: NavItem[] = [{ to: "/dashboard", label: "หน้าหลัก" }];
  if (roles.includes("shop") || roles.includes("agency")) {
    items.push({ to: "/shop", label: "ข้อมูลร้าน" }, { to: "/search", label: "ค้นหา PR" });
  }
  if (roles.includes("pr") || roles.includes("agency")) {
    items.push({ to: "/pr-profile", label: "โปรไฟล์ PR" }, { to: "/availability", label: "ตารางว่าง" });
  }
  items.push({ to: "/bookings", label: "การจอง" }, { to: "/report", label: "แจ้งปัญหา" });
  if (roles.includes("admin")) items.push({ to: "/admin", label: "แอดมิน" });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="night-bg min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <Link to="/dashboard" className="font-display text-lg font-bold">
            <span className="gold-text">NIGHT</span>LIST
          </Link>
          <nav className="flex flex-1 flex-wrap items-center gap-1 text-sm">
            {items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "bg-secondary text-foreground" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          {user ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="hidden sm:inline">{user.email}</span>
              <Button size="sm" variant="outline" onClick={signOut}>
                ออกจากระบบ
              </Button>
            </div>
          ) : null}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
        {children}
      </main>
    </div>
  );
}

export function StatusBadge({ status, label }: { status: string; label: string }) {
  const tone =
    ["approved", "accepted", "completed"].includes(status)
      ? "bg-success/15 text-success border-success/30"
      : ["rejected", "suspended", "no_show", "disputed", "cancelled_by_shop", "cancelled_by_pr"].includes(status)
        ? "bg-destructive/15 text-destructive border-destructive/30"
        : "bg-primary/15 text-primary border-primary/30";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs ${tone}`}>
      {label}
    </span>
  );
}
