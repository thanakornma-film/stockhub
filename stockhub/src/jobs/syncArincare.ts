/**
 * Sync job — ดึงข้อมูลสต็อกจาก Arincare มาเก็บเป็น StockMovement ในฐานข้อมูลของเรา
 *
 * ทุก 5-15 นาที (ตั้ง cron/scheduler ของ hosting เรียก endpoint /api/sync หรือรันไฟล์นี้ตรง ๆ)
 *
 * วิธีดึงข้อมูลขึ้นกับว่า Arincare เปิดช่องทางไหนให้ — ต้องยืนยันกับทีม Arincare ก่อน:
 *   1) Webhook/API จริง (ดีที่สุด)         -> เปลี่ยน fetchFromArincare() ให้เรียก API นั้น
 *   2) ไม่มี API: ใช้ headless browser ไป "Export รายงาน" เป็นรอบ (เสี่ยงพังถ้า Arincare เปลี่ยน UI)
 *   3) นำเข้าไฟล์ Excel ด้วยมือ            -> ดู /api/stock-count/import-csv เป็นตัวอย่าง pattern
 *
 * ไฟล์นี้เป็น "จุดเสียบ" (adapter) — ส่วน business logic อื่น ๆ ในระบบไม่ต้องรู้ว่าข้อมูลมาทางไหน
 */
import { PrismaClient, MovementType } from "@prisma/client";

const prisma = new PrismaClient();

type ArincareMovement = {
  refId: string;          // เลขอ้างอิงจาก Arincare — ใช้กันข้อมูลซ้ำ
  type: "RECEIPT" | "SALE" | "TRANSFER_OUT" | "TRANSFER_IN" | "COUNT_ADJUST";
  sku: string;
  lotNo: string;
  qty: number;
  fromBranchCode?: string;
  toBranchCode?: string;
  occurredAt: string;
};

async function fetchFromArincare(sinceISO: string): Promise<ArincareMovement[]> {
  // TODO: แทนที่ด้วยการเรียก Arincare API จริง เมื่อได้รับการยืนยันช่องทางจากทีม Arincare
  // ตัวอย่าง: const res = await fetch(`${process.env.ARINCARE_API_URL}/movements?since=${sinceISO}`, {
  //   headers: { Authorization: `Bearer ${process.env.ARINCARE_API_KEY}` }
  // });
  return [];
}

export async function runSync() {
  const last = await prisma.stockMovement.findFirst({ orderBy: { occurredAt: "desc" } });
  const since = last?.occurredAt.toISOString() ?? new Date(0).toISOString();

  const movements = await fetchFromArincare(since);

  for (const m of movements) {
    const existing = await prisma.stockMovement.findUnique({ where: { arincareRefId: m.refId } });
    if (existing) continue; // กันซิงก์ซ้ำ

    const product = await prisma.product.upsert({
      where: { sku: m.sku },
      update: {},
      create: { sku: m.sku, name: m.sku, unit: "หน่วย" },
    });
    const lot = await prisma.lot.upsert({
      where: { productId_lotNo: { productId: product.id, lotNo: m.lotNo } },
      update: {},
      create: { productId: product.id, lotNo: m.lotNo },
    });

    const fromBranch = m.fromBranchCode
      ? await prisma.branch.upsert({ where: { code: m.fromBranchCode }, update: {}, create: { code: m.fromBranchCode, name: m.fromBranchCode } })
      : null;
    const toBranch = m.toBranchCode
      ? await prisma.branch.upsert({ where: { code: m.toBranchCode }, update: {}, create: { code: m.toBranchCode, name: m.toBranchCode } })
      : null;

    await prisma.stockMovement.create({
      data: {
        arincareRefId: m.refId,
        type: m.type as MovementType,
        productId: product.id,
        lotId: lot.id,
        qty: m.qty,
        fromBranchId: fromBranch?.id,
        toBranchId: toBranch?.id,
        occurredAt: new Date(m.occurredAt),
      },
    });

    // อัปเดตยอดคงเหลือปัจจุบัน (CurrentStock) ตาม movement นี้
    const branchForQty = m.type === "TRANSFER_OUT" || m.type === "SALE" ? fromBranch : toBranch;
    if (branchForQty) {
      await prisma.currentStock.upsert({
        where: { productId_lotId_branchId: { productId: product.id, lotId: lot.id, branchId: branchForQty.id } },
        update: { qty: { increment: m.qty } },
        create: { productId: product.id, lotId: lot.id, branchId: branchForQty.id, qty: m.qty },
      });
    }
  }

  return { synced: movements.length, since };
}

if (require.main === module) {
  runSync().then((r) => {
    console.log(`Synced ${r.synced} movements since ${r.since}`);
    process.exit(0);
  });
}
