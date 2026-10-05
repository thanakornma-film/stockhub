import { db } from "@/lib/db";
import { Kpi, Badge } from "@/components/Kpi";

export default async function Dashboard() {
  const [pendingSuggestions, lowStockA] = await Promise.all([
    db.transferSuggestion.count({ where: { status: "PENDING" } }),
    db.transferSuggestion.count({ where: { status: "PENDING", reasonCode: "ROP_BREACH" } }),
  ]);
  const nearExpiry = await db.lot.count({
    where: { expiresAt: { lte: new Date(Date.now() + 30 * 86400000) } },
  });
  const suggestions = await db.transferSuggestion.findMany({
    where: { status: "PENDING" },
    include: { product: true },
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  return (
    <section>
      <h1 className="text-[19px] font-bold mb-0.5">แดชบอร์ด</h1>
      <p className="text-[var(--sub)] text-[13px] mb-4.5">ภาพรวมสต็อกและการโอนย้ายทุกสาขา</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Kpi n={pendingSuggestions} l="คำแนะนำโอนย้ายรอดำเนินการ" tone="warn" />
        <Kpi n={nearExpiry} l="ล็อตใกล้หมดอายุ ≤30 วัน" tone="bad" />
        <Kpi n={lowStockA} l="SKU ต่ำกว่าจุดสั่งซื้อ" tone="bad" />
        <Kpi n="—" l="ใบโอนสำเร็จสัปดาห์นี้" tone="good" />
      </div>

      <div className="bg-white border border-[var(--border)] rounded-md">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
          <h2 className="text-[14.5px] font-bold">คำแนะนำโอนด่วน</h2>
          <a href="/ai-suggestions" className="text-[13px] text-[var(--blue-d)]">ดูทั้งหมด →</a>
        </div>
        {suggestions.length === 0 ? (
          <p className="p-4 text-[13px] text-[var(--sub)]">
            ยังไม่มีข้อมูล — ต้องรัน sync job (<code>npm run sync:poll</code>) เพื่อดึงข้อมูลจาก Arincare
            แล้วรันตัวคำนวณ ABC-XYZ ก่อนจึงจะมีคำแนะนำปรากฏที่นี่
          </p>
        ) : (
          <table className="w-full text-[13px]">
            <tbody>
              {suggestions.map((s) => (
                <tr key={s.id} className="border-b border-[#F0F0F0] last:border-0">
                  <td className="px-4 py-2.5"><Badge group={s.product.abcClass + (s.product.xyzClass ?? "")} /></td>
                  <td className="px-4 py-2.5">{s.product.name}</td>
                  <td className="px-4 py-2.5">{s.suggestedQty} {s.product.unit}</td>
                  <td className="px-4 py-2.5 text-[var(--sub)]">{s.reasonText}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
