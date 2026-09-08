export const ROLES = {
  customer: "ลูกค้า",
  shop: "ร้าน/สถานบันเทิง",
  pr: "พนักงาน PR",
  agency: "เอเจนซี่",
  admin: "แอดมิน",
} as const;

export type Role = keyof typeof ROLES;

export const SHOP_TYPES = ["บาร์", "ผับ", "ร้านอาหารกึ่งบาร์", "คลับ", "อีเวนต์"];

export const JOB_TYPES = [
  "PR หน้าร้าน",
  "PR เชียร์เครื่องดื่ม",
  "Brand Ambassador",
  "โปรโมชันสินค้า",
  "MC / พิธีกร",
  "งานอีเวนต์",
];

export const LANGUAGES = ["ไทย", "อังกฤษ", "จีน", "ญี่ปุ่น", "เกาหลี", "ลาว"];

export const PROVINCES = [
  "กรุงเทพมหานคร",
  "นนทบุรี",
  "ปทุมธานี",
  "สมุทรปราการ",
  "ชลบุรี",
  "ระยอง",
  "เชียงใหม่",
  "เชียงราย",
  "ขอนแก่น",
  "นครราชสีมา",
  "อุดรธานี",
  "ภูเก็ต",
  "สุราษฎร์ธานี",
  "สงขลา",
];

export const VERIFICATION_LABELS: Record<string, string> = {
  draft: "แบบร่าง",
  submitted: "ส่งตรวจสอบแล้ว",
  under_review: "กำลังตรวจสอบ",
  approved: "อนุมัติแล้ว",
  rejected: "ไม่ผ่าน",
  suspended: "ถูกระงับ",
};

export const BOOKING_LABELS: Record<string, string> = {
  pending: "รอการตอบรับ",
  accepted: "ยืนยันแล้ว",
  rejected: "ถูกปฏิเสธ",
  cancelled_by_shop: "ร้านยกเลิก",
  cancelled_by_pr: "PR ยกเลิก",
  completed: "จบงานแล้ว",
  no_show: "ไม่มาตามนัด",
  disputed: "มีข้อพิพาท",
};

export const REPORT_CATEGORIES = [
  "ไม่มาตามนัด",
  "พฤติกรรมไม่เหมาะสม",
  "ข้อมูลปลอม",
  "ขอใช้บริการผิดกฎหมาย",
  "คุกคาม",
  "อื่น ๆ",
];

export function statusTone(status: string): "gold" | "green" | "red" | "muted" {
  if (["approved", "accepted", "completed"].includes(status)) return "green";
  if (["rejected", "suspended", "no_show", "disputed"].includes(status)) return "red";
  if (["pending", "submitted", "under_review"].includes(status)) return "gold";
  return "muted";
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function hoursBetween(start: string, end: string) {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(0, Math.round((diff / 3600000) * 10) / 10);
}

export function calcAge(birthDate?: string | null) {
  if (!birthDate) return null;
  const b = new Date(birthDate);
  const diff = Date.now() - b.getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}
