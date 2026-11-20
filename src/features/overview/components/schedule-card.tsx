"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronRight, ChevronLeft, Loader2, Pencil, Trash2, CheckCircle2, CalendarX } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEvents } from "../api/use-events";
import { getHours, getMinutes, addDays, format, isSameDay } from "date-fns";
import { AddEventModal } from "./add-event-modal";
import { EditEventModal } from "./edit-event-modal";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { useQueryClient, useQuery } from "@tanstack/react-query";

// 👇 تنظیمات بازه زمانی
const START_HOUR = 8;  
const END_HOUR = 18;   
const TOTAL_HOURS = END_HOUR - START_HOUR;
const HOUR_HEIGHT = 45; 
const CALENDAR_HEIGHT = TOTAL_HOURS * HOUR_HEIGHT + 20; 
const DAYS_TO_SHOW = 5; 

const calculatePosition = (dateString: Date | string, visibleDays: Date[], isMobile: boolean) => {
  const date = new Date(dateString);
  const hour = getHours(date);
  const minute = getMinutes(date);
  
  const dayIndex = visibleDays.findIndex(d => isSameDay(d, date));
  if (dayIndex === -1) return { isVisible: false, top: "0%", left: "0%", width: "100%" };

  let hourOffset = hour - START_HOUR;
  if (hourOffset < 0 || hourOffset >= TOTAL_HOURS) return { isVisible: false, top: "0%", left: "0%", width: "100%" };
  
  const topPx = (hourOffset * HOUR_HEIGHT) + ((minute / 60) * HOUR_HEIGHT);
  const top = `${topPx}px`;
  
  const totalDays = visibleDays.length;
  const left = isMobile ? "0%" : `${(dayIndex / totalDays) * 100}%`;
  const width = isMobile ? "100%" : `calc(${100 / totalDays}% - 4px)`; 

  return { top, left, width, isVisible: true };
};

const generateTimeLabels = () => {
  const labels = [];
  for (let i = START_HOUR; i <= END_HOUR; i += 2) { 
    const ampm = i >= 12 ? 'pm' : 'am';
    const displayHour = i > 12 ? i - 12 : i;
    labels.push(`${displayHour}:00 ${ampm}`);
  }
  return labels;
};

const getEventStyle = (index: number) => {
  const styles = [
    { 
      bg: "bg-foreground dark:bg-white",
      text: "text-background dark:text-black",
      border: "border-transparent",
      divider: "border-background/20 dark:border-black/10",
      iconHover: "hover:bg-background/20 dark:hover:bg-black/10",
      dot: "bg-primary"
    },
    { 
      bg: "bg-primary/10",
      text: "text-primary",
      border: "border-primary/20",
      divider: "border-primary/10",
      iconHover: "hover:bg-primary/20",
      dot: "bg-primary"
    },
    { 
      bg: "bg-muted",
      text: "text-foreground",
      border: "border-border",
      divider: "border-border",
      iconHover: "hover:bg-border/50",
      dot: "bg-muted-foreground"
    },
  ];
  return styles[index % styles.length];
};

export function ScheduleCard() {
  const { data: events, isLoading } = useEvents();
  const [weekOffset, setWeekOffset] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [mobileSelectedDay, setMobileSelectedDay] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) return null;
      return res.json();
    },
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setExpandedId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const baseDate = new Date(2026, 8, 28); 
  const currentWeekStart = addDays(baseDate, weekOffset * DAYS_TO_SHOW);
  
  const visibleDays = Array.from({ length: DAYS_TO_SHOW }).map((_, i) => addDays(currentWeekStart, i));

  const headerTitle = `${format(visibleDays[0], "MMM d")} - ${format(visibleDays[DAYS_TO_SHOW - 1], "MMM d")}`;
  const nextWeekBtn = format(addDays(currentWeekStart, DAYS_TO_SHOW), "MMM d");

  const filteredEvents = events?.filter(event => {
    const eventDate = new Date(event.date);
    return visibleDays.some(day => isSameDay(eventDate, day));
  });

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/events?id=${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ["events"] });
        setDeleteId(null);
        setExpandedId(null);
        setToastMessage("Event deleted successfully.");
        setTimeout(() => setToastMessage(null), 3000);
      } else {
        const data = await res.json();
        setToastMessage(data.error || "Failed to delete event");
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (error) {
      console.error("Failed to delete event", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="rounded-[32px] border-none shadow-sm bg-card p-6 lg:col-span-2 min-h-[380px] flex items-center justify-center transition-colors">
        <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
      </Card>
    );
  }

  return (
    <Card className="rounded-[32px] border-none shadow-sm bg-card border-border text-foreground p-4 md:p-6 lg:col-span-2 flex flex-col transition-colors relative overflow-hidden min-h-[400px]">
      
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-foreground text-background px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 z-[100]">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 shrink-0">
        <h3 className="font-bold text-foreground text-sm md:text-base">{headerTitle}</h3>
        
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <AddEventModal 
            defaultDate={currentWeekStart} 
            onSuccess={() => {
              setToastMessage("Event created successfully!");
              setTimeout(() => setToastMessage(null), 3000);
            }} 
          />

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setWeekOffset(prev => prev - 1)}
              className="p-1.5 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <button 
              onClick={() => setWeekOffset(prev => prev + 1)}
              className="flex items-center gap-1 text-xs font-bold text-foreground transition-colors bg-muted hover:bg-muted/80 px-2 md:px-3 py-1.5 rounded-full border border-border"
            >
              {nextWeekBtn}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="md:hidden flex gap-1 overflow-x-auto pb-2 mb-2 custom-scrollbar shrink-0">
        {visibleDays.map((date, index) => (
          <button
            key={index}
            onClick={() => setMobileSelectedDay(index)}
            className={`flex flex-col items-center justify-center min-w-[50px] py-2 rounded-xl transition-colors ${
              mobileSelectedDay === index 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <span className="text-[10px] font-medium">{format(date, "EEE")}</span>
            <span className="text-sm font-bold">{format(date, "d")}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 flex relative" ref={containerRef}>
        
        <div className="flex flex-col text-[9px] md:text-[10px] font-bold text-muted-foreground pr-1 md:pr-4 w-10 md:w-16 border-r border-border relative z-10 bg-card mt-[28px] md:mt-[36px] shrink-0">
          <div className="relative" style={{ height: `${CALENDAR_HEIGHT}px` }}>
            {generateTimeLabels().map((label, i) => (
              <div 
                key={i} 
                className="absolute left-0 w-full text-right pr-0.5 md:pr-2"
                style={{ top: `${(i * 2) * HOUR_HEIGHT + 4}px` }} 
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col relative min-w-0">
          
          {/* 👇 هدر روزها: حالا دور تاریخ 29 نارنجی نیست، کاملا یکدسته */}
          <div className="hidden md:flex text-center mb-2 pl-1 md:pl-4 shrink-0 h-[28px]">
            {visibleDays.map((date, index) => {
              return (
                <div key={index} className="flex-1 flex flex-col items-center justify-center">
                  <span className="text-[11px] font-bold text-foreground">
                    {format(date, "MMM d")}
                  </span>
                  <span className="text-[9px] font-medium text-muted-foreground">
                    {format(date, "EEE")}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="md:hidden h-[28px] flex items-center justify-center mb-2">
            <span className="text-xs font-bold text-foreground">
              {format(visibleDays[mobileSelectedDay], "EEEE, MMM d")}
            </span>
          </div>

          <div className="relative flex-1 ml-1 md:ml-4 h-[320px] overflow-y-auto custom-scrollbar">
            <div className="absolute inset-0 flex flex-col pointer-events-none z-0" style={{ height: `${CALENDAR_HEIGHT}px` }}>
              {Array.from({ length: TOTAL_HOURS / 2 + 1 }).map((_, i) => (
                <div 
                  key={i} 
                  className="border-t border-border w-full" 
                  style={{ height: `${HOUR_HEIGHT * 2}px` }} 
                />
              ))}
            </div>

            {/* 👇 حالت خالی شیک (Empty State) */}
            {filteredEvents?.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center">
                  <CalendarX className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">No events scheduled</p>
                <p className="text-xs text-muted-foreground/60">Enjoy your free time!</p>
              </div>
            )}

            {filteredEvents?.map((event, index) => {
              const eventDate = new Date(event.date);
              
              const isMobileView = typeof window !== "undefined" && window.innerWidth < 768;
              if (isMobileView) {
                if (!isSameDay(eventDate, visibleDays[mobileSelectedDay])) return null;
              }

              const pos = calculatePosition(event.date, visibleDays, isMobileView);
              if (!pos.isVisible) return null;

              const style = getEventStyle(index);
              const isExpanded = expandedId === event.id;
              
              const canEdit = currentUser?.accessLevel === "HR" || event.creatorId === currentUser?.id;

              return (
                <div 
                  key={event.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedId(isExpanded ? null : event.id);
                  }}
                  className={`absolute rounded-[10px] border shadow-sm flex flex-col cursor-pointer transition-all duration-300 ease-out ${style.bg} ${style.border} ${
                    isExpanded 
                      ? 'z-50 p-2 md:p-3 shadow-xl ring-4 ring-foreground/5 scale-[1.02] w-[95%] md:w-auto' 
                      : 'z-10 p-1.5 hover:-translate-y-0.5 hover:shadow-md min-h-[30px] overflow-hidden justify-center'
                  }`}
                  style={{ 
                    top: pos.top, 
                    left: pos.left, 
                    width: isExpanded ? (isMobileView ? '95%' : 'max(160px, 35%)') : pos.width, 
                  }}
                >
                  {!isExpanded && (
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-bold truncate leading-tight ${style.text}`}>{event.title}</span>
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
                    </div>
                  )}

                  {isExpanded && (
                    <div className="flex flex-col h-full animate-in fade-in">
                      <div className="flex justify-between items-start w-full mb-1">
                        <div className="flex-1">
                          <h4 className={`text-[11px] font-bold break-words leading-tight ${style.text}`}>{event.title}</h4>
                          {event.type && (
                            <p className={`text-[9px] mt-0.5 opacity-80 ${style.text}`}>
                              {event.type}
                            </p>
                          )}
                        </div>
                        
                        {canEdit && (
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setEditingEvent(event); }}
                              className={`p-1 rounded-md transition-colors ${style.text} ${style.iconHover}`}
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setDeleteId(event.id); }}
                              className={`p-1 rounded-md transition-colors hover:bg-rose-500/20 text-rose-500`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className={`mt-auto flex items-center justify-between pt-1 border-t mt-2 ${style.text} opacity-70 ${style.divider}`}>
                        <div className="text-[9px] font-bold">
                          {format(new Date(event.date), "h:mm a")}
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold">
                            {event.creator?.name?.split(" ")[0] || "Unknown"}
                          </span>
                          <Avatar className={`w-5 h-5 border border-current`}>
                            <AvatarImage src={event.creator?.avatar || undefined} />
                            <AvatarFallback className="bg-muted text-foreground text-[8px] font-bold">
                              {event.creator?.name?.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {editingEvent && (
        <EditEventModal 
          event={editingEvent} 
          isOpen={!!editingEvent} 
          onClose={() => setEditingEvent(null)} 
          onSuccess={() => {
            setToastMessage("Event updated successfully!");
            setTimeout(() => setToastMessage(null), 3000);
          }}
        />
      )}

      <ConfirmDeleteModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
      />
    </Card>
  );
}