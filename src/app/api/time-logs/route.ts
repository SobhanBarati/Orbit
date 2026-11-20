import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { startOfDay, endOfDay } from "date-fns";
import { generalApiLimiter } from "@/lib/rate-limit";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("caterie_session")?.value;

    if (!userId) return NextResponse.json({ duration: 0, overtime: 0 });

    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    const todayLog = await prisma.timeLog.findFirst({
      where: {
        userId: userId,
        date: { gte: todayStart, lte: todayEnd },
      },
    });

    return NextResponse.json({ 
      duration: todayLog?.duration || 0,
      overtime: todayLog?.overtime || 0
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch time" }, { status: 500 });
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

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { duration } = body; 

    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    const existingLog = await prisma.timeLog.findFirst({
      where: {
        userId: userId,
        date: { gte: todayStart, lte: todayEnd },
      },
    });

    const standardWorkMinutes = 480; 
    const calculatedOvertime = Math.max(0, Math.floor(duration) - standardWorkMinutes);

    let timeLog;
    if (existingLog) {
      const safeDuration = Math.max(existingLog.duration, Math.floor(duration));
      const safeOvertime = Math.max(existingLog.overtime || 0, calculatedOvertime);
      
      timeLog = await prisma.timeLog.update({
        where: { id: existingLog.id },
        data: { 
          duration: safeDuration,
          overtime: safeOvertime
        },
      });
    } else {
      timeLog = await prisma.timeLog.create({
        data: {
          duration: Math.floor(duration),
          overtime: calculatedOvertime,
          date: new Date(),
          userId: userId,
        },
      });
    }
    
    return NextResponse.json(timeLog);
  } catch (error) {
    console.error("Time log error:", error);
    return NextResponse.json({ error: "Failed to save time log" }, { status: 500 });
  }
}