"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowRight, ShieldCheck } from "lucide-react";
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

      // 🔍 چک می‌کنیم که آیا پاسخ از نوع JSON است یا خطای HTML
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("خطای داخلی سرور. لطفا دوباره تلاش کنید.");
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

      // 🔍 همین چک برای اینجا هم
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("خطای داخلی سرور. لطفا دوباره تلاش کنید.");
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
    <div className="flex min-h-screen items-center justify-center bg-[#FDFBF7] p-6">
      <Card className="w-full max-w-md rounded-[32px] border-none shadow-xl bg-white p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2.5 h-2.5 bg-zinc-900 rounded-full" />
          <span className="font-semibold text-lg text-zinc-900">Caterie Workspace</span>
        </div>

        <h1 className="text-2xl font-medium text-zinc-900 mb-2">
          {step === "EMAIL" ? "Sign in to your account" : "Enter security code"}
        </h1>
        <p className="text-xs text-zinc-500 mb-6">
          {step === "EMAIL" 
            ? "Enter your work email to receive a one-time passcode." 
            : `We've sent a 6-digit code to ${email}. Check your server console.`}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-2xl text-xs text-rose-600">
            {error}
          </div>
        )}

        {step === "EMAIL" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="text-[13px] font-medium text-zinc-700 block mb-1.5">Email Address</label>
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@caterie.work"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:outline-none focus:border-zinc-300"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#FFCE00] text-black font-medium text-sm rounded-full hover:bg-yellow-500 transition-colors shadow-sm disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continue <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="text-[13px] font-medium text-zinc-700 block mb-1.5">6-Digit Code</label>
              <input 
                type="text"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-center tracking-widest text-lg font-semibold focus:outline-none focus:border-zinc-300"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-900 text-white font-medium text-sm rounded-full hover:bg-zinc-800 transition-colors shadow-sm disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Verify & Sign In <ShieldCheck className="w-4 h-4" /></>}
            </button>
          </form>
        )}

        {step === "EMAIL" && (
          <div className="mt-6 text-center text-xs text-zinc-500">
            Don't have an account?{" "}
            <Link href="/register" className="text-zinc-900 font-medium underline">
              Create account
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}