"use client";

import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { useAddPerson } from "../api/use-people";

export function AddMemberModal() {
  const [isOpen, setIsOpen] = useState(false);
  const addPerson = useAddPerson();
  
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    team: "Engineering",
    location: "Remote"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPerson.mutate(formData, {
      onSuccess: () => {
        setIsOpen(false);
        setFormData({ name: "", role: "", team: "Engineering", location: "Remote" });
      }
    });
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-black px-5 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm"
      >
        <Plus className="w-4 h-4" />
        Add member
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-8 w-full max-w-md shadow-lg animate-in zoom-in-95 duration-200 border border-transparent dark:border-zinc-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium text-zinc-900 dark:text-white">Add new member</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-500 dark:text-zinc-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-1">Full Name</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-zinc-400 dark:focus:border-zinc-500 text-zinc-900 dark:text-white transition-colors" placeholder="e.g. John Doe" />
              </div>
              
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-1">Role</label>
                <input required type="text" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-zinc-400 dark:focus:border-zinc-500 text-zinc-900 dark:text-white transition-colors" placeholder="e.g. Frontend Developer" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-1">Team</label>
                  <select value={formData.team} onChange={(e) => setFormData({...formData, team: e.target.value})} className="w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-zinc-400 dark:focus:border-zinc-500 text-zinc-900 dark:text-white transition-colors">
                    <option>Engineering</option>
                    <option>Design</option>
                    <option>Product</option>
                    <option>Operations</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-1">Location</label>
                  <input required type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-zinc-400 dark:focus:border-zinc-500 text-zinc-900 dark:text-white transition-colors" placeholder="e.g. London" />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={addPerson.isPending}
                className="w-full mt-4 bg-zinc-900 dark:bg-white text-white dark:text-black py-3 rounded-xl font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex justify-center items-center"
              >
                {addPerson.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Member"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}