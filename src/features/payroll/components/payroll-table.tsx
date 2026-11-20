"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { usePayroll } from "../api/use-payroll";

export function PayrollTable() {
  const { data: payrollData, isLoading, isError } = usePayroll();

  if (isLoading) {
    return (
      <div className="w-full mt-6 bg-white dark:bg-zinc-900 rounded-[32px] p-12 flex justify-center items-center transition-colors">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400 dark:text-zinc-600" />
      </div>
    );
  }

  if (isError || !payrollData) {
    return (
      <div className="w-full mt-6 bg-white dark:bg-zinc-900 rounded-[32px] p-6 text-center text-red-500 text-sm">
        Failed to load payroll data.
      </div>
    );
  }

  return (
    <div className="w-full mt-6 bg-white dark:bg-zinc-900 rounded-[32px] p-6 shadow-sm border-none transition-colors">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-zinc-400 dark:text-zinc-500 font-medium border-b border-zinc-100 dark:border-zinc-800 transition-colors">
            <tr>
              <th className="pb-4 pl-4 font-medium w-12"></th>
              <th className="pb-4 font-medium">Employee</th>
              <th className="pb-4 font-medium">Role</th>
              <th className="pb-4 font-medium">Base Salary (Yearly)</th>
              <th className="pb-4 font-medium">Bonus</th>
              <th className="pb-4 pr-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {payrollData.map((record: any) => {
              return (
                <tr 
                  key={record.id} 
                  className="group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300"
                >
                  <td className="py-3 pl-4">
                    <div className="w-4 h-4 rounded border border-zinc-200 dark:border-zinc-700 group-hover:border-zinc-300 dark:group-hover:border-zinc-600" />
                  </td>
                  
                  <td className="py-3 font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
                    <Avatar className="w-8 h-8 border border-black/5 dark:border-white/10">
                      <AvatarImage src={record.avatar || undefined} />
                      <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                        {record.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{record.name}</span>
                  </td>
                  
                  <td className="py-3">{record.role}</td>
                  <td className="py-3 font-medium">{record.salary}</td>
                  <td className="py-3">{record.bonus}</td>
                  
                  <td className="py-3 pr-4">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border
                      ${record.paymentStatus === 'Paid' 
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50'
                        : 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-900/50'}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        record.paymentStatus === 'Paid' ? 'bg-emerald-500' : 'bg-orange-500'
                      }`} />
                      {record.paymentStatus}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}