import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { generalApiLimiter } from "@/lib/rate-limit";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("caterie_session")?.value;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = await prisma.user.findUnique({ where: { id: userId } });
    
    const leaves = await prisma.leave.findMany({
      where: currentUser?.accessLevel === "HR" ? {} : { userId },
      include: { user: { select: { name: true, avatar: true } } },
      orderBy: { startDate: "desc" },
    });

    return NextResponse.json(leaves);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch leaves" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  // 👇 چک کردن محدودیت
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const { success } = await generalApiLimiter.limit(ip);
  if (!success) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("caterie_session")?.value;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { type, startDate, endDate, days } = await req.json();

    const newLeave = await prisma.leave.create({
      data: {
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        days,
        userId,
      },
    });

    const hrUsers = await prisma.user.findMany({ where: { accessLevel: "HR" } });
    const requester = await prisma.user.findUnique({ where: { id: userId } });

    await Promise.all(
      hrUsers.map((hr) =>
        prisma.notification.create({
          data: {
            userId: hr.id,
            title: "New Leave Request",
            message: `${requester?.name} requested ${days} day(s) of ${type} leave.`,
            type: "leave_request",
          },
        })
      )
    );

    return NextResponse.json(newLeave);
  } catch (error) {
    console.error("Create leave error:", error);
    return NextResponse.json({ error: "Failed to create leave" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  // 👇 چک کردن محدودیت
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const { success } = await generalApiLimiter.limit(ip);
  if (!success) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("caterie_session")?.value;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = await prisma.user.findUnique({ where: { id: userId } });
    if (currentUser?.accessLevel !== "HR") {
      return NextResponse.json({ error: "Only HR can approve leaves" }, { status: 403 });
    }

    const { id, status } = await req.json();

    const updatedLeave = await prisma.leave.update({
      where: { id },
      data: { status },
    });

    const isApproved = status === "Approved";
    
    await prisma.notification.create({
      data: {
        userId: updatedLeave.userId,
        title: isApproved ? "Leave Approved" : "Leave Rejected",
        message: `Your ${updatedLeave.type} leave (${updatedLeave.days} days) was ${status.toLowerCase()}.`,
        type: isApproved ? "leave_approved" : "leave_rejected",
      },
    });

    return NextResponse.json(updatedLeave);
  } catch (error) {
    console.error("Update leave error:", error);
    return NextResponse.json({ error: "Failed to update leave" }, { status: 500 });
  }
}