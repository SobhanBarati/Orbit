// lib/validations.ts
import { z } from "zod";

// 👇 اسکیمای ایمیل با پیام‌های خطای واضح
export const emailSchema = z.string()
  .min(1, "Email is required")
  .email("Please enter a valid email address");

// 👇 اسکیمای OTP (کد ۶ رقمی)
export const otpSchema = z.string()
  .length(6, "OTP must be exactly 6 digits")
  .regex(/^\d+$/, "OTP must contain only numbers");

// 👇 اسکیمای ثبت‌نام
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: emailSchema,
  role: z.string().optional(),
  team: z.string().optional(),
  location: z.string().optional(),
  accessLevel: z.enum(["EMPLOYEE", "HR"]).optional(),
  hrCode: z.string().optional(),
});