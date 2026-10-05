export function Kpi({ n, l, tone }: { n: string | number; l: string; tone?: "good" | "warn" | "bad" }) {
  const color = tone === "good" ? "text-[var(--green)]" : tone === "bad" ? "text-[var(--red)]" : tone === "warn" ? "text-[var(--amber)]" : "";
  return (
    <div className="bg-white border border-[var(--border)] rounded-md p-3.5">
      <div className={`text-2xl font-bold leading-tight ${color}`}>{n}</div>
      <div className="text-[var(--sub)] text-[12.5px] mt-1">{l}</div>
    </div>
  );
}

export function Badge({ group }: { group: string }) {
  const map: Record<string, string> = {
    AX: "bg-[#FDE7D9] text-[#B2460C]", AY: "bg-[#FFF1D6] text-[#A6730A]", AZ: "bg-[#FBE6E5] text-[var(--red)]",
    BX: "bg-[#E6F4EA] text-[var(--green)]", BY: "bg-[#E3F1FB] text-[var(--blue-d)]", BZ: "bg-[#F1E7FB] text-[#6B3FA0]",
    CX: "bg-[#EDEEF0] text-[var(--sub)]", CY: "bg-[#EDEEF0] text-[var(--sub)]", CZ: "bg-[#EDEEF0] text-[var(--sub)]",
  };
  return <span className={`inline-block px-2 py-0.5 rounded text-[11.5px] font-bold ${map[group] ?? ""}`}>{group}</span>;
}
