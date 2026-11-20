import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 👇 ۱. اعتبارسنجی کل ورودی با Zod (اولین و مهم‌ترین قدم)
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      // گرفتن اولین خطای Zod و برگرداندن آن به کاربر
      const firstError = validation.error.issues[0].message;
      return NextResponse.json(
        { error: firstError }, 
        { status: 400 }
      );
    }

    // 👇 ۲. حالا که ورودی معتبره، بقیه کارها رو انجام بده
    const { name, email, role, team, location, accessLevel, hrCode } = validation.data;

    // چک کردن کد HR (فقط اگر accessLevel === "HR" باشد)
    if (accessLevel === "HR") {
      const validCode = process.env.HR_SECRET_CODE || "HR-2026-SECRET";
      if (hrCode !== validCode) {
        return NextResponse.json(
          { error: "Invalid HR invite code." }, 
          { status: 403 }
        );
      }
    }

    // چک کردن وجود کاربر
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists." }, 
        { status: 400 }
      );
    }

    // ساخت کاربر جدید
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        role: role || "Product Designer",
        team: team || "Design",
        location: location || "Remote",
        accessLevel: accessLevel || "EMPLOYEE",
      },
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Registration failed" }, 
      { status: 500 }
    );
  }
}