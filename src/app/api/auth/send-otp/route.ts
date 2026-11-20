
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { otpSendLimiter } from "@/lib/rate-limit";
import { Resend } from "resend";
import { emailSchema } from "@/lib/validations";
import { randomInt } from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    // ۱. چک کردن محدودیت
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success, limit, reset, remaining } = await otpSendLimiter.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        }
      );
    }

    const { email } = await req.json();

    // ۲. اعتبارسنجی ایمیل با Zod
    const validation = emailSchema.safeParse(email);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const validatedEmail = validation.data;

    // ۳. بررسی وجود کاربر
    const user = await prisma.user.findUnique({
      where: { email: validatedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User with this email not found." },
        { status: 404 }
      );
    }

    // ۴. تولید کد ۶ رقمی امن
    const otp = randomInt(100000, 1000000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // ۵. ذخیره در دیتابیس
    await prisma.user.update({
      where: { email: validatedEmail },
      data: { otp, otpExpiresAt },
    });

    // ۶. ارسال ایمیل با Resend
    const { data, error } = await resend.emails.send({
      from: "Caterie <onboarding@resend.dev>",
      //to: validatedEmail,
      to: "kinglittle966@gmail.com",
      subject: "Your Caterie Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #333;">Your Verification Code</h2>
          <p style="font-size: 16px; color: #555;">Enter this code to sign in to your Caterie account:</p>
          <div style="background: #f5f5f5; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #F59E0B;">${otp}</span>
          </div>
          <p style="font-size: 12px; color: #888;">This code expires in 5 minutes. If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);

      // پاک کردن OTP در صورت شکست ارسال ایمیل
      await prisma.user.update({
        where: { email: validatedEmail },
        data: { otp: null, otpExpiresAt: null },
      });

      return NextResponse.json(
        { error: "Failed to send email. Please try again." },
        { status: 500 }
      );
    }

    console.log(`✅ OTP email sent to ${validatedEmail}. Resend ID: ${data?.id}`);

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Send OTP error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
