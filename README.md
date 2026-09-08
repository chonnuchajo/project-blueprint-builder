# Project Blueprint Builder

ต้องการให้สร้างระบบ จากไฟล์ PRD ที่แนบไป

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/86680cb6-a78d-4271-8b62-187e101af1d6).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Super User

สร้างบัญชีใช้งานที่มีสิทธิ์ครบทุกกลุ่ม (`shop`, `pr`, `agency`, `admin`) ผ่าน Supabase Admin API:

```powershell
$env:SUPABASE_URL="https://mbiekqsxqrlrtnxjlicb.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
$env:SUPER_USER_EMAIL="admin@example.com"
$env:SUPER_USER_PASSWORD="<strong-password>"
$env:SUPER_USER_DISPLAY_NAME="Super Admin"
npm run create:super-user
```

บัญชีนี้ไม่ใช่ bypass ลับใน client; script ต้องใช้ service role key ฝั่ง trusted environment เท่านั้น.
