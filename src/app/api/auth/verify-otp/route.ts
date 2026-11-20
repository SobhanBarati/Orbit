import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { otpVerifyLimiter } from "@/lib/rate-limit";
import { cookies } from "next/headers";
import { emailSchema, otpSchema } from "@/lib/validations"; // 👈 ایمپورت اسکیماها

export async function POST(req: Request) {
  try {
    // ۱. چک کردن محدودیت
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success } = await otpVerifyLimiter.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 }
      );
    }

    const { email, otp } = await req.json();

    // 👇 ۲. اعتبارسنجی ایمیل و کد
    const emailValidation = emailSchema.safeParse(email);
    if (!emailValidation.success) {
      return NextResponse.json(
        { error: emailValidation.error.issues[0].message }, 
        { status: 400 }
      );
    }

    const otpValidation = otpSchema.safeParse(otp);
    if (!otpValidation.success) {
      return NextResponse.json(
        { error: otpValidation.error.issues[0].message }, 
        { status: 400 }
      );
    }

    // ۳. بررسی وجود کاربر
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.otp !== otp) {
      return NextResponse.json({ error: "Invalid security code" }, { status: 400 });
    }
    if (user.otpExpiresAt && new Date() > new Date(user.otpExpiresAt)) {
      return NextResponse.json({ error: "Security code has expired" }, { status: 400 });
    }

    // ۴. ذخیره زمان لاگین و پاک کردن کد
    await prisma.user.update({
      where: { email },
      data: { 
        otp: null, 
        otpExpiresAt: null,
        lastLoginAt: new Date()
      },
    });

    const cookieStore = await cookies();
    cookieStore.set("caterie_session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({ success: true, message: "Logged in successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}