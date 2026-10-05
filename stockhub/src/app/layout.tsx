import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export const metadata = { title: "StockHub" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <Topbar />
        <div className="flex min-h-[calc(100vh-50px)]">
          <Sidebar />
          <main className="flex-1 min-w-0 px-6 py-5 pb-12">{children}</main>
        </div>
      </body>
    </html>
  );
}
