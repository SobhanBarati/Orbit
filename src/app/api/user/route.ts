import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { generalApiLimiter } from "@/lib/rate-limit";

export async function PUT(req: Request) {
  // 👇 چک کردن محدودیت
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const { success } = await generalApiLimiter.limit(ip);
  if (!success) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  try {
    const cookieStore = await cookies();
    const loggedInUserId = cookieStore.get("caterie_session")?.value;

    if (!loggedInUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const loggedInUser = await prisma.user.findUnique({ where: { id: loggedInUserId } });
    if (!loggedInUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const { id, name, email, baseSalary, nextReviewDate } = body;

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const isHR = loggedInUser.accessLevel === "HR";
    const isUpdatingSelf = loggedInUserId === id;

    if (!isHR) {
      if (!isUpdatingSelf) {
        return NextResponse.json({ error: "You can only edit your own profile" }, { status: 403 });
      }
      
      if (baseSalary !== undefined || nextReviewDate !== undefined) {
        return NextResponse.json({ error: "Only HR can update salary and contract details" }, { status: 403 });
      }
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    
    if (isHR) {
      if (baseSalary !== undefined) updateData.baseSalary = Number(baseSalary);
      if (nextReviewDate !== undefined) updateData.nextReviewDate = nextReviewDate ? new Date(nextReviewDate) : null;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Update User Error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}