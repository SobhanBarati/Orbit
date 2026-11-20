"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

interface EditContractModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
}

export function EditContractModal({ user, isOpen, onClose }: EditContractModalProps) {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    baseSalary: user?.baseSalary || "",
    nextReviewDate: user?.nextReviewDate 
      ? format(new Date(user.nextReviewDate), "yyyy-MM-dd") 
      : "",
    // این سه فیلد را فعلاً به صورت نمایشی می‌گذاریم تا ساختار مشخص شود
    hasPension: true, 
    devices: "MacBook Pro 14",
    benefits: "Health Insurance",
  });

  const updateUser = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/user", { // از API موجود استفاده می‌کنیم
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          baseSalary: Number(data.baseSalary),
          nextReviewDate: data.nextReviewDate ? new Date(data.nextReviewDate) : null,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      // اگر در صفحه People هستیم، لیست آنجا هم آپدیت شود
      queryClient.invalidateQueries({ queryKey: ["people"] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 w-full max-w-sm shadow-lg animate-in zoom-in-95 duration-200 border border-transparent dark:border-zinc-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-white">Edit Contract</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">Base Salary (Yearly $)</label>
            <input 
              type="number" 
              value={formData.baseSalary} 
              onChange={(e) => setFormData({...formData, baseSalary: e.target.value})} 
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-zinc-400 text-sm text-zinc-900 dark:text-white" 
              placeholder="e.g. 60000"
            />
          </div>
          
          <div>
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">Next Review Date</label>
            <input 
              type="date" 
              value={formData.nextReviewDate} 
              onChange={(e) => setFormData({...formData, nextReviewDate: e.target.value})} 
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-zinc-400 text-sm text-zinc-900 dark:text-white" 
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">Assigned Devices</label>
            <input 
              type="text" 
              value={formData.devices} 
              onChange={(e) => setFormData({...formData, devices: e.target.value})} 
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-zinc-400 text-sm text-zinc-900 dark:text-white" 
              placeholder="e.g. MacBook Pro"
            />
          </div>

          <button type="submit" disabled={updateUser.isPending} className="w-full mt-4 bg-zinc-900 dark:bg-white text-white dark:text-black py-2.5 rounded-xl font-medium text-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex justify-center items-center">
            {updateUser.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}