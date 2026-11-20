"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";

interface ProfileSidebarProps {
  user?: any;
}

export function ProfileSidebar({ user }: ProfileSidebarProps) {
  const [openSection, setOpenSection] = useState<string | null>("Compensation");

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const monthlySalary = user?.baseSalary
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(user.baseSalary / 12)
    : "—";

  const formattedSalary = user?.baseSalary
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(user.baseSalary)
    : "Not Set";

  const formattedDate = user?.nextReviewDate
    ? format(new Date(user.nextReviewDate), "MMM dd, yyyy")
    : "Not Set";

  const name = user?.name || "New User";
  const role = user?.role || "Employee";
  const avatarUrl = user?.avatar || null; 

  const sections = ["Pension plan", "Devices", "Compensation", "Benefits"];

  return (
    <Card className="rounded-[32px] overflow-hidden border-none shadow-sm bg-white dark:bg-zinc-900 p-2 flex flex-col transition-colors relative">
      
      <div className="w-full h-56 rounded-[24px] overflow-hidden relative bg-zinc-100 dark:bg-zinc-800 shrink-0 flex items-center justify-center">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="absolute inset-0 w-full h-full object-cover z-0" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-200 dark:bg-zinc-800 text-zinc-400 text-5xl font-medium z-0">
            {name.charAt(0)}
          </div>
        )}
        
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

      <div className="px-4 py-2 mt-2">
        {sections.map((section, index) => {
          const isOpen = openSection === section;
          const isCompensation = section === "Compensation";
          const isLast = index === sections.length - 1;

          return (
            <div key={section} className={`flex flex-col ${!isLast ? 'border-b border-zinc-100 dark:border-zinc-800' : ''}`}>
              <button
                onClick={() => toggleSection(section)}
                className="flex justify-between items-center py-4 w-full group transition-colors"
              >
                <span className={`text-[14px] ${isCompensation && isOpen ? 'text-zinc-900 dark:text-zinc-100 font-medium' : 'text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100'}`}>
                  {section}
                </span>
                <div className="text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isOpen && isCompensation && (
                <div className="pb-5 pt-1 space-y-3.5 animate-in slide-in-from-top-2 fade-in duration-200">
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] text-zinc-500 dark:text-zinc-400">Base, yearly</span>
                    <span className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100">{formattedSalary}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] text-zinc-500 dark:text-zinc-400">Next review</span>
                    <span className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100">{formattedDate}</span>
                  </div>
                </div>
              )}

              {/* 👇 نمایش داینامیک برای دستگاه‌ها */}
              {isOpen && section === "Devices" && (
                <div className="pb-5 pt-1 text-[13px] text-zinc-600 dark:text-zinc-300 animate-in slide-in-from-top-2 fade-in duration-200">
                  <p>{user?.devices || "No device assigned"}</p>
                  <p className="text-zinc-400 dark:text-zinc-500 text-[11px] mt-1">Assigned by IT</p>
                </div>
              )}

              {/* 👇 نمایش داینامیک برای بازنشستگی */}
              {isOpen && section === "Pension plan" && (
                <div className="pb-5 pt-1 text-[13px] text-zinc-600 dark:text-zinc-300 animate-in slide-in-from-top-2 fade-in duration-200">
                  <p>{user?.pensionPlan || "No pension plan"}</p>
                </div>
              )}

              {/* 👇 نمایش داینامیک برای مزایا */}
              {isOpen && section === "Benefits" && (
                <div className="pb-5 pt-1 text-[13px] text-zinc-600 dark:text-zinc-300 animate-in slide-in-from-top-2 fade-in duration-200">
                  <p>{user?.benefits || "No benefits assigned"}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}