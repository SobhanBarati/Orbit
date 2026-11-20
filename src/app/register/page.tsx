"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Loader2, UserPlus, KeyRound, Mail, User, Briefcase, MapPin, ChevronDown } from "lucide-react"; // 👈 ChevronDown اضافه شد
import Link from "next/link";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "Product Designer",
    team: "Design",
    location: "Remote",
    accessLevel: "EMPLOYEE",
    hrCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      router.push("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      
      {/* پس‌زمینه */}
      <div className="absolute inset-0 z-0 flex items-center justify-center translate-y-[-5%]">
        <div className="absolute h-[900px] w-[900px] rounded-full border border-primary/20"></div>
        <div className="absolute h-[700px] w-[700px] rounded-full border border-primary/30"></div>
        <div className="absolute h-[500px] w-[500px] rounded-full border border-primary/40"></div>
        <div className="absolute h-[600px] w-[600px] bg-primary/15 blur-[120px] rounded-full"></div>
        <div className="absolute top-1/4 right-1/4 h-[400px] w-[400px] bg-indigo-500/10 blur-[100px] rounded-full"></div>
      </div>

      {/* کارت اصلی */}
      <Card className="relative z-10 w-full max-w-[480px] rounded-[32px] border border-black/5 dark:border-white/10 shadow-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl p-6 md:p-7 animate-in fade-in zoom-in-95 duration-500">
        
        {/* لوگو */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
            <span className="text-white font-bold text-lg">O</span>
          </div>
          <span className="font-bold text-xl text-foreground tracking-tight">Orbit</span>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-1 tracking-tight">Create an account</h1>
        <p className="text-sm text-muted-foreground mb-5">Enter your details to join your workspace.</p>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-600 dark:text-rose-400 animate-in fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-3">
          {/* نام */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-foreground">Full Name</label>
            <div className="relative group">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                required 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                className="w-full pl-10 pr-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground" 
                placeholder="e.g. Josh Hill"
              />
            </div>
          </div>

          {/* ایمیل */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-foreground">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                type="email" 
                required 
                value={form.email} 
                onChange={(e) => setForm({ ...form, email: e.target.value })} 
                className="w-full pl-10 pr-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground" 
                placeholder="name@orbit.work"
              />
            </div>
          </div>

          {/* تیم و نقش */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-foreground">Team</label>
              <div className="relative group">
                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <select 
                  value={form.team} 
                  onChange={(e) => setForm({ ...form, team: e.target.value })} 
                  disabled={form.accessLevel === "HR"}
                  className="w-full pl-10 pr-8 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <option>Design</option>
                  <option>Engineering</option>
                  <option>Product</option>
                  <option>Operations</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-foreground">Role</label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <select 
                  value={form.role} 
                  onChange={(e) => setForm({ ...form, role: e.target.value })} 
                  disabled={form.accessLevel === "HR"}
                  className="w-full pl-10 pr-8 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <option>Product Designer</option>
                  <option>Frontend Developer</option>
                  <option>Backend Developer</option>
                  <option>Product Manager</option>
                  <option>HR Manager</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          {/* لوکیشن */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-foreground">Location</label>
            <div className="relative group">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <select 
                value={form.location} 
                onChange={(e) => setForm({ ...form, location: e.target.value })} 
                className="w-full pl-10 pr-8 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
              >
                <option>Remote</option>
                <option>London</option>
                <option>Tehran</option>
                <option>Lisbon</option>
                <option>New York</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* نوع اکانت */}
          <div className="flex flex-col gap-1.5 pt-1">
            <label className="text-[12px] font-semibold text-foreground">Account Type</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, accessLevel: "EMPLOYEE", hrCode: "" })}
                className={`flex-1 py-2 rounded-xl border text-[13px] font-medium transition-all ${
                  form.accessLevel === "EMPLOYEE"
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-background border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                Employee
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, accessLevel: "HR", team: "Operations", role: "HR Manager" })}
                className={`flex-1 py-2 rounded-xl border text-[13px] font-medium transition-all ${
                  form.accessLevel === "HR"
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-background border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                HR Manager
              </button>
            </div>
          </div>

          {/* فیلد رمز HR */}
          {form.accessLevel === "HR" && (
            <div className="animate-in fade-in slide-in-from-top-2 flex flex-col gap-1 pt-1">
              <label className="text-[12px] font-semibold text-foreground flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-primary" /> HR Invite Code
              </label>
              <input 
                type="password" 
                autoComplete="new-password"
                required 
                value={form.hrCode} 
                onChange={(e) => setForm({ ...form, hrCode: e.target.value })} 
                placeholder="Enter secret code" 
                className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground" 
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full flex items-center justify-center gap-2 py-3 mt-2 bg-primary text-primary-foreground font-semibold text-sm rounded-2xl hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all shadow-lg shadow-primary/25 disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Register Account <UserPlus className="w-4 h-4" /></>}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline underline-offset-4 transition-all">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}