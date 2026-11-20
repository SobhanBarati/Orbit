"use client";

import { CalendarDays, Clock, MapPin, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEvents } from "../api/use-events";
import { format, isAfter } from "date-fns";

export function NextEventCard() {
  const { data: events, isLoading } = useEvents();

  const nextEvent = events
    ?.filter(event => isAfter(new Date(event.date), new Date()))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  if (isLoading) {
    return (
      <Card className="rounded-[32px] border-none shadow-sm bg-card p-6 flex items-center justify-center h-40">
        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
      </Card>
    );
  }

  return (
    <Card className="rounded-[32px] border-none shadow-sm bg-card border-border p-5 flex flex-col transition-colors relative overflow-hidden">
      
      {/* نوار رنگی سمت چپ - حالا نارنجی */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-l-[32px]" />

      <div className="flex items-center justify-between mb-3 pl-2">
        <h3 className="font-bold text-[14px] text-foreground">Up Next</h3>
        <CalendarDays className="w-4 h-4 text-primary" />
      </div>

      {nextEvent ? (
        <div className="flex flex-col gap-2 pl-2">
          <h4 className="text-[15px] font-bold text-foreground line-clamp-1">
            {nextEvent.title}
          </h4>
          <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-muted-foreground/70" />
              <span>{format(new Date(nextEvent.date), "EEE, MMM d • h:mm a")}</span>
            </div>
            {nextEvent.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground/70" />
                <span className="truncate">{nextEvent.location}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-4 text-center pl-2">
          <p className="text-xs text-muted-foreground/70">Your schedule is clear.</p>
        </div>
      )}
    </Card>
  );
}