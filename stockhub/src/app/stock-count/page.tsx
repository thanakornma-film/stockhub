import { db } from "@/lib/db";

export default async function StockCount() {
  const sessions = await db.countSession.findMany({
    where: { status: "OPEN" },
    include: { lines: { include: { product: true } } },
    take: 5,
  });

  return (
    <section>
      <h1 className="text-[19px] font-bold mb-0.5">ตรวจนับสต็อก</h1>
      <p className="text-[var(--sub)] text-[13px] mb-4.5">
        รอบนับแบบ Cycle Count — ความถี่อิงกลุ่ม ABC-XYZ: กลุ่ม A ทุกสัปดาห์ / B ทุก 2 สัปดาห์ / C ทุกเดือน
      </p>

      <form action="/api/stock-count" method="post" className="bg-white border border-[var(--border)] rounded-md p-4 mb-5">
        <button className="bg-[var(--blue)] text-white rounded px-3.5 py-1.5 text-[13px] font-semibold">
          + เริ่มรอบนับใหม่
        </button>
      </form>

      {sessions.length === 0 && (
        <p className="text-[13px] text-[var(--sub)]">ยังไม่มีรอบนับที่เปิดอยู่</p>
      )}

      {sessions.map((s) => (
        <div key={s.id} className="bg-white border border-[var(--border)] rounded-md mb-4">
          <div className="px-4 py-3 border-b border-[var(--border)] font-bold text-[14.5px]">
            {s.scopeLabel} · {s.lines.filter((l) => l.countedQty != null).length}/{s.lines.length} นับแล้ว
          </div>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[var(--sub)] text-[12px]">
                <th className="px-4 py-2">สินค้า</th><th className="px-4 py-2">ระบบ</th>
                <th className="px-4 py-2">นับได้</th><th className="px-4 py-2">ส่วนต่าง</th>
              </tr>
            </thead>
            <tbody>
              {s.lines.map((l) => {
                const diff = l.countedQty == null ? null : l.countedQty - l.systemQty;
                return (
                  <tr key={l.id} className="border-t border-[#F0F0F0]">
                    <td className="px-4 py-2">{l.product.name}</td>
                    <td className="px-4 py-2">{l.systemQty}</td>
                    <td className="px-4 py-2">{l.countedQty ?? "—"}</td>
                    <td className={`px-4 py-2 font-semibold ${diff && diff !== 0 ? "text-[var(--red)]" : "text-[var(--green)]"}`}>
                      {diff == null ? "ยังไม่นับ" : diff}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </section>
  );
}
