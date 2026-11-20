"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";

interface EmployeeDetailsProps {
  user?: {
    baseSalary?: number | null;
    nextReviewDate?: Date | null;
  };
}

export function EmployeeDetails({ user }: EmployeeDetailsProps) {
  const [openSection, setOpenSection] = useState<string | null>("Compensation");

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const formattedSalary = user?.baseSalary 
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(user.baseSalary)
    : "Not Set"; // 👈 حذف فیک

  const formattedDate = user?.nextReviewDate
    ? format(new Date(user.nextReviewDate), "MMM dd, yyyy")
    : "Not Set"; // 👈 حذف فیک

  const sections = ["Pension plan", "Devices", "Compensation", "Benefits"];

  return (
    <div className="bg-[#FDFBF7] rounded-[32px] p-6 shadow-sm border border-zinc-100/50 w-full max-w-sm">
      {sections.map((section, index) => {
        const isOpen = openSection === section;
        const isCompensation = section === "Compensation";
        const isLast = index === sections.length - 1;

        return (
          <div key={section} className={`flex flex-col ${!isLast ? 'border-b border-zinc-100/80' : ''}`}>
            <button onClick={() => toggleSection(section)} className="flex justify-between items-center py-4 w-full group transition-colors">
              <span className={`text-[15px] ${isCompensation && isOpen ? 'text-zinc-900 font-medium' : 'text-zinc-600 group-hover:text-zinc-900'}`}>
                {section}
              </span>
              <div className="text-zinc-400 group-hover:text-zinc-600 transition-colors">
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {isOpen && isCompensation && (
              <div className="pb-5 pt-1 space-y-3.5 animate-in slide-in-from-top-2 fade-in duration-200">
                <div className="flex justify-between items-center">
                  <span className="text-[14px] text-zinc-500">Base, yearly</span>
                  <span className="text-[14px] font-medium text-zinc-900">{formattedSalary}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[14px] text-zinc-500">Next review</span>
                  <span className="text-[14px] font-medium text-zinc-900">{formattedDate}</span>
                </div>
              </div>
            )}
            
            {isOpen && !isCompensation && (
              <div className="pb-5 pt-1 text-[13px] text-zinc-400 animate-in slide-in-from-top-2 fade-in duration-200">
                No active plans or details available yet.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}