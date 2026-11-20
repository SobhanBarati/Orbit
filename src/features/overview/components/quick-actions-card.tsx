"use client";

import { CalendarPlus, FileDown, Settings } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { RequestLeaveModal } from "@/features/payroll/components/request-leave-modal";

interface QuickActionsCardProps {
  user: any;
}

export function QuickActionsCard({ user }: QuickActionsCardProps) {
  const router = useRouter();

  const handleDownloadPayslip = () => {
    if (!user) return;
    const monthlySalary = user.baseSalary ? Math.round(user.baseSalary / 12) : 0;
    const currentDate = new Date();
    const csvContent = `Name,Role,Email,Base Salary,Monthly Salary,Month\n"${user.name}","${user.role}","${user.email}",$${user.baseSalary || 0},$${monthlySalary},${format(currentDate, "MMMM yyyy")}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Payslip_${user.name.replace(" ", "_")}_${format(currentDate, "MMM_yyyy")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="rounded-[32px] border-none shadow-sm bg-card border-border p-5 flex flex-col transition-colors">
      <h3 className="font-bold text-[14px] text-foreground mb-4">Quick Actions</h3>
      
      <div className="flex flex-col gap-2.5">
        
        {/* دکمه درخواست مرخصی - هماهنگ با تم */}
        <div className="w-full [&>button]:w-full [&>button]:justify-start [&>button]:bg-primary/10 [&>button]:text-primary [&>button]:hover:bg-primary/20 [&>button]:px-4 [&>button]:py-3 [&>button]:rounded-2xl [&>button]:gap-3 [&>button]:text-sm [&>button]:font-bold [&>button]:transition-colors [&>button]:border [&>button]:border-primary/20">
          <RequestLeaveModal />
        </div>

        {/* دکمه دانلود فیش حقوقی - استایل خنثی با هاور نارنجی */}
        <button 
          onClick={handleDownloadPayslip}
          className="w-full flex items-center gap-3 px-4 py-3 bg-muted/50 hover:bg-muted rounded-2xl transition-colors text-left border border-border group"
        >
          <div className="p-1.5 bg-background rounded-lg shadow-sm border border-border group-hover:border-primary/30 transition-colors">
            <FileDown className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Download Payslip</span>
        </button>

        {/* دکمه تنظیمات - استایل خنثی با هاور نارنجی */}
        <button 
          onClick={() => router.push("/settings")}
          className="w-full flex items-center gap-3 px-4 py-3 bg-muted/50 hover:bg-muted rounded-2xl transition-colors text-left border border-border group"
        >
          <div className="p-1.5 bg-background rounded-lg shadow-sm border border-border group-hover:border-primary/30 transition-colors">
            <Settings className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Account Settings</span>
        </button>
      </div>
    </Card>
  );
}