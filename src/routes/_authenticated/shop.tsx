import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell, StatusBadge } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMyShop, useSession } from "@/hooks/use-session";
import { PROVINCES, SHOP_TYPES, VERIFICATION_LABELS } from "@/lib/domain";
import { localDb } from "@/lib/local-store";

export const Route = createFileRoute("/_authenticated/shop")({
  head: () => ({
    meta: [
      { title: "ข้อมูลร้าน — NightList" },
      {
        name: "description",
        content: "ลงทะเบียนร้านเหล้า บาร์ หรืออีเวนต์ และส่งข้อมูลให้แอดมินตรวจสอบ",
      },
      { property: "og:title", content: "ข้อมูลร้าน — NightList" },
      { property: "og:description", content: "ลงทะเบียนและแก้ไขข้อมูลร้านของคุณ" },
    ],
  }),
  component: ShopPage,
});

const empty = {
  shop_name: "",
  shop_type: SHOP_TYPES[0],
  license_no: "",
  contact_name: "",
  phone: "",
  email: "",
  address: "",
  province: PROVINCES[0],
  district: "",
  open_time: "18:00",
  close_time: "02:00",
  cover_url: "",
  image_urls: "",
  description: "",
};

function ShopPage() {
  const { user } = useSession();
  const { data: shop, isLoading } = useMyShop();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (shop) {
      setForm({
        shop_name: shop.shop_name ?? "",
        shop_type: shop.shop_type ?? SHOP_TYPES[0],
        license_no: shop.license_no ?? "",
        contact_name: shop.contact_name ?? "",
        phone: shop.phone ?? "",
        email: shop.email ?? "",
        address: shop.address ?? "",
        province: shop.province ?? PROVINCES[0],
        district: shop.district ?? "",
        open_time: shop.open_time ?? "18:00",
        close_time: shop.close_time ?? "02:00",
        cover_url: shop.cover_url ?? "",
        image_urls: (shop.image_urls?.length ? shop.image_urls : [shop.cover_url])
          .filter(Boolean)
          .join("\n"),
        description: shop.description ?? "",
      });
    }
  }, [shop]);

  function set(key: keyof typeof empty, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const imageUrls = form.image_urls
      .split(/\r?\n/)
      .map((url) => url.trim())
      .filter(Boolean);
    const { image_urls, ...fields } = form;
    const payload = {
      ...fields,
      cover_url: imageUrls[0] ?? form.cover_url,
      image_urls: imageUrls,
      user_id: user.id,
    };
    await localDb.saveShop(payload);
    setSaving(false);
    toast.success("บันทึกข้อมูลร้านแล้ว รอแอดมินตรวจสอบ");
    queryClient.invalidateQueries({ queryKey: ["my-shop"] });
  }

  return (
    <AppShell title="ข้อมูลร้าน" subtitle="กรอกข้อมูลให้ครบเพื่อให้แอดมินตรวจสอบและอนุมัติ">
      {isLoading ? (
        <p className="text-sm text-muted-foreground">กำลังโหลด...</p>
      ) : (
        <form onSubmit={save} className="luxe-card space-y-5 p-6">
          {shop ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">สถานะตรวจสอบ</span>
              <StatusBadge
                status={shop.verification_status}
                label={VERIFICATION_LABELS[shop.verification_status] ?? shop.verification_status}
              />
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>ชื่อร้าน</Label>
              <Input
                required
                value={form.shop_name}
                onChange={(e) => set("shop_name", e.target.value)}
              />
            </div>
            <div>
              <Label>ประเภทร้าน</Label>
              <select
                className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.shop_type}
                onChange={(e) => set("shop_type", e.target.value)}
              >
                {SHOP_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>เลขทะเบียน/ใบอนุญาต</Label>
              <Input value={form.license_no} onChange={(e) => set("license_no", e.target.value)} />
            </div>
            <div>
              <Label>ชื่อผู้ติดต่อ</Label>
              <Input
                value={form.contact_name}
                onChange={(e) => set("contact_name", e.target.value)}
              />
            </div>
            <div>
              <Label>เบอร์โทร</Label>
              <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
            <div>
              <Label>อีเมล</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </div>
            <div>
              <Label>จังหวัด</Label>
              <select
                className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.province}
                onChange={(e) => set("province", e.target.value)}
              >
                {PROVINCES.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>เขต/อำเภอ</Label>
              <Input value={form.district} onChange={(e) => set("district", e.target.value)} />
            </div>
            <div>
              <Label>เวลาเปิด</Label>
              <Input
                type="time"
                value={form.open_time}
                onChange={(e) => set("open_time", e.target.value)}
              />
            </div>
            <div>
              <Label>เวลาปิด</Label>
              <Input
                type="time"
                value={form.close_time}
                onChange={(e) => set("close_time", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>ลิงก์รูปภาพร้าน</Label>
              <Input
                placeholder="https://..."
                value={form.cover_url}
                onChange={(e) => set("cover_url", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>รูปภาพร้านหลายภาพ</Label>
              <Textarea
                placeholder="https://example.com/photo-1.jpg&#10;https://example.com/photo-2.jpg"
                value={form.image_urls}
                onChange={(e) => set("image_urls", e.target.value)}
              />
              <p className="mt-1 text-xs text-muted-foreground">ใส่ 1 URL ต่อ 1 บรรทัด</p>
            </div>
            <div className="sm:col-span-2">
              <Label>ที่อยู่ร้าน</Label>
              <Textarea value={form.address} onChange={(e) => set("address", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label>รายละเอียดร้าน</Label>
              <Textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            ข้อมูลเอกสารยืนยันตัวตนจะถูกใช้เพื่อการตรวจสอบเท่านั้น
            และเข้าถึงได้เฉพาะทีมแอดมินตามหลัก PDPA
          </p>
          <Button type="submit" disabled={saving}>
            {shop ? "บันทึกการแก้ไข" : "ลงทะเบียนร้าน"}
          </Button>
        </form>
      )}
    </AppShell>
  );
}
