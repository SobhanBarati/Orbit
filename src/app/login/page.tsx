"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowRight, ShieldCheck, Mail } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [step, setStep] = useState<"EMAIL" | "OTP">("EMAIL");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server error. Please try again.");
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");

      setStep("OTP");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server error. Please try again.");
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid OTP");

      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      
      {/* 👇 پس‌زمینه با مدارهای نورانی */}
      <div className="absolute inset-0 z-0 flex items-center justify-center translate-y-[-5%]">
        <div className="absolute h-200 w-200 rounded-full border border-primary/30"></div>
        <div className="absolute h-150 w-150 rounded-full border border-primary/40"></div>
        <div className="absolute h-100 w-100 rounded-full border border-primary/50"></div>
        
        <div className="absolute h-125 w-125 bg-primary/20 blur-[120px] rounded-full"></div>
        <div className="absolute h-75 w-75 bg-primary/30 blur-[80px] rounded-full"></div>
        
        <div className="absolute top-1/4 right-1/4 h-100 w-100 bg-indigo-500/10 blur-[100px] rounded-full"></div>
      </div>

      {/* کارت اصلی */}
      <Card className="relative z-10 w-full max-w-105 rounded-[32px] border border-black/5 dark:border-white/10 shadow-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl p-8 md:p-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* لوگو */}
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-linear-to-br from-primary to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
            <span className="text-white font-bold text-lg">O</span>
          </div>
          <span className="font-bold text-xl text-foreground tracking-tight">Orbit</span>
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-3 tracking-tight">
          {step === "EMAIL" ? "Welcome back" : "Check your email"}
        </h1>
        <p className="text-sm text-muted-foreground mb-10">
          {step === "EMAIL" 
            ? "Enter your work email to receive a one-time passcode." 
            : `We've sent a 6-digit code to ${email}.`}
        </p>

        {error && (
          <div className="mb-8 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-600 dark:text-rose-400 animate-in fade-in">
            {error}
          </div>
        )}

        {step === "EMAIL" ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-semibold text-foreground">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@orbit.work"
                  className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-2xl text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground font-medium"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground font-semibold text-sm rounded-2xl hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all shadow-lg shadow-primary/25 disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continue <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-semibold text-foreground">6-Digit Code</label>
              <input 
                type="text"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                className="w-full px-4 py-4 bg-background border border-border rounded-2xl text-center tracking-[0.5em] text-2xl font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground font-semibold text-sm rounded-2xl hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all shadow-lg shadow-primary/25 disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Verify & Sign In <ShieldCheck className="w-4 h-4" /></>}
            </button>
          </form>
        )}

        {step === "EMAIL" && (
          <div className="mt-12 text-center text-xs text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary font-semibold hover:underline underline-offset-4 transition-all">
              Create account
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}