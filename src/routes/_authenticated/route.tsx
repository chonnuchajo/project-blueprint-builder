import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const navigate = useNavigate();
  const { user, loading } = useSession();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [loading, navigate, user]);

  if (loading || !user) {
    return (
      <div className="night-bg flex min-h-screen items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">กำลังโหลด...</p>
      </div>
    );
  }

  return <Outlet />;
}
