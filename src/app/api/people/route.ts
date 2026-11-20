import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { generalApiLimiter } from "@/lib/rate-limit"; // 👈 ایمپورت لیمیتر

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("caterie_session")?.value;

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = await prisma.user.findUnique({ where: { id: userId } });
    
    if (currentUser?.accessLevel !== "HR") {
       return NextResponse.json([currentUser]); 
    }

    const users = await prisma.user.findMany({
      include: { timeLogs: true },
      orderBy: { joinedAt: 'desc' },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
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
    const body = await req.json();

    const newUser = await prisma.user.create({
      data: {
        name: body.name,
        email: `${body.name.replace(/\s+/g, "").toLowerCase()}@caterie.com`,
        role: body.role,
        team: body.team,
        location: body.location,
        status: "New",
        avatar: `https://i.pravatar.cc/150?u=${body.name}`,
      },
    });

    return NextResponse.json(newUser);
  } catch (error) {
    console.error("Failed to create user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
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
    if (currentUser?.accessLevel !== "HR") {
      return NextResponse.json({ error: "Only HR can edit members" }, { status: 403 });
    }

    const body = await req.json();
    const { id, name, status, role, team, location, baseSalary, nextReviewDate, pensionPlan, devices, benefits } = body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(status && { status }),
        ...(role && { role }),
        ...(team && { team }),
        ...(location && { location }),
        ...(baseSalary !== undefined && { baseSalary }),
        ...(nextReviewDate !== undefined && { nextReviewDate: nextReviewDate ? new Date(nextReviewDate) : null }),
        ...(pensionPlan !== undefined && { pensionPlan }),
        ...(devices !== undefined && { devices }),
        ...(benefits !== undefined && { benefits }),
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}