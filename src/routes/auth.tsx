import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROLES, type Role } from "@/lib/domain";
import { localAuth } from "@/lib/local-store";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "เข้าสู่ระบบ — NightList" },
      {
        name: "description",
        content: "เข้าสู่ระบบหรือสมัครสมาชิก NightList สำหรับร้านและพนักงาน PR",
      },
      { property: "og:title", content: "เข้าสู่ระบบ — NightList" },
      { property: "og:description", content: "เข้าสู่ระบบหรือสมัครสมาชิก NightList" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Role>("customer");
  const [ageOk, setAgeOk] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    localAuth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await localAuth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error("เข้าสู่ระบบไม่สำเร็จ: " + error.message);
    navigate({ to: "/dashboard" });
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    if (!ageOk) return toast.error("กรุณายืนยันว่าคุณมีอายุ 17 ปีขึ้นไป");
    setLoading(true);
    const { data, error } = await localAuth.signUp({
      email,
      password,
      options: {
        data: { role, display_name: displayName, phone },
      },
    });
    setLoading(false);
    if (error) return toast.error("สมัครไม่สำเร็จ: " + error.message);
    if (data.session) {
      navigate({ to: "/dashboard" });
    } else {
      toast.success("สมัครสำเร็จ กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ");
    }
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) return toast.error("รหัสผ่านใหม่ไม่ตรงกัน");
    setLoading(true);
    const { error } = await localAuth.resetPassword({ email: resetEmail, password: newPassword });
    setLoading(false);
    if (error) return toast.error("รีเซ็ตรหัสผ่านไม่สำเร็จ: " + error.message);
    toast.success("ตั้งรหัสผ่านใหม่แล้ว");
    navigate({ to: "/dashboard" });
  }

  async function googleSignIn() {
    toast.info("โหมด local storage ยังไม่เชื่อมต่อ Google");
  }

  return (
    <div className="night-bg flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <Link to="/" className="mb-6 font-display text-xl font-bold">
        <span className="gold-text">NIGHT</span>LIST
      </Link>
      <div className="luxe-card w-full max-w-md p-6">
        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="signin">เข้าสู่ระบบ</TabsTrigger>
            <TabsTrigger value="signup">สมัครสมาชิก</TabsTrigger>
            <TabsTrigger value="reset">ลืมรหัส</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={signIn} className="mt-4 space-y-4">
              <div>
                <Label htmlFor="email">อีเมล</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="password">รหัสผ่าน</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                เข้าสู่ระบบ
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={signUp} className="mt-4 space-y-4">
              <div>
                <Label>ประเภทบัญชี</Label>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {(["customer", "shop", "pr", "agency"] as Role[]).map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setRole(r)}
                      className={`rounded-lg border px-2 py-2 text-xs transition-colors ${
                        role === r
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      {ROLES[r]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="name">ชื่อที่แสดง</Label>
                <Input
                  id="name"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="email2">อีเมล</Label>
                <Input
                  id="email2"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="password2">รหัสผ่าน</Label>
                <Input
                  id="password2"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <label className="flex items-start gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={ageOk}
                  onChange={(e) => setAgeOk(e.target.checked)}
                  className="mt-0.5"
                />
                ฉันมีอายุ 17 ปีขึ้นไป ยอมรับเงื่อนไขการใช้งาน
                และรับทราบว่าห้ามใช้แพลตฟอร์มเพื่อบริการผิดกฎหมาย
              </label>
              <Button type="submit" className="w-full" disabled={loading}>
                สมัครสมาชิก
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="reset">
            <form onSubmit={resetPassword} className="mt-4 space-y-4">
              <div>
                <Label htmlFor="reset-email">อีเมล</Label>
                <Input
                  id="reset-email"
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="new-password">รหัสผ่านใหม่</Label>
                <Input
                  id="new-password"
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">ยืนยันรหัสผ่านใหม่</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                รีเซ็ตรหัสผ่าน
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> หรือ <span className="h-px flex-1 bg-border" />
        </div>
        <Button variant="outline" className="w-full" onClick={googleSignIn}>
          ดำเนินการต่อด้วย Google
        </Button>
      </div>
    </div>
  );
}
