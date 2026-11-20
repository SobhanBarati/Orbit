"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

interface EditMemberModalProps {
  member: any;
  isOpen: boolean;
  onClose: () => void;
}

export function EditMemberModal({ member, isOpen, onClose }: EditMemberModalProps) {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    team: "Design",
    location: "Remote",
    baseSalary: "",
    nextReviewDate: "",
    pensionPlan: "Standard",
    devices: "MacBook Pro",
    benefits: "Health Insurance",
  });

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || "",
        role: member.role || "",
        team: member.team || "Design",
        location: member.location || "Remote",
        baseSalary: member.baseSalary || "",
        nextReviewDate: member.nextReviewDate 
          ? format(new Date(member.nextReviewDate), "yyyy-MM-dd") 
          : "",
        pensionPlan: member.pensionPlan || "Standard",
        devices: member.devices || "MacBook Pro",
        benefits: member.benefits || "Health Insurance",
      });
    }
  }, [member]);

  const updateMember = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/people", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: member.id, 
          ...data, 
          baseSalary: data.baseSalary ? Number(data.baseSalary) : null,
          nextReviewDate: data.nextReviewDate || null,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
      queryClient.invalidateQueries({ queryKey: ["people-with-logs"] });
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMember.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 w-full max-w-lg shadow-lg animate-in zoom-in-95 duration-200 border border-transparent dark:border-zinc-800 max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium text-zinc-900 dark:text-white">Edit Member</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-500 dark:text-zinc-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* بخش اول: اطلاعات عمومی */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-2">General Info</h3>
            
            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">Full Name</label>
              <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-zinc-400 text-sm text-zinc-900 dark:text-white" />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">Team</label>
                <select value={formData.team} onChange={(e) => setFormData({...formData, team: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-zinc-400 text-sm text-zinc-900 dark:text-white">
                  <option>Engineering</option>
                  <option>Design</option>
                  <option>Product</option>
                  <option>Operations</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">Role</label>
                <input required type="text" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-zinc-400 text-sm text-zinc-900 dark:text-white" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">Location</label>
              <input required type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-zinc-400 text-sm text-zinc-900 dark:text-white" />
            </div>
          </div>

          {/* بخش دوم: اطلاعات قرارداد */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-2">Contract & Compensation</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">Base Salary (Yearly $)</label>
                <input type="number" value={formData.baseSalary} onChange={(e) => setFormData({...formData, baseSalary: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-zinc-400 text-sm text-zinc-900 dark:text-white" placeholder="e.g. 60000" />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">Next Review Date</label>
                <input type="date" value={formData.nextReviewDate} onChange={(e) => setFormData({...formData, nextReviewDate: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-zinc-400 text-sm text-zinc-900 dark:text-white" />
              </div>
            </div>
          </div>

          {/* بخش سوم: مزایا و تجهیزات */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-2">Benefits & Assets</h3>
            
            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">Pension Plan</label>
              <select value={formData.pensionPlan} onChange={(e) => setFormData({...formData, pensionPlan: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-zinc-400 text-sm text-zinc-900 dark:text-white">
                <option>Standard</option>
                <option>Premium</option>
                <option>None</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">Devices</label>
              <select value={formData.devices} onChange={(e) => setFormData({...formData, devices: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-zinc-400 text-sm text-zinc-900 dark:text-white">
                <option>MacBook Pro</option>
                <option>Windows Laptop</option>
                <option>Linux Laptop</option>
                <option>No Device</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">Benefits</label>
              <select value={formData.benefits} onChange={(e) => setFormData({...formData, benefits: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-zinc-400 text-sm text-zinc-900 dark:text-white">
                <option>Health Insurance</option>
                <option>Health & Gym</option>
                <option>Full Package</option>
                <option>None</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={updateMember.isPending} className="w-full mt-6 bg-zinc-900 dark:bg-white text-white dark:text-black py-3 rounded-xl font-medium text-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex justify-center items-center">
            {updateMember.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}