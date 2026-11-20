"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { 
  User, Lock, Bell, Palette, Loader2, CheckCircle2, Moon, Sun, 
  Monitor, ShieldCheck, LogOut as LogOutIcon, Camera
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Profile");
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // استیت‌های مربوط به پروفایل
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // استیت‌های مربوط به اعلان‌ها (حالا با دیتابیس همگام میشه)
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushAlerts: false,
    weeklyDigest: true,
    taskUpdates: true,
  });
  const [notifSaved, setNotifSaved] = useState(false);

  // استیت‌های مربوط به ظاهر
  const [theme, setTheme] = useState("light");
  const [themeSaved, setThemeSaved] = useState(false);

  // واکشی اطلاعات کاربر
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
  });

  // اعمال تنظیمات اولیه از دیتابیس
  useEffect(() => {
    if (currentUser) {
      setFormData({ name: currentUser.name, email: currentUser.email });
      
      // 👇 خواندن تنظیمات اعلان از دیتابیس
      setNotifications({
        emailAlerts: currentUser.emailAlerts ?? true,
        pushAlerts: currentUser.pushAlerts ?? false,
        weeklyDigest: currentUser.weeklyDigest ?? true,
        taskUpdates: currentUser.taskUpdates ?? true,
      });
    }

    const savedTheme = localStorage.getItem("caterie_theme") || "light";
    setTheme(savedTheme);
  }, [currentUser]);

  // تابع تغییر تم
  const applyTheme = (selectedTheme: string) => {
    const root = document.documentElement;
    if (selectedTheme === "dark") {
      root.classList.add("dark");
    } else if (selectedTheme === "light") {
      root.classList.remove("dark");
    } else {
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (systemPrefersDark) root.classList.add("dark");
      else root.classList.remove("dark");
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("caterie_theme") || "light";
    applyTheme(savedTheme);
  }, []);

  // آپلود عکس پروفایل
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ["current-user"] });
      } else {
        alert("خطا در آپلود عکس");
      }
    } catch (error) {
      console.error("Upload failed", error);
      alert("خطا در آپلود عکس");
    } finally {
      setIsUploading(false);
    }
  };

  // ذخیره اطلاعات پروفایل
  const handleSaveProfile = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    setIsSuccess(false);

    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentUser.id,
          name: formData.name,
          email: formData.email,
        }),
      });

      if (res.ok) {
        setIsSuccess(true);
        queryClient.invalidateQueries({ queryKey: ["current-user"] });
        setTimeout(() => setIsSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setIsSaving(false);
    }
  };

  // ذخیره تنظیمات اعلان‌ها در دیتابیس
    const handleSaveNotifications = async () => {
    setNotifSaved(true);
    try {
      const res = await fetch("/api/user/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notifications),
      });

      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ["current-user"] });
        setTimeout(() => setNotifSaved(false), 2500);
      } else {
        setNotifSaved(false);
        alert("خطا در ذخیره تنظیمات!");
      }
    } catch (error) {
      console.error("Failed to save", error);
      setNotifSaved(false);
    }
  };

  // ذخیره تنظیمات ظاهری
  const handleSaveTheme = (selectedTheme: string) => {
    setTheme(selectedTheme);
    localStorage.setItem("caterie_theme", selectedTheme);
    applyTheme(selectedTheme);
    setThemeSaved(true);
    setTimeout(() => setThemeSaved(false), 2500);
  };

  const tabs = [
    { id: "Profile", icon: User, desc: "Manage your public information" },
    { id: "Security", icon: Lock, desc: "Passwords and authentication" },
    { id: "Notifications", icon: Bell, desc: "Email and push alerts" },
    { id: "Appearance", icon: Palette, desc: "Theme and UI preferences" },
  ];

  return (
    <div className="flex flex-col min-h-[850px] p-6 bg-[#FDFBF7] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 w-full animate-in fade-in duration-500 transition-colors">
      <div className="mb-8">
        <h1 className="text-3xl font-medium tracking-tight">Settings</h1>
        <p className="text-[14px] text-zinc-500 dark:text-zinc-400 mt-1">
          Manage your account preferences and configurations.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* سایدبار تب‌ها */}
        <Card className="w-full lg:w-[280px] shrink-0 rounded-[32px] border-none shadow-sm bg-white dark:bg-zinc-900 p-4 h-fit">
          <div className="flex flex-col gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-start gap-3 p-3.5 rounded-[20px] transition-all text-left ${
                    isActive
                      ? "bg-[#2A2A2A] dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 mt-0.5 ${
                      isActive ? "text-white dark:text-zinc-900" : "text-zinc-400"
                    }`}
                  />
                  <div className="flex flex-col">
                    <span
                      className={`text-[14px] font-medium ${
                        isActive ? "text-white dark:text-zinc-900" : "text-zinc-900 dark:text-zinc-100"
                      }`}
                    >
                      {tab.id}
                    </span>
                    <span
                      className={`text-[11px] mt-0.5 ${
                        isActive ? "text-zinc-400 dark:text-zinc-600" : "text-zinc-500 dark:text-zinc-400"
                      }`}
                    >
                      {tab.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* محتوای اصلی */}
        <Card className="flex-1 rounded-[32px] border-none shadow-sm bg-white dark:bg-zinc-900 p-8 min-h-[600px]">
          
          {/* تب پروفایل */}
          {activeTab === "Profile" && (
            <div className="max-w-xl animate-in fade-in duration-300">
              <h2 className="text-xl font-medium mb-6">Personal Information</h2>

              {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* آپلود عکس */}
                  <div className="flex items-center gap-6 mb-6">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <Avatar className="w-24 h-24 border-4 border-zinc-50 dark:border-zinc-800 shadow-sm transition-all group-hover:opacity-80">
                        <AvatarImage src={currentUser?.avatar} />
                        <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-zinc-400 text-3xl font-medium">
                          {currentUser?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        {isUploading ? (
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        ) : (
                          <Camera className="w-6 h-6 text-white" />
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Profile Picture</h3>
                      <p className="text-xs text-zinc-500 mt-1 mb-2">Click the image to upload a new one.</p>
                      <p className="text-[10px] text-zinc-400">JPG, PNG or GIF. Max size 2MB.</p>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleAvatarUpload} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:border-zinc-300 transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:border-zinc-300 transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300">Role</label>
                    <input
                      type="text"
                      defaultValue={currentUser?.role || "Employee"}
                      disabled
                      className="w-full px-4 py-2.5 bg-zinc-50/50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700 rounded-xl text-sm text-zinc-400 cursor-not-allowed"
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving || isSuccess}
                      className={`flex items-center gap-2 px-6 py-2.5 font-medium text-sm rounded-full transition-all shadow-sm ${
                        isSuccess
                          ? "bg-emerald-500 text-white hover:bg-emerald-600"
                          : "bg-[#FFCE00] text-black hover:bg-yellow-500 disabled:opacity-70"
                      }`}
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isSuccess ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : null}
                      {isSaving ? "Saving..." : isSuccess ? "Saved!" : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* تب امنیت */}
          {activeTab === "Security" && (
            <div className="max-w-2xl animate-in fade-in duration-300">
              <h2 className="text-xl font-medium mb-2">Password & Security</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-8">
                Manage your security preferences and review account activity.
              </p>

              <div className="space-y-8">
                {/* وضعیت امنیتی (OTP) */}
                <div className="p-5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl flex items-start gap-4">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-full shrink-0">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                      Two-Factor Authentication (2FA)
                    </h3>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                      Your account is secured with One-Time Passwords (OTP) sent to your email.
                    </p>
                  </div>
                </div>

                {/* تاریخچه فعالیت‌ها - داینامیک */}
                <div>
                  <h3 className="text-sm font-semibold mb-4">Recent Activity</h3>
                  <div className="border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                          <Monitor className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Current Device</p>
                          <p className="text-xs text-zinc-500">
                            {currentUser?.lastLoginAt 
                              ? `Last login: ${formatDistanceToNow(new Date(currentUser.lastLoginAt), { addSuffix: true })}` 
                              : "Just logged in"}
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded-full">
                        Active Now
                      </span>
                    </div>
                  </div>
                </div>

                {/* دکمه خروج از همه دستگاه‌ها */}
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <h3 className="text-sm font-semibold text-rose-600 dark:text-rose-400 mb-2">Danger Zone</h3>
                  <p className="text-xs text-zinc-500 mb-4">
                    Logging out of all devices will end all active sessions.
                  </p>
                  <button 
                    onClick={async () => {
                      if(confirm("آیا مطمئن هستید؟ از همه دستگاه‌ها خارج می‌شوید.")) {
                        await fetch("/api/auth/logout", { method: "POST" });
                        window.location.href = "/login";
                      }
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900/50 rounded-xl text-sm font-medium transition-colors"
                  >
                    <LogOutIcon className="w-4 h-4" />
                    Log out of all devices
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* تب اعلان‌ها */}
          {activeTab === "Notifications" && (
            <div className="max-w-xl animate-in fade-in duration-300">
              <h2 className="text-xl font-medium mb-2">Notification Preferences</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
                Choose what updates you want to receive.
              </p>

              <div className="space-y-4">
                {[
                  { key: "emailAlerts", title: "Email Alerts", desc: "Receive important account and team activity via email." },
                  { key: "pushAlerts", title: "Push Notifications", desc: "Get instant alerts directly on your browser or device." },
                  { key: "weeklyDigest", title: "Weekly Summary Digest", desc: "A weekly recap of team hours, payroll, and milestones." },
                  { key: "taskUpdates", title: "Task & Onboarding Updates", desc: "Get notified when tasks are assigned or completed." },
                ].map((item) => {
                  const isChecked = (notifications as any)[item.key];
                  return (
                    <div
                      key={item.key}
                      className="flex justify-between items-center p-4 bg-zinc-50/60 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{item.title}</span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {item.desc}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          setNotifications({ ...notifications, [item.key]: !isChecked })
                        }
                        className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                          isChecked
                            ? "bg-zinc-900 dark:bg-zinc-100 justify-end"
                            : "bg-zinc-200 dark:bg-zinc-700 justify-start"
                        }`}
                      >
                        <motion.div
                          className="w-4 h-4 rounded-full bg-white dark:bg-zinc-900 shadow-md"
                          layout
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="pt-6">
                <button
                  onClick={handleSaveNotifications}
                  disabled={notifSaved}
                  className={`flex items-center gap-2 px-6 py-2.5 font-medium text-sm rounded-full transition-all shadow-sm ${
                    notifSaved
                      ? "bg-emerald-500 text-white"
                      : "bg-[#FFCE00] text-black hover:bg-yellow-500"
                  }`}
                >
                  {notifSaved && <CheckCircle2 className="w-4 h-4" />}
                  {notifSaved ? "Preferences Saved!" : "Save Preferences"}
                </button>
              </div>
            </div>
          )}

          {/* تب ظاهر */}
          {activeTab === "Appearance" && (
            <div className="max-w-xl animate-in fade-in duration-300">
              <h2 className="text-xl font-medium mb-2">Appearance Preferences</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
                Customize how Caterie looks on your device.
              </p>

              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { id: "light", label: "Light Mode", icon: Sun },
                  { id: "dark", label: "Dark Mode", icon: Moon },
                  { id: "system", label: "System", icon: Monitor },
                ].map((t) => {
                  const Icon = t.icon;
                  const isSelected = theme === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => handleSaveTheme(t.id)}
                      className={`flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? "border-zinc-900 dark:border-zinc-100 bg-zinc-900/5 dark:bg-zinc-100/10 shadow-sm"
                          : "border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-200"
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 ${
                          isSelected ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400"
                        }`}
                      />
                      <span
                        className={`text-xs font-medium ${
                          isSelected
                            ? "text-zinc-900 dark:text-zinc-100 font-semibold"
                            : "text-zinc-600 dark:text-zinc-400"
                        }`}
                      >
                        {t.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {themeSaved && (
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-medium animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" /> Theme preferences updated successfully!
                </div>
              )}
            </div>
          )}

        </Card>
      </div>
    </div>
  );
}