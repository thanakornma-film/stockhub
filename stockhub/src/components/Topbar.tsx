export default function Topbar() {
  return (
    <header className="bg-[var(--navy)] text-white flex items-center gap-4 px-4.5 py-2.5 sticky top-0 z-10">
      <div className="font-bold text-[16px] flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-sm bg-[#4FC3F7] inline-block" />
        StockHub
      </div>
      <select className="bg-[#0E4B72] border border-[#1A5C87] text-white rounded px-2.5 py-1.5 text-[13px]">
        <option>ทุกสาขา</option>
        <option>00003 · PT Max Park Salaya</option>
        <option>00004 · พีที บางบัวทอง 4</option>
      </select>
      <input
        placeholder="ค้นหาสินค้า, รหัส, เลขใบโอน..."
        className="flex-1 max-w-[420px] bg-[#0E4B72] border border-[#1A5C87] rounded px-2.5 py-1.5 text-[13px] text-white placeholder:text-[#9FC5DE]"
      />
      <span className="ml-auto text-[12px] text-[#9FE6B0]">● ซิงก์ข้อมูลจาก Arincare ล่าสุด 2 นาทีที่แล้ว</span>
      <div className="w-[30px] h-[30px] rounded-full bg-[#4FC3F7] text-[#06304B] flex items-center justify-center font-bold text-[13px]">สม</div>
    </header>
  );
}
