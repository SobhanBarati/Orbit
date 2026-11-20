import prisma from "@/lib/prisma";
import { TimeTrackerCard } from "@/features/overview/components/time-tracker-card";
import { OnboardingCard } from "@/features/overview/components/onboarding-card";
import { ProgressCard } from "@/features/overview/components/progress-card";
import { ScheduleCard } from "@/features/overview/components/schedule-card";
import { ProfileSidebar } from "@/features/overview/components/profile-sidebar"; 
import { NextEventCard } from "@/features/overview/components/next-event-card";
import { QuickActionsCard } from "@/features/overview/components/quick-actions-card";
import { cookies } from "next/headers";
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";

export default async function OverviewPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("caterie_session")?.value;

  const currentUser = userId
    ? await prisma.user.findUnique({ where: { id: userId } })
    : null;

  const totalUsers = await prisma.user.count();
  const activeUsers = await prisma.user.count({
    where: { OR: [{ status: "Active" }, { status: "New" }] },
  });

  const totalTasks = await prisma.task.count({ where: { userId } });
  const completedTasks = await prisma.task.count({ where: { userId, isCompleted: true } });
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());
  const todayLog = await prisma.timeLog.findFirst({
    where: { userId, date: { gte: todayStart, lte: todayEnd } }
  });
  
  const targetMinutes = 480; 
  const workedMinutes = todayLog?.duration || 0;
  const workProgress = Math.min(100, Math.round((workedMinutes / targetMinutes) * 100));

  // 👇 منطق جدید: تعداد تسک‌های باز (ناتمام) در ماه جاری
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());
  const openTasksThisMonth = await prisma.task.count({
    where: {
      isCompleted: false,
      dueDate: {
        gte: monthStart,
        lte: monthEnd,
      },
    },
  });

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 text-foreground">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Good morning, <span className="bg-gradient-to-l from-primary to-primary/60 bg-clip-text text-transparent">{currentUser?.name?.split(" ")[0] || "there"}</span>
          </h1>

          <div className="flex items-center gap-5 mt-1">
            <div className="flex items-center gap-2">
              <div className="w-20 md:w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${taskProgress}%` }} />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Tasks {taskProgress}%
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-20 md:w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary/60 rounded-full" style={{ width: `${workProgress}%` }} />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Hours {workProgress}%
              </span>
            </div>
          </div>
        </div>

        {/* 👇 کارت‌های آماری: کارت سوم حالا تسک‌های باز رو نشون می‌ده */}
        <div className="grid grid-cols-3 gap-2 w-full md:w-auto">
          <div className="flex flex-col items-center justify-center bg-card/50 backdrop-blur-sm border border-border rounded-xl px-2 py-3 shadow-sm hover:border-primary/30 transition-colors">
            <div className="text-lg md:text-xl font-bold text-foreground leading-none">{totalUsers > 0 ? totalUsers : 0}</div>
            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-1.5">Total</div>
          </div>
          
          <div className="flex flex-col items-center justify-center bg-card/50 backdrop-blur-sm border border-border rounded-xl px-2 py-3 shadow-sm hover:border-primary/30 transition-colors">
            <div className="text-lg md:text-xl font-bold text-primary leading-none">{activeUsers > 0 ? activeUsers : 0}</div>
            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-1.5">Active</div>
          </div>
          
          <div className="flex flex-col items-center justify-center bg-card/50 backdrop-blur-sm border border-border rounded-xl px-2 py-3 shadow-sm hover:border-primary/30 transition-colors">
            <div className="text-lg md:text-xl font-bold text-foreground leading-none">{openTasksThisMonth}</div>
            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-1.5">Open Tasks</div>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
        
        <div className="lg:col-span-3 flex flex-col gap-6">
          <ProfileSidebar user={currentUser} />
          <NextEventCard /> 
          <QuickActionsCard user={currentUser} />
        </div>

        <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProgressCard />
          <TimeTrackerCard />
          <OnboardingCard />
          <ScheduleCard />
        </div>
      </div>
    </div>
  );
}