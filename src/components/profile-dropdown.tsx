"use client";

import { useState, useRef, useEffect } from "react";
import { User, Settings, LogOut, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

export function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { data: currentUser, isLoading } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) return null;
      return res.json();
    },
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        setIsOpen(false);
        router.push("/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full overflow-hidden cursor-pointer border border-zinc-200 dark:border-zinc-700 shadow-sm focus:outline-none hover:ring-2 hover:ring-zinc-300 dark:hover:ring-zinc-600 transition-all flex items-center justify-center bg-zinc-100 dark:bg-zinc-800"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />
        ) : currentUser?.avatar ? (
          <img src={currentUser.avatar} alt={currentUser.name || "User"} className="w-full h-full object-cover" />
        ) : (
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            {currentUser?.name?.charAt(0) || "U"}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl shadow-xl z-50 animate-in fade-in slide-in-from-top-4 duration-200 overflow-hidden p-2">
          <div className="px-4 py-3 border-b border-zinc-50 dark:border-zinc-800 mb-1">
            <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{currentUser?.name || "Loading..."}</p>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate">{currentUser?.email || ""}</p>
          </div>

          <div className="flex flex-col gap-1">
            <Link 
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white rounded-2xl transition-colors"
            >
              <User className="w-4 h-4 text-zinc-400 dark:text-zinc-500" /> View Profile
            </Link>

            <Link 
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white rounded-2xl transition-colors"
            >
              <Settings className="w-4 h-4 text-zinc-400 dark:text-zinc-500" /> Account Settings
            </Link>
          </div>

          <div className="border-t border-zinc-50 dark:border-zinc-800 mt-1 pt-1">
            <button 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-2xl transition-colors text-left disabled:opacity-50"
            >
              <LogOut className="w-4 h-4 text-rose-500 dark:text-rose-400" /> 
              {isLoggingOut ? "Logging out..." : "Log out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}