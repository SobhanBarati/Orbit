"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Eye, Lock, Users } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

interface EditEventModalProps {
  event: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditEventModal({ event, isOpen, onClose, onSuccess }: EditEventModalProps) {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    type: "",
    location: "",
    visibility: "ALL", // 👈 فیلد جدید
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || "",
        date: format(new Date(event.date), "yyyy-MM-dd'T'HH:mm"),
        type: event.type || "",
        location: event.location || "",
        visibility: event.visibility || "ALL", // 👈 مقداردهی اولیه
      });
    }
  }, [event]);

  const updateEvent = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: event.id, ...data }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      onClose();
      if (onSuccess) onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateEvent.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 w-full max-w-sm shadow-lg animate-in zoom-in-95 duration-200 border border-transparent dark:border-zinc-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-white">Edit Event</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">Title</label>
            <input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-zinc-400 text-sm text-zinc-900 dark:text-white" />
          </div>
          
          <div>
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">Date & Time</label>
            <input required type="datetime-local" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-zinc-400 text-sm text-zinc-900 dark:text-white" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">Type</label>
              <input required type="text" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-zinc-400 text-sm text-zinc-900 dark:text-white" />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">Location</label>
              <input required type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-zinc-400 text-sm text-zinc-900 dark:text-white" />
            </div>
          </div>

          {/* 👇 فیلد سطح دسترسی */}
          <div>
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">Visibility</label>
            <div className="relative">
              <select 
                value={formData.visibility} 
                onChange={(e) => setFormData({...formData, visibility: e.target.value})} 
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-zinc-400 text-sm text-zinc-900 dark:text-white appearance-none pr-8"
              >
                <option value="ALL">Everyone (Public)</option>
                <option value="TEAM">My Team Only</option>
                <option value="PRIVATE">Only Me (Private)</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                {formData.visibility === 'ALL' ? <Eye className="w-4 h-4" /> : formData.visibility === 'TEAM' ? <Users className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              </div>
            </div>
          </div>

          <button type="submit" disabled={updateEvent.isPending} className="w-full mt-2 bg-zinc-900 dark:bg-white text-white dark:text-black py-2.5 rounded-xl font-medium text-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex justify-center items-center">
            {updateEvent.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}