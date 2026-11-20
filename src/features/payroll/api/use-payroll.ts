import { useQuery } from "@tanstack/react-query";
import { User } from "@prisma/client";

// گسترش تایپ کاربر برای پشتیبانی از فیلدهای مالی که در سرور اضافه کردیم
export interface PayrollRecord extends User {
  salary: string;
  bonus: string;
  paymentStatus: string;
}

export function usePayroll() {
  return useQuery<PayrollRecord[]>({
    queryKey: ["payroll"],
    queryFn: async () => {
      const res = await fetch("/api/payroll");
      if (!res.ok) throw new Error("Failed to fetch payroll");
      return res.json();
    },
  });
}