import Topbar from "@/components/shared/topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 transition-colors">
      <Topbar />
      {/* 👇 پدینگ ریسپانسیو برای موبایل و دسکتاپ */}
      <main className="max-w-[1400px] mx-auto px-4 md:px-8 pb-12 w-full mt-4 md:mt-0">
        {children}
      </main>
    </div>
  );
}