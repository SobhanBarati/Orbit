import { Card } from "@/components/ui/card";

// تعریف ساختار دیتایی که از دیتابیس می‌آید
interface ProfileCardProps {
  user?: any; 
}

export function ProfileCard({ user }: ProfileCardProps) {
  // محاسبه حقوق ماهانه (تقسیم حقوق سالانه بر ۱۲)
  const monthlySalary = user?.baseSalary 
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(user.baseSalary / 12)
    : "$4,850"; // مقدار پیش‌فرض در صورت خالی بودن دیتابیس

  // جایگذاری مقادیر واقعی یا پیش‌فرض
  const name = user?.name || "Mira Okafor";
  const role = user?.role || "Product Designer";
  // اگر کاربر آواتار داشت نمایش می‌دهد، در غیر این صورت عکس پیش‌فرض را لود می‌کند
  const avatarUrl = user?.avatar || "https://images.unsplash.com/photo-1531123897727-8f129e1bf98a?q=80&w=600&auto=format&fit=crop";

  return (
    <Card className="rounded-[32px] overflow-hidden border-none shadow-sm bg-white p-2">
      <div className="w-full h-56 rounded-[24px] overflow-hidden relative bg-zinc-100">
        <img 
          src={avatarUrl} 
          alt={name} 
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end z-20">
          <div className="text-white drop-shadow-md">
            <h3 className="font-medium text-lg">{name}</h3>
            <p className="text-sm opacity-90">{role}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-sm border border-white/30 shadow-sm">
            {monthlySalary}
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none z-10" />
      </div>
    </Card>
  );
}