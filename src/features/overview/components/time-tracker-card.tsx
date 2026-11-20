"use client";

import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, ArrowUpRight, Clock, Loader2, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useTimeLog, useSaveTimeLog } from "../api/use-time-logs";

const formatDuration = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export function TimeTrackerCard() {
  const { data: timeLog, isLoading } = useTimeLog();
  const saveTimeLog = useSaveTimeLog();
  
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (timeLog?.duration) {
      setSeconds(timeLog.duration * 60);
    }
  }, [timeLog]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const handleReset = () => {
    setIsActive(false);
    setSeconds(timeLog?.duration ? timeLog.duration * 60 : 0);
  };

  const handlePause = () => {
    if (!isActive) return;
    setIsActive(false);
    
    const minutesToSave = Math.ceil(seconds / 60);
    if (minutesToSave > 0) {
      saveTimeLog.mutate(minutesToSave);
    }
  };

  if (isLoading) {
    return (
      <Card className="rounded-[32px] border-none shadow-sm bg-card p-6 relative flex items-center justify-center min-h-[280px]">
        <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
      </Card>
    );
  }

  const progress = (seconds % 60) / 60;
  const circleOffset = 464.96 - progress * 464.96;

  return (
    <Card className="rounded-[32px] border-none shadow-sm bg-card border-border text-foreground p-6 relative flex flex-col h-full min-h-[280px]">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          Time tracker
          {saveTimeLog.isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-500 animate-in fade-in" />}
        </h3>
        
        <button className="p-2 hover:bg-muted rounded-full transition-colors group cursor-pointer">
          <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative">
        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="88" cy="88" r="74" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray="6 8" className="text-muted" />
            <circle cx="88" cy="88" r="74" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray="464.96" strokeDashoffset={circleOffset} className="text-primary drop-shadow-sm transition-all duration-1000 ease-linear" strokeLinecap="round" />
          </svg>
          
          <div className="text-center z-10 flex flex-col items-center">
            <span className="text-3xl font-bold text-foreground tracking-tight">
              {formatDuration(seconds)}
            </span>
            <span className={`text-xs font-bold mt-1 flex items-center gap-1 ${isActive ? 'text-emerald-500' : (saveTimeLog.isPending ? 'text-muted-foreground' : 'text-muted-foreground')}`}>
              {saveTimeLog.isPending ? "Saving..." : (isActive ? "Tracking" : "Paused")}
              {isActive && <span className="font-semibold text-emerald-500 animate-pulse">●</span>}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-end mt-4">
        <div className="flex items-center bg-muted/80 rounded-full p-1.5 border border-border gap-1">
          <button 
            onClick={handlePause}
            disabled={saveTimeLog.isPending}
            className={`p-2.5 rounded-full transition-all duration-300 ease-out flex items-center justify-center ${
              !isActive 
                ? 'bg-card text-foreground shadow-sm scale-100' 
                : 'bg-transparent text-muted-foreground hover:bg-muted/70 hover:text-foreground scale-95 hover:scale-100'
            }`}
          >
            {saveTimeLog.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pause className="w-4 h-4 fill-current" />}
          </button>
          
          <button 
            onClick={() => setIsActive(true)}
            className={`p-2.5 rounded-full transition-all duration-300 ease-out flex items-center justify-center ${
              isActive 
                ? 'bg-card text-foreground shadow-sm scale-100' 
                : 'bg-transparent text-muted-foreground hover:bg-muted/70 hover:text-foreground scale-95 hover:scale-100'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
          </button>
          
          <button 
            onClick={handleReset}
            className="p-2.5 rounded-full text-muted-foreground hover:bg-muted/70 hover:text-foreground hover:rotate-[-45deg] transition-all duration-300 ease-out flex items-center justify-center scale-95 hover:scale-100"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
        
        <button className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-md hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all duration-300 ease-out">
          <Clock className="w-5 h-5" />
        </button>
      </div>
    </Card>
  );
}