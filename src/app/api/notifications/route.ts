import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

// گرفتن اعلان‌های خوانده نشده
export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("caterie_session")?.value;

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const notifications = await prisma.notification.findMany({
      where: { userId, isRead: false },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // تبدیل به فرمتی که کامپوننت انتظار دارد
    const formatted = notifications.map((n) => ({
      id: n.id,
      title: n.title,
      desc: n.message,
      time: n.createdAt,
      unread: !n.isRead,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

// خواندن همه یا یکی
export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("caterie_session")?.value;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const notificationId = body.id;

    if (notificationId) {
      await prisma.notification.update({
        where: { id: notificationId, userId }, // فقط اعلان خود کاربر
        data: { isRead: true },
      });
    } else {
      await prisma.notification.updateMany({
        where: { userId },
        data: { isRead: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to mark as read" }, { status: 500 });
  }
}