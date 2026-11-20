"use client";

import { useState } from "react";
import { Plus, X, Loader2, Eye, Lock, Users } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

interface AddEventModalProps {
  defaultDate?: Date;
  onSuccess?: () => void; 
}

export function AddEventModal({ defaultDate, onSuccess }: AddEventModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: "",
    date: format(defaultDate || new Date(), "yyyy-MM-dd'T'HH:mm"),
    type: "Meeting",
    location: "Zoom",
    visibility: "ALL",
  });

  const addEvent = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setIsOpen(false);
      setFormData({ title: "", date: format(new Date(), "yyyy-MM-dd'T'HH:mm"), type: "Meeting", location: "Zoom", visibility: "ALL" });
      if (onSuccess) onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addEvent.mutate(formData);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-1.5 bg-primary text-primary-foreground p-2 sm:px-3 sm:py-1.5 rounded-full text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm"
      >
        <Plus className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Add Event</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card rounded-[32px] p-6 w-full max-w-sm shadow-lg animate-in zoom-in-95 duration-200 border border-border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-foreground">New Event</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Title</label>
                <input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-xl outline-none focus:border-primary text-sm text-foreground" placeholder="e.g. Weekly Sync" />
              </div>
              
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Date & Time</label>
                <input required type="datetime-local" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-xl outline-none focus:border-primary text-sm text-foreground" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Type</label>
                  <input required type="text" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-xl outline-none focus:border-primary text-sm text-foreground" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Location</label>
                  <input required type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-xl outline-none focus:border-primary text-sm text-foreground" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Who can see this?</label>
                <div className="relative">
                  <select 
                    value={formData.visibility} 
                    onChange={(e) => setFormData({...formData, visibility: e.target.value})} 
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl outline-none focus:border-primary text-sm text-foreground appearance-none pr-8"
                  >
                    <option value="ALL">Everyone (Public)</option>
                    <option value="TEAM">My Team Only</option>
                    <option value="PRIVATE">Only Me (Private)</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                    {formData.visibility === 'ALL' ? <Eye className="w-4 h-4" /> : formData.visibility === 'TEAM' ? <Users className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              <button type="submit" disabled={addEvent.isPending} className="w-full mt-2 bg-primary text-primary-foreground py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors flex justify-center items-center">
                {addEvent.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Event"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}