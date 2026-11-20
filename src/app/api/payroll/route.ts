import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // ۱. احراز هویت کاربر
    const cookieStore = await cookies();
    const userId = cookieStore.get("caterie_session")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({ where: { id: userId } });

    // ۲. چک کردن دسترسی (فقط HR اجازه دیدن لیست حقوق کل را دارد)
    if (currentUser?.accessLevel !== "HR") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    // ۳. واکشی تمام کاربران از دیتابیس
    const users = await prisma.user.findMany({
      orderBy: { joinedAt: "desc" },
    });

    // ۴. پردازش دیتا برای نمایش در جدول (بدون دیتای فیک)
    const payrollData = users.map((user) => {
      // استفاده از حقوق واقعی ثبت شده در دیتابیس
      const baseSalary = user.baseSalary || 0;
      
      // محاسبه پاداش (مثلاً ۸ درصد حقوق پایه)
      const bonus = Math.round(baseSalary * 0.08);
      
      return {
        ...user,
        salary: baseSalary > 0 ? `$${baseSalary.toLocaleString()}` : "Not Set",
        bonus: bonus > 0 ? `$${bonus.toLocaleString()}` : "—",
        paymentStatus: baseSalary > 0 ? "Paid" : "Pending", // اگر حقوق ثبت نشده باشه، در انتظار پرداخت میمونه
      };
    });

    return NextResponse.json(payrollData);
  } catch (error) {
    console.error("Payroll API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payroll data" },
      { status: 500 }
    );
  }
}