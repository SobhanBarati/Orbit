"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, Clock } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

export function NotificationPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const unreadCount = notifications.length;

  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/notifications", { 
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}) 
      });
      if (res.ok) queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const handleReadOne = async (id: string) => {
    try {
      const res = await fetch("/api/notifications", { 
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }) 
      });
      if (res.ok) queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={popoverRef}>
      {/* دکمه زنگوله */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-9 h-9 md:w-10 md:h-10 bg-card md:bg-transparent border border-border rounded-full shadow-sm hover:bg-muted transition-colors"
      >
        <Bell className="w-4 h-4 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
        )}
      </button>

      {/* 👇 پاپ‌آپ: در موبایل fixed و وسط صفحه، در دسکتاپ absolute */}
      {isOpen && (
        <>
          {/* بک‌دراپ تیره فقط در موبایل برای فوکوس بهتر */}
          <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setIsOpen(false)} />
          
          <div className="fixed md:absolute top-16 md:top-full left-1/2 md:left-auto md:right-0 -translate-x-1/2 md:translate-x-0 mt-0 md:mt-3 w-[calc(100vw-2rem)] md:w-80 max-w-md bg-card border border-border rounded-3xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-4 duration-200 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h3 className="font-bold text-[14px] text-foreground">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>
            
            <div className="max-h-[320px] overflow-y-auto custom-scrollbar flex flex-col">
              {isLoading ? (
                <div className="p-4 text-center text-xs text-muted-foreground">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">You're all caught up!</div>
              ) : (
                notifications.map((notif: any) => (
                  <div 
                    key={notif.id} 
                    onClick={() => handleReadOne(notif.id)}
                    className="flex gap-3 p-4 hover:bg-muted/50 transition-colors cursor-pointer border-b border-border last:border-0 group"
                  >
                    <div className="mt-0.5 w-2 h-2 rounded-full shrink-0 bg-primary group-hover:bg-primary/80 transition-colors" />
                    <div className="flex flex-col gap-1">
                      <span className="text-[13px] font-bold text-foreground">
                        {notif.title}
                      </span>
                      <span className="text-[12px] text-muted-foreground leading-snug">{notif.desc}</span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" /> 
                        {formatDistanceToNow(new Date(notif.time), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}