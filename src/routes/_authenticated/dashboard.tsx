import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, StatusBadge } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useMyPrProfile, useMyRoles, useMyShop, useSession } from "@/hooks/use-session";
import { BOOKING_LABELS, ROLES, VERIFICATION_LABELS, formatDateTime, type Role } from "@/lib/domain";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "หน้าหลัก — NightList" },
      { name: "description", content: "ภาพรวมบัญชี สถานะการตรวจสอบ และการจองล่าสุดของคุณ" },
      { property: "og:title", content: "หน้าหลัก — NightList" },
      { property: "og:description", content: "ภาพรวมบัญชีและการจองของคุณ" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const { data: roles = [], isLoading: rolesLoading } = useMyRoles();
  const { data: shop } = useMyShop();
  const { data: pr } = useMyPrProfile();
  const [saving, setSaving] = useState(false);

  // สร้างโปรไฟล์และบทบาทให้อัตโนมัติจากข้อมูลตอนสมัคร
  useEffect(() => {
    if (!user) return;
    (async () => {
      await supabase.from("profiles").upsert(
        {
          id: user.id,
          email: user.email ?? null,
          phone: (user.user_metadata?.phone as string) ?? null,
          display_name:
            (user.user_metadata?.display_name as string) ??
            (user.user_metadata?.full_name as string) ??
            user.email,
        },
        { onConflict: "id" },
      );
      const metaRole = user.user_metadata?.role as Role | undefined;
      if (metaRole && metaRole !== "admin") {
        await supabase.from("user_roles").upsert(
          { user_id: user.id, role: metaRole },
          { onConflict: "user_id,role", ignoreDuplicates: true },
        );
        queryClient.invalidateQueries({ queryKey: ["my-roles"] });
      }
    })();
  }, [user, queryClient]);

  const bookings = useQuery({
    queryKey: ["dashboard-bookings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, shops(shop_name), pr_profiles(display_name)")
        .order("start_datetime", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data ?? [];
    },
  });

  async function pickRole(role: Role) {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("user_roles").insert({ user_id: user.id, role });
    setSaving(false);
    if (error) return toast.error("บันทึกประเภทบัญชีไม่สำเร็จ");
    toast.success("บันทึกประเภทบัญชีแล้ว");
    queryClient.invalidateQueries({ queryKey: ["my-roles"] });
  }

  const needsRole = !rolesLoading && roles.length === 0;

  return (
    <AppShell title="หน้าหลัก" subtitle="ภาพรวมบัญชีและงานล่าสุดของคุณ">
      {needsRole ? (
        <div className="luxe-card mb-6 p-6">
          <h2 className="text-lg font-semibold">เลือกประเภทบัญชีของคุณ</h2>
          <p className="mt-1 text-sm text-muted-foreground">เลือกได้ครั้งเดียวเพื่อเปิดใช้งานเมนูที่เกี่ยวข้อง</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(["shop", "pr", "agency"] as Role[]).map((r) => (
              <Button key={r} variant="secondary" disabled={saving} onClick={() => pickRole(r)}>
                {ROLES[r]}
              </Button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="luxe-card p-5">
          <p className="text-xs text-muted-foreground">ประเภทบัญชี</p>
          <p className="mt-2 text-lg font-semibold">
            {roles.length ? roles.map((r) => ROLES[r]).join(" · ") : "ยังไม่ได้เลือก"}
          </p>
        </div>
        <div className="luxe-card p-5">
          <p className="text-xs text-muted-foreground">สถานะร้าน</p>
          <div className="mt-2">
            {shop ? (
              <StatusBadge
                status={shop.verification_status}
                label={VERIFICATION_LABELS[shop.verification_status] ?? shop.verification_status}
              />
            ) : (
              <Link to="/shop" className="text-sm text-primary underline">
                ยังไม่ได้ลงทะเบียนร้าน
              </Link>
            )}
          </div>
        </div>
        <div className="luxe-card p-5">
          <p className="text-xs text-muted-foreground">สถานะโปรไฟล์ PR</p>
          <div className="mt-2">
            {pr ? (
              <StatusBadge
                status={pr.profile_status}
                label={VERIFICATION_LABELS[pr.profile_status] ?? pr.profile_status}
              />
            ) : (
              <Link to="/pr-profile" className="text-sm text-primary underline">
                ยังไม่ได้สร้างโปรไฟล์
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="luxe-card mt-6 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">การจองล่าสุด</h2>
          <Link to="/bookings" className="text-sm text-primary underline">
            ดูทั้งหมด
          </Link>
        </div>
        {bookings.data?.length ? (
          <ul className="space-y-3">
            {bookings.data.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                <div>
                  <p className="text-sm font-medium">
                    {b.shops?.shop_name} → {b.pr_profiles?.display_name}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(b.start_datetime)}</p>
                </div>
                <StatusBadge status={b.status} label={BOOKING_LABELS[b.status] ?? b.status} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">ยังไม่มีการจอง</p>
        )}
      </div>
    </AppShell>
  );
}
