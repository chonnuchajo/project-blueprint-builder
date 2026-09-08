import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-night.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NightList — จองพนักงาน PR สำหรับร้านเหล้าและสถานบันเทิง" },
      {
        name: "description",
        content:
          "แพลตฟอร์มกลางเชื่อมร้านเหล้า บาร์ และอีเวนต์ กับพนักงาน PR ที่ยืนยันตัวตนแล้ว จองงานเป็นระบบ โปร่งใส ตรวจสอบได้",
      },
      { property: "og:title", content: "NightList — จองพนักงาน PR อย่างเป็นระบบ" },
      {
        property: "og:description",
        content: "ค้นหา ตรวจสอบคิว และจองพนักงาน PR ที่ผ่านการยืนยันตัวตน สำหรับร้านและอีเวนต์",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    title: "ยืนยันตัวตนก่อนรับงาน",
    detail: "ร้านและพนักงาน PR ต้องส่งข้อมูลให้แอดมินตรวจสอบและอนุมัติก่อนใช้งานจริง",
  },
  {
    title: "ค้นหาตรงความต้องการ",
    detail: "กรองตามพื้นที่ เรทราคา ประสบการณ์ ภาษา ประเภทงาน และคะแนนรีวิว",
  },
  {
    title: "ตารางว่างกันจองซ้ำ",
    detail: "PR กำหนดช่วงเวลาว่างเอง ระบบป้องกันการจองทับเวลาโดยอัตโนมัติ",
  },
  {
    title: "รีวิวและรายงานปัญหา",
    detail: "ให้คะแนนกันหลังจบงาน และแจ้งพฤติกรรมไม่เหมาะสมถึงแอดมินได้ทันที",
  },
];

function Landing() {
  return (
    <div className="night-bg min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <span className="font-display text-lg font-bold">
          <span className="gold-text">NIGHT</span>LIST
        </span>
        <Link to="/auth">
          <Button variant="outline" size="sm">
            เข้าสู่ระบบ
          </Button>
        </Link>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-10 md:grid-cols-2 md:py-20">
        <div>
          <p className="mb-4 inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
            สำหรับร้านเหล้า บาร์ ผับ และอีเวนต์
          </p>
          <h1 className="text-4xl leading-tight font-bold sm:text-5xl">
            จองพนักงาน <span className="gold-text">PR</span> ได้อย่างเป็นระบบ
            <br />
            ในคืนที่สำคัญที่สุด
          </h1>
          <p className="mt-5 max-w-lg text-muted-foreground">
            เลิกประสานงานผ่านแชตส่วนตัว NightList รวมโปรไฟล์ PR ที่ยืนยันตัวตนแล้ว
            ตารางว่างจริง และประวัติการทำงาน ไว้ในที่เดียว
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/auth">
              <Button size="lg" className="gold-ring">
                สมัครใช้งานฟรี
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="secondary">
                ฉันเป็นพนักงาน PR
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            ผู้ใช้งานต้องมีอายุไม่น้อยกว่า 17 ปี ห้ามใช้แพลตฟอร์มเพื่อจัดหาบริการผิดกฎหมาย
            ทุกบัญชีถูกตรวจสอบและระงับได้เมื่อพบการละเมิด
          </p>
        </div>
        <div className="luxe-card overflow-hidden">
          <img
            src={heroImage}
            alt="บรรยากาศบาร์ยามค่ำคืนพร้อมทีมงาน PR ต้อนรับลูกค้า"
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <h2 className="mb-8 text-2xl font-semibold">ทำไมต้อง NightList</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((f) => (
            <div key={f.title} className="luxe-card p-6">
              <h3 className="text-lg font-semibold text-primary">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        NightList · ข้อมูลส่วนบุคคลจัดเก็บตามหลัก PDPA และเปิดเผยเฉพาะเมื่อการจองได้รับการยืนยัน
      </footer>
    </div>
  );
}
