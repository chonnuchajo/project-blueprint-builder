import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell, StatusBadge } from "@/components/AppShell";
import { ImageSlider } from "@/components/ImageSlider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/hooks/use-session";
import { VERIFICATION_LABELS } from "@/lib/domain";
import { localDb, type LocalPrProfile, type LocalShop } from "@/lib/local-store";

export const Route = createFileRoute("/_authenticated/customer")({
  head: () => ({
    meta: [
      { title: "ลูกค้า — NightList" },
      {
        name: "description",
        content: "เลือกข้อมูลร้านและพนักงาน PR ที่ลงทะเบียนในระบบ NightList",
      },
      { property: "og:title", content: "ลูกค้า — NightList" },
      { property: "og:description", content: "เลือกร้านและพนักงาน PR ที่ต้องการ" },
    ],
  }),
  component: CustomerPage,
});

function CustomerPage() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [selectedPrId, setSelectedPrId] = useState<string | null>(null);
  const [shopDetail, setShopDetail] = useState<LocalShop | null>(null);
  const [prDetail, setPrDetail] = useState<LocalPrProfile | null>(null);
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

  useEffect(() => {
    if (!selection.data) return;
    setSelectedShopId(selection.data.shop_id);
    setSelectedPrId(selection.data.pr_profile_id);
  }, [selection.data]);

  const filteredShops = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const shops = directory.data?.shops ?? [];
    if (!keyword) return shops;
    return shops.filter((shop) =>
      [
        shop.shop_name,
        shop.shop_type,
        shop.province,
        shop.district,
        shop.address,
        shop.description,
      ].some((value) => value?.toLowerCase().includes(keyword)),
    );
  }, [directory.data?.shops, search]);

  const filteredPrProfiles = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const prProfiles = directory.data?.prProfiles ?? [];
    if (!keyword) return prProfiles;
    return prProfiles.filter((profile) =>
      [
        profile.display_name,
        profile.bio,
        ...profile.service_areas,
        ...profile.languages,
        ...profile.job_types,
      ].some((value) => value?.toLowerCase().includes(keyword)),
    );
  }, [directory.data?.prProfiles, search]);

  const selectedShop = directory.data?.shops.find((shop) => shop.id === selectedShopId);
  const selectedPr = directory.data?.prProfiles.find((profile) => profile.id === selectedPrId);

  async function saveSelection() {
    if (!user) return;
    if (!selectedShopId || !selectedPrId) return toast.error("กรุณาเลือกร้านและ PR ให้ครบ");
    setSaving(true);
    await localDb.saveCustomerSelection({
      userId: user.id,
      shopId: selectedShopId,
      prProfileId: selectedPrId,
    });
    setSaving(false);
    toast.success("บันทึกตัวเลือกแล้ว");
    queryClient.invalidateQueries({ queryKey: ["customer-selection", user.id] });
  }

  return (
    <AppShell title="ลูกค้า" subtitle="เลือกร้านและพนักงาน PR จากข้อมูลที่ลงทะเบียนในระบบ">
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="luxe-card p-5">
            <Label htmlFor="customer-search">ค้นหาร้านหรือ PR</Label>
            <Input
              id="customer-search"
              className="mt-2"
              placeholder="ชื่อร้าน จังหวัด ชื่อ PR ประเภทงาน ภาษา"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <section>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">เลือกร้าน</h2>
              <span className="text-xs text-muted-foreground">{filteredShops.length} ร้าน</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {directory.isLoading ? (
                <p className="text-sm text-muted-foreground">กำลังโหลดร้าน...</p>
              ) : null}
              {!directory.isLoading && filteredShops.length === 0 ? (
                <p className="text-sm text-muted-foreground">ยังไม่มีร้านที่ลงทะเบียน</p>
              ) : null}
              {filteredShops.map((shop) => (
                <article
                  key={shop.id}
                  className={`luxe-card overflow-hidden transition-colors ${
                    selectedShopId === shop.id ? "border-primary ring-2 ring-primary/40" : ""
                  }`}
                >
                  <ImageSlider
                    images={getShopImages(shop)}
                    alt={shop.shop_name}
                    className="h-36"
                    emptyText="ไม่มีรูปร้าน"
                  />
                  <div className="space-y-3 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold">{shop.shop_name}</h3>
                      <StatusBadge
                        status={shop.verification_status}
                        label={
                          VERIFICATION_LABELS[shop.verification_status] ?? shop.verification_status
                        }
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {shop.shop_type} · {shop.province ?? "-"} {shop.district ?? ""}
                    </p>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {shop.description || shop.address || "ยังไม่มีรายละเอียด"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={selectedShopId === shop.id ? "default" : "secondary"}
                        onClick={() => setSelectedShopId(shop.id)}
                      >
                        {selectedShopId === shop.id ? "เลือกแล้ว" : "เลือกร้าน"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setShopDetail(shop)}
                      >
                        ดูรายละเอียด
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">เลือก PR</h2>
              <span className="text-xs text-muted-foreground">{filteredPrProfiles.length} คน</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {directory.isLoading ? (
                <p className="text-sm text-muted-foreground">กำลังโหลด PR...</p>
              ) : null}
              {!directory.isLoading && filteredPrProfiles.length === 0 ? (
                <p className="text-sm text-muted-foreground">ยังไม่มี PR ที่ลงทะเบียน</p>
              ) : null}
              {filteredPrProfiles.map((profile) => (
                <article
                  key={profile.id}
                  className={`luxe-card overflow-hidden transition-colors ${
                    selectedPrId === profile.id ? "border-primary ring-2 ring-primary/40" : ""
                  }`}
                >
                  <ImageSlider
                    images={getPrImages(profile)}
                    alt={profile.display_name}
                    className="h-36"
                    emptyText="ไม่มีรูปโปรไฟล์"
                  />
                  <div className="space-y-3 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold">{profile.display_name}</h3>
                      <StatusBadge
                        status={profile.profile_status}
                        label={
                          VERIFICATION_LABELS[profile.profile_status] ?? profile.profile_status
                        }
                      />
                    </div>
                    <p className="text-sm text-primary">
                      {Number(profile.hourly_rate).toLocaleString("th-TH")} บาท/ชม. ·{" "}
                      {profile.experience_years} ปี
                    </p>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {profile.job_types.length ? profile.job_types.join(", ") : "ยังไม่ระบุงาน"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={selectedPrId === profile.id ? "default" : "secondary"}
                        onClick={() => setSelectedPrId(profile.id)}
                      >
                        {selectedPrId === profile.id ? "เลือกแล้ว" : "เลือก PR"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setPrDetail(profile)}
                      >
                        ดูรายละเอียด
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="luxe-card h-fit p-5 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold">รายการที่เลือก</h2>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">ร้าน</p>
              <p className="mt-1 text-sm font-medium">
                {selectedShop?.shop_name ?? "ยังไม่ได้เลือก"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">PR</p>
              <p className="mt-1 text-sm font-medium">
                {selectedPr?.display_name ?? "ยังไม่ได้เลือก"}
              </p>
            </div>
            <Button
              type="button"
              className="w-full"
              disabled={saving || !selectedShopId || !selectedPrId}
              onClick={saveSelection}
            >
              บันทึกตัวเลือก
            </Button>
            {selectedShopId && selectedPrId ? (
              <Button asChild variant="outline" className="w-full">
                <Link to="/bookings">ไปสร้างการจอง</Link>
              </Button>
            ) : null}
          </div>
        </aside>
      </div>

      <ShopDetailDialog shop={shopDetail} onOpenChange={(open) => !open && setShopDetail(null)} />
      <PrDetailDialog profile={prDetail} onOpenChange={(open) => !open && setPrDetail(null)} />
    </AppShell>
  );
}

function getShopImages(shop: LocalShop) {
  return (shop.image_urls?.length ? shop.image_urls : [shop.cover_url]).filter(Boolean) as string[];
}

function getPrImages(profile: LocalPrProfile) {
  return (profile.image_urls?.length ? profile.image_urls : [profile.avatar_url]).filter(
    Boolean,
  ) as string[];
}

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm">{value || "-"}</p>
    </div>
  );
}

function DetailChips({ label, values }: { label: string; values: string[] }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      {values.length ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {values.map((value) => (
            <span key={value} className="rounded-full border border-border px-2.5 py-1 text-xs">
              {value}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-1 text-sm">-</p>
      )}
    </div>
  );
}

function ShopDetailDialog({
  shop,
  onOpenChange,
}: {
  shop: LocalShop | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={!!shop} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        {shop ? (
          <>
            <DialogHeader>
              <DialogTitle>{shop.shop_name}</DialogTitle>
              <DialogDescription>รายละเอียดร้านที่ลงทะเบียนในระบบ</DialogDescription>
            </DialogHeader>
            <ImageSlider
              images={getShopImages(shop)}
              alt={shop.shop_name}
              className="h-56 rounded-md"
              emptyText="ไม่มีรูปร้าน"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailRow label="ประเภทร้าน" value={shop.shop_type} />
              <DetailRow
                label="สถานะ"
                value={VERIFICATION_LABELS[shop.verification_status] ?? shop.verification_status}
              />
              <DetailRow label="จังหวัด" value={shop.province} />
              <DetailRow label="เขต/อำเภอ" value={shop.district} />
              <DetailRow label="เวลาเปิด" value={shop.open_time} />
              <DetailRow label="เวลาปิด" value={shop.close_time} />
              <DetailRow label="เบอร์โทร" value={shop.phone} />
              <DetailRow label="อีเมล" value={shop.email} />
              <div className="sm:col-span-2">
                <DetailRow label="ที่อยู่" value={shop.address} />
              </div>
              <div className="sm:col-span-2">
                <DetailRow label="รายละเอียด" value={shop.description} />
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function PrDetailDialog({
  profile,
  onOpenChange,
}: {
  profile: LocalPrProfile | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={!!profile} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        {profile ? (
          <>
            <DialogHeader>
              <DialogTitle>{profile.display_name}</DialogTitle>
              <DialogDescription>รายละเอียด PR ที่ลงทะเบียนในระบบ</DialogDescription>
            </DialogHeader>
            <ImageSlider
              images={getPrImages(profile)}
              alt={profile.display_name}
              className="h-56 rounded-md"
              emptyText="ไม่มีรูปโปรไฟล์"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailRow
                label="สถานะ"
                value={VERIFICATION_LABELS[profile.profile_status] ?? profile.profile_status}
              />
              <DetailRow
                label="เรทต่อชั่วโมง"
                value={`${Number(profile.hourly_rate).toLocaleString("th-TH")} บาท`}
              />
              <DetailRow label="ประสบการณ์" value={`${profile.experience_years} ปี`} />
              <DetailRow
                label="คะแนน"
                value={`${Number(profile.rating_average).toFixed(1)} (${profile.rating_count} รีวิว)`}
              />
              <DetailRow label="เพศ" value={profile.gender} />
              <DetailRow label="วันเกิด" value={profile.birth_date} />
              <div className="sm:col-span-2">
                <DetailRow label="แนะนำตัว" value={profile.bio} />
              </div>
              <div className="sm:col-span-2">
                <DetailChips label="พื้นที่รับงาน" values={profile.service_areas} />
              </div>
              <div className="sm:col-span-2">
                <DetailChips label="ภาษา" values={profile.languages} />
              </div>
              <div className="sm:col-span-2">
                <DetailChips label="ประเภทงาน" values={profile.job_types} />
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
