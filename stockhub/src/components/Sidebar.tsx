"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { group: "ภาพรวม", items: [{ href: "/", label: "แดชบอร์ด" }] },
  { group: "การโอนย้าย", items: [
    { href: "/ai-suggestions", label: "คำแนะนำโอนย้าย (AI)" },
    { href: "/transfers", label: "ใบโอนสินค้า" },
  ]},
  { group: "สินค้าคงคลัง", items: [
    { href: "/abc-xyz", label: "รายงาน ABC-XYZ" },
    { href: "/expiry", label: "สินค้าใกล้หมดอายุ" },
    { href: "/stock-count", label: "ตรวจนับสต็อก" },
  ]},
  { group: "ระบบ", items: [{ href: "/settings/sync", label: "การเชื่อมต่อ Arincare" }] },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <nav className="w-[210px] shrink-0 bg-white border-r border-[var(--border)] py-3.5 hidden md:block">
      {NAV.map((g) => (
        <div key={g.group}>
          <div className="text-[11px] text-[var(--sub)] px-4 pt-3.5 pb-1">{g.group}</div>
          {g.items.map((it) => {
            const active = pathname === it.href;
            return (
              <Link
                key={it.href}
                href={it.href}
                className={`flex items-center gap-2.5 px-4 py-2.5 text-[13.5px] border-l-[3px] ${
                  active
                    ? "bg-[#EAF3FB] border-[var(--blue)] text-[var(--blue-d)] font-semibold"
                    : "border-transparent text-[var(--ink)]"
                }`}
              >
                <span className={`w-2 h-2 rounded-sm ${active ? "bg-[var(--blue)]" : "bg-[var(--border)]"}`} />
                {it.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
