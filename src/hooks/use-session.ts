import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { localAuth, localDb, type LocalSession } from "@/lib/local-store";
import type { Role } from "@/lib/domain";

export function useSession() {
  const [session, setSession] = useState<LocalSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localAuth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data } = localAuth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  return { session, user: session?.user ?? null, loading };
}

export function useMyRoles() {
  const { user } = useSession();
  return useQuery({
    queryKey: ["my-roles", user?.id],
    enabled: !!user,
    queryFn: async () => {
      return localDb.getRoles(user!.id) as Promise<Role[]>;
    },
  });
}

export function useMyShop() {
  const { user } = useSession();
  return useQuery({
    queryKey: ["my-shop", user?.id],
    enabled: !!user,
    queryFn: async () => {
      return localDb.getMyShop(user!.id);
    },
  });
}

export function useMyPrProfile() {
  const { user } = useSession();
  return useQuery({
    queryKey: ["my-pr", user?.id],
    enabled: !!user,
    queryFn: async () => {
      return localDb.getMyPrProfile(user!.id);
    },
  });
}
