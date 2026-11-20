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
    if (!currentUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const events = await prisma.event.findMany({
      where: {
        OR: [
          { visibility: "ALL" },
          { visibility: "TEAM", AND: { creator: { team: currentUser.team } } },
          { visibility: "PRIVATE", creatorId: userId },
        ],
      },
      include: {
        creator: {
          select: {
            name: true,
            avatar: true,
          }
        }
      },
      orderBy: { date: "asc" },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Fetch events error:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
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

    const { title, date, type, location, visibility } = await req.json();

    const newEvent = await prisma.event.create({
      data: {
        title,
        date: new Date(date),
        type,
        location,
        visibility: visibility || "ALL",
        creatorId: userId,
      },
    });

    return NextResponse.json(newEvent);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
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
    const { id, title, date, type, location, visibility } = await req.json();

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

    const isHR = currentUser?.accessLevel === "HR";
    const isCreator = event.creatorId === userId;

    if (!isHR && !isCreator) {
      return NextResponse.json({ error: "You don't have permission to edit this event" }, { status: 403 });
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: { 
        title, 
        date: new Date(date), 
        type, 
        location,
        visibility: visibility || "ALL",
      },
    });
    return NextResponse.json(updatedEvent);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
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
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

    const isHR = currentUser?.accessLevel === "HR";
    const isCreator = event.creatorId === userId;

    if (!isHR && !isCreator) {
      return NextResponse.json({ error: "You don't have permission to delete this event" }, { status: 403 });
    }

    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}