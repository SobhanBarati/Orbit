"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Moon, Sun, Menu, X } from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { NotificationPopover } from "@/components/notification-popover";
import { ProfileDropdown } from "../profile-dropdown";
import { useEffect, useState } from "react";

const navItems = [
  { name: "Overview", path: "/" },
  { name: "People", path: "/people" },
  { name: "Payroll", path: "/payroll" },
];

export default function Topbar() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("caterie_theme") === "dark" || 
       (!localStorage.getItem("caterie_theme") && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("caterie_theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("caterie_theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md px-3 md:px-8 py-2 md:py-6 max-w-350 mx-auto w-full transition-colors border-b border-border md:border-none">
      
      <div className="grid grid-cols-[auto_1fr_auto] items-center w-full gap-2 md:gap-4">
        
        {/* لوگو */}
        <div className="flex items-center gap-2 z-50 shrink-0">
          <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-primary rounded-full transition-colors" />
          <span className="font-bold text-base md:text-xl text-foreground transition-colors">Orbit</span>
        </div>

        {/* 👇 ناوبری دسکتاپ - اصلاح شده برای نمایش هر سه لینک */}
        <div className="hidden lg:flex justify-center z-40 w-full">
          <LayoutGroup>
            <nav className="flex items-center bg-muted/50 rounded-full p-1 border border-border/50 transition-colors">
              {navItems.map((item) => {
                const isActive = pathname === item.path || (item.path !== "/" && pathname?.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`relative px-5 py-2 text-sm font-medium rounded-full transition-colors ${
                      isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-pill"
                        layout="position" 
                        className="absolute inset-0 bg-primary rounded-full"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                    <span className={`relative z-10`}>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </LayoutGroup>
        </div>

        {/* اکشن‌ها */}
        <div className="flex items-center justify-end gap-1.5 md:gap-3 z-50 shrink-0">
          <button
            onClick={toggleTheme}
            className="hidden md:flex items-center justify-center w-9 h-9 rounded-full border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <Link 
            href="/settings"
            className="hidden md:flex items-center justify-center w-9 h-9 rounded-full border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Settings className="w-4 h-4" />
          </Link>

          <NotificationPopover />
          <ProfileDropdown />

          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-full border border-border text-foreground bg-background transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* منوی موبایل */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 bg-background border-b border-border shadow-2xl p-4 flex flex-col gap-1 lg:hidden z-40"
          >
            {navItems.map((item) => {
              const isActive = pathname === item.path || (item.path !== "/" && pathname?.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-4 py-3 text-sm font-bold rounded-xl transition-all ${
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
            
            <div className="h-px bg-border/50 my-2" />
            
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-muted/50 text-xs font-bold text-muted-foreground hover:bg-muted transition-colors"
              >
                {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                {isDark ? "Light" : "Dark"}
              </button>
              <Link 
                href="/settings"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-muted/50 text-xs font-bold text-muted-foreground hover:bg-muted transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                Settings
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}