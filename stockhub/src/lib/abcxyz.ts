/**
 * คำนวณกลุ่ม ABC-XYZ และจุดสั่งซื้อ (ROP) — ตรรกะเดียวกับโมเดล Excel ที่ออกแบบไว้ก่อนหน้านี้
 * ใช้ CurrentStock + StockMovement (ประวัติ 8-12 สัปดาห์) เป็น input
 */

export function classifyABC(valuesDesc: { sku: string; value: number }[]) {
  const total = valuesDesc.reduce((s, v) => s + v.value, 0);
  let cum = 0;
  return valuesDesc.map((v) => {
    cum += v.value;
    const share = total ? cum / total : 0;
    const cls = share <= 0.8 ? "A" : share <= 0.95 ? "B" : "C";
    return { sku: v.sku, abcClass: cls };
  });
}

export function classifyXYZ(weeklyDemand: { sku: string; values: number[] }[]) {
  return weeklyDemand.map(({ sku, values }) => {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
    const cv = mean ? Math.sqrt(variance) / mean : 0;
    const cls = cv <= 0.5 ? "X" : cv <= 1.0 ? "Y" : "Z";
    return { sku, xyzClass: cls, cv };
  });
}

const Z_SCORE: Record<string, number> = {
  AX: 2.33, AY: 2.05, AZ: 1.88,
  BX: 1.88, BY: 1.65, BZ: 1.48,
  CX: 1.41, CY: 1.28, CZ: 1.04,
};

export function reorderPoint(opts: {
  group: string; dailyDemandAvg: number; dailyDemandSd: number;
  leadTimeDaysAvg: number; leadTimeDaysSd: number;
}) {
  const z = Z_SCORE[opts.group] ?? 1.65;
  const safetyStock = z * Math.sqrt(
    opts.leadTimeDaysAvg * opts.dailyDemandSd ** 2 +
    opts.dailyDemandAvg ** 2 * opts.leadTimeDaysSd ** 2
  );
  const rop = opts.dailyDemandAvg * opts.leadTimeDaysAvg + safetyStock;
  return { safetyStock: Math.round(safetyStock), rop: Math.round(rop) };
}
