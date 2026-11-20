"use client";

import { ArrowUpRight, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useProgress } from "../api/use-progress";
import { motion } from "framer-motion";

export function ProgressCard() {
  const { data, isLoading } = useProgress();

  const handleOpenDetailedAnalytics = () => {
    alert("Detailed analytics and historical data will open here.");
  };

  if (isLoading) {
    return (
      <Card className="rounded-[32px] border-none shadow-sm bg-card p-6 relative flex items-center justify-center min-h-[280px]">
        <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
      </Card>
    );
  }

  return (
    <Card className="rounded-[32px] border border-border shadow-sm bg-card text-foreground p-6 relative flex flex-col h-full min-h-[280px]">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-foreground">Progress</h3>
        <button 
          onClick={handleOpenDetailedAnalytics}
          className="p-2 hover:bg-muted rounded-full transition-colors group cursor-pointer"
        >
          <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
        </button>
      </div>

      <div className="flex items-end gap-3 mb-4">
        <div className="text-[40px] leading-none font-bold text-foreground tracking-tight">
          {data?.average} <span className="text-3xl text-muted-foreground">h</span>
        </div>
        <div className="text-[10px] leading-tight text-muted-foreground whitespace-pre-line pb-1">
          {data?.label}
        </div>
      </div>

      <div className="flex-1 flex items-end justify-between px-2 pb-2 mt-auto">
        {data?.days.map((day, index) => {
          let barClasses = "";
          if (day.type === "normal") barClasses = "bg-muted";
          if (day.type === "active") barClasses = "bg-gradient-to-t from-primary to-primary/60 shadow-md";
          if (day.type === "empty") barClasses = "bg-transparent border-2 border-dashed border-border";
          if (day.type === "highlight") barClasses = "bg-gradient-to-t from-primary/80 to-primary/30 shadow-sm";

          return (
            <div key={day.id} className="flex flex-col items-center gap-3 relative group">
              
              {day.tooltip && (
                <div className="absolute -top-9 bg-primary/10 backdrop-blur-sm border border-primary/20 text-primary text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap shadow-sm opacity-100 transition-opacity">
                  {day.tooltip}
                </div>
              )}

              <div className="h-[90px] w-3 flex items-end justify-center relative">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: day.type === "empty" ? "20px" : `${day.value}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1, type: "spring", bounce: 0.3 }}
                  className={`w-full rounded-full cursor-pointer transition-colors ${barClasses} ${
                    day.type !== 'empty' ? 'hover:brightness-110' : ''
                  }`}
                />
              </div>

              <span className={`text-[9px] font-bold uppercase ${day.type === "active" ? "text-primary" : "text-muted-foreground"}`}>
                {day.label}
              </span>
              
              <span className={`w-1 h-1 rounded-full absolute -bottom-3 ${day.type === "active" ? "bg-primary" : "bg-border"}`} />
            </div>
          );
        })}
      </div>
    </Card>
  );
}