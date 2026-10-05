# StockHub

เว็บบริหารคลังสินค้า/การโอนย้ายตามหลัก ABC-XYZ สำหรับร้านที่ใช้ Arincare เป็นระบบหลัก
(StockHub ไม่แก้ไขหรือแทนที่ Arincare — เป็นชั้นวางแผนที่อ่านข้อมูลมาคำนวณ แล้วส่งรายการกลับไปคีย์ใน Arincare)

## เริ่มต้นใช้งาน

```bash
npm install
cp .env.example .env        # ใส่ DATABASE_URL ของ Postgres จริง
npx prisma migrate dev      # สร้างตารางตาม prisma/schema.prisma
npm run dev                 # เปิดที่ http://localhost:3000
```

## โครงสร้างสำคัญ

- `prisma/schema.prisma` — โมเดลข้อมูลทั้งหมด (สินค้า, ล็อต, สต็อกปัจจุบัน, ประวัติเคลื่อนไหว, คำแนะนำโอนย้าย, รอบตรวจนับ)
- `src/jobs/syncArincare.ts` — **จุดที่ต้องต่อกับ Arincare จริง** ตอนนี้เป็น stub คืนค่าว่าง ให้แก้ฟังก์ชัน
  `fetchFromArincare()` ให้เรียก API ของ Arincare เมื่อได้รับคำยืนยันช่องทางจากทีม Arincare
- `src/lib/abcxyz.ts` — สูตรจัดกลุ่ม ABC/XYZ และคำนวณ Safety Stock / ROP (ย้ายมาจากโมเดล Excel เดิม)
- `src/app/*` — หน้าเว็บ (Next.js App Router) ตามเมนู: แดชบอร์ด, คำแนะนำโอนย้าย, ใบโอนสินค้า, ABC-XYZ,
  ใกล้หมดอายุ, ตรวจนับสต็อก, การเชื่อมต่อ Arincare

## งานที่ยังไม่ได้ทำ (ต่อใน Claude Code ได้เลย)

1. **หน้า ai-suggestions, transfers, abc-xyz, expiry, settings/sync** — ตอนนี้มีแค่โครง route ว่าง
   ให้ทำตามแพทเทิร์นเดียวกับ `src/app/page.tsx` และ `src/app/stock-count/page.tsx`
   (server component ดึงข้อมูลผ่าน `db` แล้ว render ตาราง)
2. **ระบบ login/สิทธิ์ผู้ใช้** — ยังไม่ได้ใส่ แนะนำ NextAuth.js
3. **ตัวรัน `runSync()` เป็นรอบอัตโนมัติ** — ตั้ง cron เรียก `POST /api/sync` ทุก 5-15 นาที
   (บน Vercel ใช้ Vercel Cron, บนเซิร์ฟเวอร์เองใช้ `node-cron` หรือ systemd timer)
4. **ตัวคำนวณ TransferSuggestion** — ยังไม่มี job ที่รัน `src/lib/abcxyz.ts` แล้วเขียนผลลง
   ตาราง `TransferSuggestion` ต้องสร้างสคริปต์/cron อีกตัวที่รันหลัง sync เสร็จทุกครั้ง
5. **การเชื่อมต่อ Arincare จริง** — ต้องติดต่อทีม Arincare (Line @arincare) ถามว่ามี API/Webhook
   ให้ใช้ไหม ถ้าไม่มีต้องออกแบบตัวดึงรายงานอัตโนมัติแทน (ดูหมายเหตุใน `syncArincare.ts`)

## Deploy

แนะนำ Vercel (ฟรีสำหรับเริ่มต้น) + Postgres จาก Supabase/Neon (มี free tier) —
ทั้งหมดนี้คุยกับ Claude Code ต่อได้เลยว่า "ช่วย deploy โปรเจกต์นี้ขึ้น Vercel ให้หน่อย"
