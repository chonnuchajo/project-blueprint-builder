import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { ImageSlider } from "@/components/ImageSlider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { JOB_TYPES, LANGUAGES, PROVINCES } from "@/lib/domain";
import { localDb } from "@/lib/local-store";

export const Route = createFileRoute("/_authenticated/search")({
  head: () => ({
    meta: [
      { title: "ค้นหาพนักงาน PR — NightList" },
      {
        name: "description",
        content: "ค้นหาพนักงาน PR ตามพื้นที่ เรทราคา ประสบการณ์ ภาษา และประเภทงาน",
      },
      { property: "og:title", content: "ค้นหาพนักงาน PR — NightList" },
      { property: "og:description", content: "ค้นหา PR ที่เหมาะกับงานของร้านคุณ" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const [province, setProvince] = useState("");
  const [jobType, setJobType] = useState("");
  const [language, setLanguage] = useState("");
  const [maxRate, setMaxRate] = useState("");
  const [minRating, setMinRating] = useState("");
  const [minExp, setMinExp] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableTo, setAvailableTo] = useState("");
  const [filters, setFilters] = useState(0);

  const results = useQuery({
    queryKey: [
      "pr-search",
      filters,
      province,
      jobType,
      language,
      maxRate,
      minRating,
      minExp,
      availableFrom,
      availableTo,
    ],
    queryFn: async () => {
      return localDb.searchPrProfiles({
        province,
        jobType,
        language,
        maxRate,
        minRating,
        minExp,
        availableFrom,
        availableTo,
      });
    },
  });

  return (
    <AppShell title="ค้นหาพนักงาน PR" subtitle="แสดงเฉพาะโปรไฟล์ที่ผ่านการยืนยันตัวตนแล้ว">
      <div className="luxe-card grid gap-4 p-6 sm:grid-cols-3 lg:grid-cols-4">
        <div>
          <Label>จังหวัด</Label>
          <select
            className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
          >
            <option value="">ทั้งหมด</option>
            {PROVINCES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>ประเภทงาน</Label>
          <select
            className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
          >
            <option value="">ทั้งหมด</option>
            {JOB_TYPES.map((j) => (
              <option key={j}>{j}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>ภาษา</Label>
          <select
            className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="">ทั้งหมด</option>
            {LANGUAGES.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>เรทสูงสุด (บาท/ชม.)</Label>
          <Input type="number" value={maxRate} onChange={(e) => setMaxRate(e.target.value)} />
        </div>
        <div>
          <Label>คะแนนขั้นต่ำ</Label>
          <Input
            type="number"
            step="0.5"
            max={5}
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
          />
        </div>
        <div>
          <Label>ประสบการณ์ขั้นต่ำ (ปี)</Label>
          <Input type="number" value={minExp} onChange={(e) => setMinExp(e.target.value)} />
        </div>
        <div>
          <Label>ว่างตั้งแต่</Label>
          <Input
            type="datetime-local"
            value={availableFrom}
            onChange={(e) => setAvailableFrom(e.target.value)}
          />
        </div>
        <div>
          <Label>ถึง</Label>
          <Input
            type="datetime-local"
            value={availableTo}
            onChange={(e) => setAvailableTo(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <Button className="w-full" onClick={() => setFilters((f) => f + 1)}>
            ค้นหา
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.isLoading ? <p className="text-sm text-muted-foreground">กำลังค้นหา...</p> : null}
        {results.data?.length === 0 ? (
          <p className="text-sm text-muted-foreground">ไม่พบพนักงาน PR ที่ตรงเงื่อนไข</p>
        ) : null}
        {results.data?.map((p) => (
          <article
            key={p.id}
            className="luxe-card overflow-hidden transition-transform hover:-translate-y-0.5"
          >
            <ImageSlider
              images={
                (p.image_urls?.length ? p.image_urls : [p.avatar_url]).filter(Boolean) as string[]
              }
              alt={p.display_name}
              className="h-44"
              emptyText="ไม่มีรูปโปรไฟล์"
            />
            <div className="p-5">
              <h3 className="text-lg font-semibold">{p.display_name}</h3>
              <p className="mt-1 text-sm text-primary">
                ★ {Number(p.rating_average).toFixed(1)} · {p.rating_count} รีวิว
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {Number(p.hourly_rate).toLocaleString("th-TH")} บาท/ชม. · ประสบการณ์{" "}
                {p.experience_years} ปี
              </p>
              <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">
                {(p.service_areas ?? []).join(", ")}
              </p>
            </div>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
