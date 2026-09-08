import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell, StatusBadge } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/hooks/use-session";
import { BOOKING_LABELS, formatDateTime, hoursBetween } from "@/lib/domain";
import { localDb } from "@/lib/local-store";

export const Route = createFileRoute("/_authenticated/bookings")({
  head: () => ({
    meta: [
      { title: "การจอง — NightList" },
      { name: "description", content: "สร้างและติดตามการจองร้านกับพนักงาน PR" },
      { property: "og:title", content: "การจอง — NightList" },
      { property: "og:description", content: "จัดการรายการจองในระบบ NightList" },
    ],
  }),
  component: BookingsPage,
});

function BookingsPage() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [shopId, setShopId] = useState("");
  const [prProfileId, setPrProfileId] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [location, setLocation] = useState("");
  const [jobDetail, setJobDetail] = useState("");
  const [dressCode, setDressCode] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const directory = useQuery({
    queryKey: ["customer-directory"],
    queryFn: () => localDb.getCustomerDirectory(),
  });

  const selection = useQuery({
    queryKey: ["customer-selection", user?.id],
    enabled: !!user,
    queryFn: () => localDb.getCustomerSelection(user!.id),
  });

  const bookings = useQuery({
    queryKey: ["bookings", user?.id],
    enabled: !!user,
    queryFn: () => localDb.getBookings(user!.id),
  });

  useEffect(() => {
    if (!selection.data) return;
    if (selection.data.shop_id) setShopId(selection.data.shop_id);
    if (selection.data.pr_profile_id) setPrProfileId(selection.data.pr_profile_id);
  }, [selection.data]);

  const selectedPr = useMemo(
    () => directory.data?.prProfiles.find((profile) => profile.id === prProfileId),
    [directory.data?.prProfiles, prProfileId],
  );

  const priceEstimate =
    selectedPr && start && end ? hoursBetween(start, end) * Number(selectedPr.hourly_rate) : 0;

  async function createBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!shopId || !prProfileId) return toast.error("กรุณาเลือกร้านและ PR");
    if (new Date(end) <= new Date(start)) return toast.error("เวลาสิ้นสุดต้องหลังเวลาเริ่ม");

    setSaving(true);
    await localDb.createBooking({
      customer_user_id: user.id,
      shop_id: shopId,
      pr_profile_id: prProfileId,
      start_datetime: new Date(start).toISOString(),
      end_datetime: new Date(end).toISOString(),
      location: location || null,
      job_detail: jobDetail || null,
      dress_code: dressCode || null,
      price_estimate: priceEstimate,
      note: note || null,
    });
    setSaving(false);
    toast.success("สร้างการจองแล้ว");
    setStart("");
    setEnd("");
    setLocation("");
    setJobDetail("");
    setDressCode("");
    setNote("");
    queryClient.invalidateQueries({ queryKey: ["bookings", user.id] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-bookings"] });
  }

  async function setStatus(bookingId: string, status: string) {
    await localDb.updateBookingStatus(bookingId, status);
    queryClient.invalidateQueries({ queryKey: ["bookings"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-bookings"] });
  }

  return (
    <AppShell title="การจอง" subtitle="เลือกร้าน เลือก PR แล้วสร้างรายการจองเก็บใน localStorage">
      <form onSubmit={createBooking} className="luxe-card grid gap-4 p-6 lg:grid-cols-2">
        <div>
          <Label>ร้าน</Label>
          <select
            className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            required
            value={shopId}
            onChange={(event) => setShopId(event.target.value)}
          >
            <option value="">เลือกร้าน</option>
            {(directory.data?.shops ?? []).map((shop) => (
              <option key={shop.id} value={shop.id}>
                {shop.shop_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>PR</Label>
          <select
            className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            required
            value={prProfileId}
            onChange={(event) => setPrProfileId(event.target.value)}
          >
            <option value="">เลือก PR</option>
            {(directory.data?.prProfiles ?? []).map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.display_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>เริ่มงาน</Label>
          <Input
            type="datetime-local"
            required
            value={start}
            onChange={(event) => setStart(event.target.value)}
          />
        </div>
        <div>
          <Label>เลิกงาน</Label>
          <Input
            type="datetime-local"
            required
            value={end}
            onChange={(event) => setEnd(event.target.value)}
          />
        </div>
        <div>
          <Label>สถานที่</Label>
          <Input value={location} onChange={(event) => setLocation(event.target.value)} />
        </div>
        <div>
          <Label>Dress code</Label>
          <Input value={dressCode} onChange={(event) => setDressCode(event.target.value)} />
        </div>
        <div className="lg:col-span-2">
          <Label>รายละเอียดงาน</Label>
          <Textarea value={jobDetail} onChange={(event) => setJobDetail(event.target.value)} />
        </div>
        <div className="lg:col-span-2">
          <Label>หมายเหตุ</Label>
          <Textarea value={note} onChange={(event) => setNote(event.target.value)} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 lg:col-span-2">
          <p className="text-sm text-muted-foreground">
            ราคาโดยประมาณ {priceEstimate.toLocaleString("th-TH")} บาท
          </p>
          <Button type="submit" disabled={saving || directory.isLoading}>
            สร้างการจอง
          </Button>
        </div>
      </form>

      <div className="luxe-card mt-6 p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">รายการจอง</h2>
          <span className="text-xs text-muted-foreground">{bookings.data?.length ?? 0} รายการ</span>
        </div>
        {bookings.isLoading ? <p className="text-sm text-muted-foreground">กำลังโหลด...</p> : null}
        {!bookings.isLoading && bookings.data?.length === 0 ? (
          <p className="text-sm text-muted-foreground">ยังไม่มีการจอง</p>
        ) : null}
        {bookings.data?.length ? (
          <ul className="space-y-4">
            {bookings.data.map((booking) => (
              <li key={booking.id} className="border-b border-border/60 pb-4 last:border-b-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {booking.shops?.shop_name ?? "ไม่พบร้าน"} ·{" "}
                      {booking.pr_profiles?.display_name ?? "ไม่พบ PR"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatDateTime(booking.start_datetime)} ถึง{" "}
                      {formatDateTime(booking.end_datetime)}
                    </p>
                    {booking.location ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        สถานที่: {booking.location}
                      </p>
                    ) : null}
                    {booking.job_detail ? (
                      <p className="mt-2 text-sm text-muted-foreground">{booking.job_detail}</p>
                    ) : null}
                  </div>
                  <StatusBadge
                    status={booking.status}
                    label={BOOKING_LABELS[booking.status] ?? booking.status}
                  />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setStatus(booking.id, "accepted")}
                  >
                    ยืนยัน
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setStatus(booking.id, "completed")}
                  >
                    จบงาน
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setStatus(booking.id, "cancelled_by_shop")}
                  >
                    ยกเลิก
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </AppShell>
  );
}
