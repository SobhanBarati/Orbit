import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { uploadLimiter } from "@/lib/rate-limit"; // 👈 ایمپورت لیمیتر آپلود

export async function POST(req: Request) {
  // 👇 چک کردن محدودیت آپلود
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const { success } = await uploadLimiter.limit(ip);
  if (!success) {
    return NextResponse.json(
      { error: "Too many uploads. Please try again later." }, 
      { status: 429 }
    );
  }

  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("caterie_session")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 👇 محدودیت سایز فایل (۲ مگابایت) برای جلوگیری از آپلود فایل‌های حجیم
    const MAX_FILE_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size exceeds 2MB limit" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = join(process.cwd(), "public/uploads");
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // پوشه از قبل وجود داره
    }

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = `${userId}-${uniqueSuffix}-${file.name.replace(/\s+/g, "_")}`;
    const filepath = join(uploadDir, filename);

    await writeFile(filepath, buffer);

    const publicUrl = `/uploads/${filename}`;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatar: publicUrl },
    });

    return NextResponse.json({ success: true, avatar: publicUrl, user: updatedUser });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}