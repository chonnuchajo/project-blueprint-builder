import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell, StatusBadge } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMyPrProfile, useSession } from "@/hooks/use-session";
import { JOB_TYPES, LANGUAGES, PROVINCES, VERIFICATION_LABELS, calcAge } from "@/lib/domain";
import { localDb } from "@/lib/local-store";

export const Route = createFileRoute("/_authenticated/pr-profile")({
  head: () => ({
    meta: [
      { title: "โปรไฟล์ PR — NightList" },
      {
        name: "description",
        content: "สร้างและแก้ไขโปรไฟล์พนักงาน PR พื้นที่รับงาน เรทราคา และประสบการณ์",
      },
      { property: "og:title", content: "โปรไฟล์ PR — NightList" },
      { property: "og:description", content: "จัดการโปรไฟล์พนักงาน PR ของคุณ" },
    ],
  }),
  component: PrProfilePage,
});

function Chips({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          type="button"
          key={o}
          onClick={() => onToggle(o)}
          className={`rounded-full border px-3 py-1 text-xs transition-colors ${
            selected.includes(o)
              ? "border-primary bg-primary/15 text-primary"
              : "border-border text-muted-foreground hover:bg-secondary"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function PrProfilePage() {
  const { user } = useSession();
  const { data: pr, isLoading } = useMyPrProfile();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    display_name: "",
    birth_date: "",
    gender: "",
    bio: "",
    experience_years: 0,
    hourly_rate: 0,
    avatar_url: "",
    image_urls: "",
  });
  const [areas, setAreas] = useState<string[]>([]);
  const [langs, setLangs] = useState<string[]>([]);
  const [jobs, setJobs] = useState<string[]>([]);

  useEffect(() => {
    if (pr) {
      setForm({
        display_name: pr.display_name ?? "",
        birth_date: pr.birth_date ?? "",
        gender: pr.gender ?? "",
        bio: pr.bio ?? "",
        experience_years: pr.experience_years ?? 0,
        hourly_rate: Number(pr.hourly_rate ?? 0),
        avatar_url: pr.avatar_url ?? "",
        image_urls: (pr.image_urls?.length ? pr.image_urls : [pr.avatar_url])
          .filter(Boolean)
          .join("\n"),
      });
      setAreas(pr.service_areas ?? []);
      setLangs(pr.languages ?? []);
      setJobs(pr.job_types ?? []);
    }
  }, [pr]);

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const age = calcAge(form.birth_date);
    if (age === null || age < 17) return toast.error("ต้องมีอายุ 17 ปีขึ้นไปจึงจะสร้างโปรไฟล์ได้");
    setSaving(true);
    const imageUrls = form.image_urls
      .split(/\r?\n/)
      .map((url) => url.trim())
      .filter(Boolean);
    const { image_urls, ...fields } = form;
    const payload = {
      ...fields,
      avatar_url: imageUrls[0] ?? form.avatar_url,
      image_urls: imageUrls,
      birth_date: form.birth_date || null,
      service_areas: areas,
      languages: langs,
      job_types: jobs,
      user_id: user.id,
    };
    await localDb.savePrProfile(payload);
    setSaving(false);
    toast.success("บันทึกโปรไฟล์แล้ว รอแอดมินตรวจสอบ");
    queryClient.invalidateQueries({ queryKey: ["my-pr"] });
  }

  return (
    <AppShell title="โปรไฟล์ PR" subtitle="ข้อมูลนี้จะแสดงให้ร้านเห็นเมื่อผ่านการอนุมัติ">
      {isLoading ? (
        <p className="text-sm text-muted-foreground">กำลังโหลด...</p>
      ) : (
        <form onSubmit={save} className="luxe-card space-y-5 p-6">
          {pr ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-muted-foreground">สถานะตรวจสอบ</span>
              <StatusBadge
                status={pr.profile_status}
                label={VERIFICATION_LABELS[pr.profile_status] ?? pr.profile_status}
              />
              <span className="text-sm text-muted-foreground">
                คะแนน {Number(pr.rating_average).toFixed(1)} ({pr.rating_count} รีวิว)
              </span>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>ชื่อที่แสดง</Label>
              <Input
                required
                value={form.display_name}
                onChange={(e) => setForm({ ...form, display_name: e.target.value })}
              />
            </div>
            <div>
              <Label>วันเกิด (ใช้ตรวจสอบอายุ)</Label>
              <Input
                type="date"
                required
                value={form.birth_date}
                onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
              />
            </div>
            <div>
              <Label>เพศ (ไม่บังคับ)</Label>
              <Input
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              />
            </div>
            <div>
              <Label>ประสบการณ์ (ปี)</Label>
              <Input
                type="number"
                min={0}
                value={form.experience_years}
                onChange={(e) => setForm({ ...form, experience_years: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>เรทต่อชั่วโมง (บาท)</Label>
              <Input
                type="number"
                min={0}
                value={form.hourly_rate}
                onChange={(e) => setForm({ ...form, hourly_rate: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>ลิงก์รูปโปรไฟล์</Label>
              <Input
                placeholder="https://..."
                value={form.avatar_url}
                onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>รูปภาพ PR หลายภาพ</Label>
              <Textarea
                placeholder="https://example.com/photo-1.jpg&#10;https://example.com/photo-2.jpg"
                value={form.image_urls}
                onChange={(e) => setForm({ ...form, image_urls: e.target.value })}
              />
              <p className="mt-1 text-xs text-muted-foreground">ใส่ 1 URL ต่อ 1 บรรทัด</p>
            </div>
            <div className="sm:col-span-2">
              <Label>แนะนำตัว</Label>
              <Textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>พื้นที่รับงาน</Label>
            <Chips
              options={PROVINCES}
              selected={areas}
              onToggle={(v) => toggle(areas, setAreas, v)}
            />
          </div>
          <div>
            <Label>ภาษา</Label>
            <Chips
              options={LANGUAGES}
              selected={langs}
              onToggle={(v) => toggle(langs, setLangs, v)}
            />
          </div>
          <div>
            <Label>ประเภทงานที่รับ</Label>
            <Chips options={JOB_TYPES} selected={jobs} onToggle={(v) => toggle(jobs, setJobs, v)} />
          </div>

          <Button type="submit" disabled={saving}>
            {pr ? "บันทึกการแก้ไข" : "สร้างโปรไฟล์"}
          </Button>
        </form>
      )}
    </AppShell>
  );
}
