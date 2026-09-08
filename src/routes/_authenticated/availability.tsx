import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMyPrProfile } from "@/hooks/use-session";
import { formatDateTime } from "@/lib/domain";
import { localDb } from "@/lib/local-store";

export const Route = createFileRoute("/_authenticated/availability")({
  head: () => ({
    meta: [
      { title: "ตารางว่าง — NightList" },
      { name: "description", content: "กำหนดช่วงเวลาว่างรับงานและบล็อกวันหยุดของพนักงาน PR" },
      { property: "og:title", content: "ตารางว่าง — NightList" },
      { property: "og:description", content: "จัดการช่วงเวลารับงานของคุณ" },
    ],
  }),
  component: AvailabilityPage,
});

function AvailabilityPage() {
  const { data: pr } = useMyPrProfile();
  const queryClient = useQueryClient();
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [status, setStatus] = useState("available");

  const slots = useQuery({
    queryKey: ["availability", pr?.id],
    enabled: !!pr,
    queryFn: async () => {
      return localDb.getAvailability(pr!.id);
    },
  });

  async function addSlot(e: React.FormEvent) {
    e.preventDefault();
    if (!pr) return;
    if (new Date(end) <= new Date(start)) return toast.error("เวลาสิ้นสุดต้องหลังเวลาเริ่ม");
    await localDb.addAvailability({
      pr_profile_id: pr.id,
      start_datetime: new Date(start).toISOString(),
      end_datetime: new Date(end).toISOString(),
      status,
    });
    toast.success("เพิ่มช่วงเวลาแล้ว");
    setStart("");
    setEnd("");
    queryClient.invalidateQueries({ queryKey: ["availability"] });
  }

  async function remove(id: string) {
    await localDb.removeAvailability(id);
    queryClient.invalidateQueries({ queryKey: ["availability"] });
  }

  if (!pr) {
    return (
      <AppShell title="ตารางว่าง">
        <p className="text-sm text-muted-foreground">กรุณาสร้างโปรไฟล์ PR ก่อนกำหนดตารางว่าง</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="ตารางว่าง" subtitle="ร้านจะเห็นเฉพาะช่วงเวลาที่คุณเปิดรับงาน">
      <form onSubmit={addSlot} className="luxe-card grid gap-4 p-6 sm:grid-cols-4">
        <div>
          <Label>เริ่ม</Label>
          <Input
            type="datetime-local"
            required
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </div>
        <div>
          <Label>สิ้นสุด</Label>
          <Input
            type="datetime-local"
            required
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>
        <div>
          <Label>สถานะ</Label>
          <select
            className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="available">ว่างรับงาน</option>
            <option value="blocked">บล็อก/วันหยุด</option>
          </select>
        </div>
        <div className="flex items-end">
          <Button type="submit" className="w-full">
            เพิ่มช่วงเวลา
          </Button>
        </div>
      </form>

      <div className="luxe-card mt-6 p-6">
        <h2 className="mb-4 text-lg font-semibold">ช่วงเวลาทั้งหมด</h2>
        {slots.data?.length ? (
          <ul className="space-y-3">
            {slots.data.map((s) => (
              <li
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3"
              >
                <div>
                  <p className="text-sm">
                    {formatDateTime(s.start_datetime)} – {formatDateTime(s.end_datetime)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {s.status === "available" ? "ว่างรับงาน" : "บล็อก/วันหยุด"}
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => remove(s.id)}>
                  ลบ
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">ยังไม่มีช่วงเวลา</p>
        )}
      </div>
    </AppShell>
  );
}
