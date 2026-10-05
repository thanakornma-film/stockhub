// เรียก endpoint นี้จาก scheduler ภายนอก (เช่น Vercel Cron, GitHub Actions cron) ทุก 5-15 นาที
import { runSync } from "@/jobs/syncArincare";
import { NextResponse } from "next/server";

export async function POST() {
  const result = await runSync();
  return NextResponse.json(result);
}
