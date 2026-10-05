import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// สร้างรอบนับใหม่ — ตัวอย่าง: นับกลุ่ม A ทั้งหมดของสาขาที่ระบุ
export async function POST(req: Request) {
  const branch = await db.branch.findFirst();
  if (!branch) return NextResponse.json({ error: "ยังไม่มีสาขาในระบบ — รอ sync job ดึงข้อมูลก่อน" }, { status: 400 });

  const aProducts = await db.product.findMany({ where: { abcClass: "A" }, include: { lots: true } });
  const session = await db.countSession.create({
    data: {
      branchId: branch.id,
      scopeLabel: "กลุ่ม A ทั้งหมด",
      lines: {
        create: aProducts.flatMap((p) =>
          p.lots.map((lot) => ({ productId: p.id, lotId: lot.id, systemQty: 0 }))
        ),
      },
    },
  });
  return NextResponse.json(session);
}

// บันทึกผลนับของแต่ละบรรทัด แล้วสร้าง StockMovement ประเภท COUNT_ADJUST สำหรับส่วนต่าง
export async function PATCH(req: Request) {
  const { lineId, countedQty } = await req.json();
  const line = await db.countLine.update({ where: { id: lineId }, data: { countedQty } });
  const diff = countedQty - line.systemQty;
  if (diff !== 0) {
    await db.stockMovement.create({
      data: {
        type: "COUNT_ADJUST",
        productId: line.productId,
        lotId: line.lotId,
        qty: diff,
        occurredAt: new Date(),
      },
    });
  }
  return NextResponse.json({ ok: true, diff });
}
