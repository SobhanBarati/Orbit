import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { subDays, startOfDay, endOfDay, format, isSameDay } from "date-fns";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("caterie_session")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = subDays(new Date(), 6 - i);
      return startOfDay(d);
    });

    const logs = await prisma.timeLog.findMany({
      where: {
        userId: userId,
        date: {
          gte: days[0],
          lte: endOfDay(days[6]),
        },
      },
    });

    let totalMinutes = 0;

    const dailyStats = days.map((dayDate, index) => {
      const dayLogs = logs.filter((l) => isSameDay(new Date(l.date), dayDate));
      const dayTotalMinutes = dayLogs.reduce((sum, log) => sum + log.duration, 0);
      totalMinutes += dayTotalMinutes;

      return {
        id: index + 1,
        date: dayDate,
        label: format(dayDate, "eeeee"),
        dayTotalMinutes,
      };
    });

    const avgMinutes = totalMinutes / 7;
    const avgHours = (avgMinutes / 60).toFixed(1);

    const maxMinutes = Math.max(...dailyStats.map((d) => d.dayTotalMinutes), 1);

    const chartDays = dailyStats.map((stat, i) => {
      let type = "normal";
      const percent = Math.min((stat.dayTotalMinutes / maxMinutes) * 100, 100);

      if (stat.dayTotalMinutes === 0) {
        type = "empty";
      } else if (i === 6) {
        type = "active";
      } else if (stat.dayTotalMinutes === maxMinutes) {
        type = "highlight";
      }

      const hrs = Math.floor(stat.dayTotalMinutes / 60);
      const mins = stat.dayTotalMinutes % 60;
      const tooltip =
        type === "active" || type === "highlight"
          ? `${hrs}h ${mins.toString().padStart(2, "0")}m`
          : undefined;

      return {
        id: stat.id,
        label: stat.label,
        value: type === "empty" ? 0 : percent,
        type: type,
        tooltip: tooltip,
      };
    });

    return NextResponse.json({
      average: avgHours,
      label: "Avg. workday\nlast 7 days",
      days: chartDays,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch progress data" }, { status: 500 });
  }
}