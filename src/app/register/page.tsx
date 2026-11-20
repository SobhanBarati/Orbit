"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Loader2, UserPlus, KeyRound } from "lucide-react";
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
    // کاهش پدینگ کلی صفحه از p-6 به p-4
    <div className="flex min-h-screen items-center justify-center bg-[#FDFBF7] p-4">
      {/* کاهش پدینگ کارت از p-8 به p-6 و حداکثر عرض */}
      <Card className="w-full max-w-md rounded-[32px] border-none shadow-xl bg-white p-6 sm:p-7">
        
        {/* کاهش مارجین هدر */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2.5 h-2.5 bg-zinc-900 rounded-full" />
          <span className="font-semibold text-lg text-zinc-900">Caterie Workspace</span>
        </div>

        <h1 className="text-2xl font-medium text-zinc-900 mb-1">Create an account</h1>
        <p className="text-[13px] text-zinc-500 mb-5">Enter your details to join your workspace.</p>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-2xl text-xs text-rose-600">
            {error}
          </div>
        )}

        {/* کاهش فاصله بین فیلدها از space-y-4 به space-y-3 */}
        <form onSubmit={handleRegister} className="space-y-3">
          {/* فیلدهای نام و ایمیل */}
          <div>
            <label className="text-[12px] font-medium text-zinc-700 block mb-1">Full Name</label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:outline-none focus:border-zinc-300 transition-colors" />
          </div>

          <div>
            <label className="text-[12px] font-medium text-zinc-700 block mb-1">Email Address</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:outline-none focus:border-zinc-300 transition-colors" />
          </div>

          {/* فیلدهای تیم و نقش */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-medium text-zinc-700 block mb-1">Team</label>
              <select 
                value={form.team} 
                onChange={(e) => setForm({ ...form, team: e.target.value })} 
                disabled={form.accessLevel === "HR"}
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:outline-none focus:border-zinc-300 text-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <option>Design</option>
                <option>Engineering</option>
                <option>Product</option>
                <option>Operations</option>
              </select>
            </div>
            <div>
              <label className="text-[12px] font-medium text-zinc-700 block mb-1">Role</label>
              <select 
                value={form.role} 
                onChange={(e) => setForm({ ...form, role: e.target.value })} 
                disabled={form.accessLevel === "HR"}
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:outline-none focus:border-zinc-300 text-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <option>Product Designer</option>
                <option>Frontend Developer</option>
                <option>Backend Developer</option>
                <option>Product Manager</option>
                <option>HR Manager</option>
              </select>
            </div>
          </div>

          {/* فیلد لوکیشن */}
          <div>
            <label className="text-[12px] font-medium text-zinc-700 block mb-1">Location</label>
            <select 
              value={form.location} 
              onChange={(e) => setForm({ ...form, location: e.target.value })} 
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:outline-none focus:border-zinc-300 text-zinc-900 transition-colors"
            >
              <option>Remote</option>
              <option>London</option>
              <option>Tehran</option>
              <option>Lisbon</option>
              <option>New York</option>
            </select>
          </div>

          {/* انتخاب نوع اکانت */}
          <div>
            <label className="text-[12px] font-medium text-zinc-700 block mb-1">Account Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="accessLevel" 
                  value="EMPLOYEE" 
                  checked={form.accessLevel === "EMPLOYEE"} 
                  onChange={() => setForm({ ...form, accessLevel: "EMPLOYEE", hrCode: "" })} 
                  className="w-4 h-4 text-zinc-900 focus:ring-zinc-900" 
                />
                <span className="text-sm text-zinc-700">Employee</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="accessLevel" 
                  value="HR" 
                  checked={form.accessLevel === "HR"} 
                  onChange={() => setForm({ ...form, accessLevel: "HR", team: "Operations", role: "HR Manager" })} 
                  className="w-4 h-4 text-zinc-900 focus:ring-zinc-900" 
                />
                <span className="text-sm text-zinc-700">HR Manager</span>
              </label>
            </div>
          </div>

          {/* فیلد رمز HR */}
          {form.accessLevel === "HR" && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label className="text-[12px] font-medium text-zinc-700 flex items-center gap-1.5 mb-1">
                <KeyRound className="w-3.5 h-3.5" /> HR Invite Code
              </label>
              <input 
                type="password" 
                required 
                name="hr_invite_code"
                autoComplete="new-password"
                value={form.hrCode} 
                onChange={(e) => setForm({ ...form, hrCode: e.target.value })} 
                placeholder="Enter secret code provided by admin" 
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:outline-none focus:border-zinc-300 transition-colors" 
              />
              <p className="text-[10px] text-zinc-400 mt-1">This code is provided only by the company admin.</p>
            </div>
          )}

          {/* کاهش مارجین بالای دکمه */}
          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-2.5 bg-zinc-900 text-white font-medium text-sm rounded-full hover:bg-zinc-800 transition-colors shadow-sm disabled:opacity-70 mt-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Register Account <UserPlus className="w-4 h-4" /></>}
          </button>
        </form>

        {/* کاهش مارجین فوتر */}
        <div className="mt-4 text-center text-xs text-zinc-500">
          Already have an account? <Link href="/login" className="text-zinc-900 font-medium underline">Sign in</Link>
        </div>
      </Card>
    </div>
  );
}