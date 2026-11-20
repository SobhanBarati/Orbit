"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePeople } from "../api/use-people";
import { format } from "date-fns";
import { 
  Loader2, Check, MoreHorizontal, ChevronDown, Users, X, 
  CheckCircle2, ShieldBan, ShieldCheck 
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EditMemberModal } from "./edit-member-modal";

interface PeopleTableProps {
  searchQuery?: string;
  activeTab?: string;
}

const getTeamBadge = (team: string) => {
  switch (team) {
    case "Design": return "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 border-purple-100 dark:border-purple-900/50";
    case "Engineering": return "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-100 dark:border-blue-900/50";
    case "Product": return "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 border-orange-100 dark:border-orange-900/50";
    case "Operations": return "bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400 border-cyan-100 dark:border-cyan-900/50";
    default: return "bg-zinc-50 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-100 dark:border-zinc-700";
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Active": return "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50";
    case "Inactive": return "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 border-rose-100 dark:border-rose-900/50";
    case "New": return "bg-zinc-900 text-white dark:bg-white dark:text-black border-zinc-900 dark:border-white";
    case "Away": return "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-100 dark:border-yellow-900/50";
    default: return "bg-zinc-50 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-100 dark:border-zinc-700";
  }
};

export function PeopleTable({ searchQuery = "", activeTab = "All" }: PeopleTableProps) {
  const { data: teamMembers, isLoading, isError } = usePeople(""); 
  
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [openStatusId, setOpenStatusId] = useState<string | null>(null); // 👈 استیت برای کنترل منوی وضعیت
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  
  const queryClient = useQueryClient();
  const menuRef = useRef<HTMLDivElement>(null);

  // بستن منوی وضعیت با کلیک بیرون از آن
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenStatusId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) return null;
      return res.json();
    },
  });

  const isHR = currentUser?.accessLevel === "HR";

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch("/api/people", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
      queryClient.invalidateQueries({ queryKey: ["people-with-logs"] });
      setOpenStatusId(null); // بستن منو بعد از تغییر
    },
  });

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleBulkAction = async (status: "Active" | "Inactive") => {
    setIsBulkUpdating(true);
    try {
      await Promise.all(
        selectedRows.map((id) =>
          fetch("/api/people", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status }),
          })
        )
      );
      
      queryClient.invalidateQueries({ queryKey: ["people"] });
      queryClient.invalidateQueries({ queryKey: ["people-with-logs"] });
      
      const count = selectedRows.length;
      setSelectedRows([]); 
      showToast(`${count} member${count > 1 ? 's' : ''} marked as ${status}.`);
      
    } catch (error) {
      console.error(error);
      showToast("Something went wrong. Please try again.");
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const toggleRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const handleRowClick = (id: string) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const filteredMembers = useMemo(() => {
    if (!teamMembers) return [];
    return teamMembers.filter((member: any) => {
      const matchesTab = activeTab === "All" || member.team === activeTab;
      const matchesSearch = 
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.role.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [teamMembers, activeTab, searchQuery]);

  if (isLoading) {
    return (
      <div className="w-full mt-6 bg-card rounded-[32px] p-12 flex justify-center items-center transition-colors">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !teamMembers) {
    return (
      <div className="w-full mt-6 bg-card rounded-[32px] p-6 text-center text-red-500 text-sm">
        Failed to load team members.
      </div>
    );
  }

  if (filteredMembers.length === 0) {
    return (
      <div className="w-full mt-6 bg-card rounded-[32px] p-12 flex flex-col items-center justify-center text-center shadow-sm border border-border transition-colors min-h-[300px] animate-in fade-in duration-500">
        <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4 border border-border">
          <Users className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-1">
          No members found
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          {searchQuery 
            ? `No members found matching "${searchQuery}".` 
            : `There are no team members assigned to the ${activeTab} team yet.`}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full mt-6 bg-card rounded-[32px] shadow-sm border-none transition-colors animate-in fade-in duration-300 relative">
      
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-foreground text-background px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 z-[100]">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* نوار عملیات گروهی */}
      {selectedRows.length > 0 && (
        <div className="fixed md:absolute bottom-4 md:bottom-auto md:-top-20 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-fit mx-auto bg-foreground text-background px-4 py-3 md:py-2.5 rounded-2xl md:rounded-full shadow-xl flex flex-col md:flex-row items-center gap-3 md:gap-4 animate-in slide-in-from-bottom-4 z-50 border border-border">
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <span className="text-sm font-medium md:pl-2">{selectedRows.length} selected</span>
            <button 
              onClick={() => setSelectedRows([])} 
              className="md:hidden p-1 rounded-full hover:bg-background/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="hidden md:block w-px h-5 bg-background/20" />
          
          <div className="flex gap-2 w-full md:w-auto">
            <button 
              onClick={() => handleBulkAction("Active")}
              disabled={isBulkUpdating}
              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 md:py-1.5 rounded-xl md:rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
            >
              {isBulkUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              Mark Active
            </button>
            <button 
              onClick={() => handleBulkAction("Inactive")}
              disabled={isBulkUpdating}
              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 md:py-1.5 rounded-xl md:rounded-full text-xs font-medium bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors disabled:opacity-50"
            >
              {isBulkUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldBan className="w-3.5 h-3.5" />}
              Mark Inactive
            </button>
          </div>

          <button 
            onClick={() => setSelectedRows([])} 
            className="hidden md:block ml-2 p-1 rounded-full hover:bg-background/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* نمای دسکتاپ */}
      <div className="hidden md:block w-full overflow-visible p-6">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="text-xs text-muted-foreground font-medium border-b border-border transition-colors">
            <tr>
              <th className="pb-4 pl-4 font-medium w-12"></th>
              <th className="pb-4 font-medium">Name</th>
              <th className="pb-4 font-medium">Role</th>
              <th className="pb-4 font-medium">Team</th>
              <th className="pb-4 font-medium">Location</th>
              <th className="pb-4 font-medium">Joined</th>
              <th className="pb-4 pr-4 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((member: any) => {
              const isSelected = selectedRows.includes(member.id);

              return (
                <tr 
                  key={member.id} 
                  onClick={() => handleRowClick(member.id)}
                  className={`group transition-all duration-200 ease-in-out cursor-pointer ${
                    isSelected 
                      ? "bg-muted/80" 
                      : "bg-transparent hover:bg-muted/30"
                  }`}
                >
                  <td className="py-3 pl-4">
                    <div 
                      onClick={(e) => toggleRow(member.id, e)}
                      className={`w-4 h-4 flex items-center justify-center rounded-[4px] border transition-all duration-200 ${
                        isSelected 
                          ? 'bg-foreground border-foreground text-background'
                          : 'bg-transparent border-border group-hover:border-muted-foreground'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" strokeWidth={4} />}
                    </div>
                  </td>
                  
                  <td className="py-3 font-medium text-foreground flex items-center gap-3 transition-colors">
                    <Avatar className="w-8 h-8 border border-border">
                      <AvatarImage src={member.avatar || undefined} />
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        {member.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-foreground">{member.name}</span>
                  </td>
                  
                  <td className="py-3 text-muted-foreground">{member.role}</td>
                  
                  <td className="py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium border ${getTeamBadge(member.team)}`}>
                      {member.team}
                    </span>
                  </td>
                  
                  <td className="py-3 text-muted-foreground">{member.location}</td>
                  <td className="py-3 text-muted-foreground">{format(new Date(member.joinedAt), "MMM yyyy")}</td>
                  
                  <td className="py-3 pr-4">
                    <div className="flex items-center justify-end gap-2">
                      {isHR ? (
                        <div className="relative" ref={openStatusId === member.id ? menuRef : null}>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenStatusId(openStatusId === member.id ? null : member.id);
                            }}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors duration-300 ${getStatusBadge(member.status)}`}
                          >
                            {member.status}
                            <ChevronDown className={`w-3 h-3 opacity-50 transition-transform ${openStatusId === member.id ? 'rotate-180' : ''}`} />
                          </button>
                          
                          {openStatusId === member.id && (
                            <div className="absolute right-0 top-full mt-1 w-28 bg-card border border-border rounded-xl shadow-lg transition-all z-50 overflow-hidden animate-in fade-in slide-in-from-top-1">
                              {["Active", "New", "Away", "Inactive"].map((status) => (
                                <button
                                  key={status}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateStatus.mutate({ id: member.id, status });
                                  }}
                                  className="w-full text-left px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
                                >
                                  {status}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusBadge(member.status)}`}>
                          {member.status}
                        </div>
                      )}

                      {isHR && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingMember(member);
                          }}
                          className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 👇 نمای موبایل */}
      <div className="md:hidden flex flex-col p-2 overflow-hidden">
        {filteredMembers.map((member: any) => {
          const isSelected = selectedRows.includes(member.id);

          return (
            <div 
              key={member.id}
              onClick={() => handleRowClick(member.id)}
              className={`flex items-center justify-between p-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                isSelected 
                  ? "bg-muted/80 shadow-sm" 
                  : "bg-transparent hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div 
                  onClick={(e) => toggleRow(member.id, e)}
                  className={`w-4 h-4 shrink-0 flex items-center justify-center rounded-[4px] border transition-all duration-200 ${
                    isSelected 
                      ? 'bg-foreground border-foreground text-background'
                      : 'bg-transparent border-border'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3" strokeWidth={4} />}
                </div>

                <Avatar className="w-9 h-9 border border-border shrink-0">
                  <AvatarImage src={member.avatar || undefined} />
                  <AvatarFallback className="bg-muted text-muted-foreground font-bold text-xs">
                    {member.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-foreground text-[13px] truncate">{member.name}</span>
                  <span className="text-[11px] text-muted-foreground truncate">{member.role}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 ml-1">
                {isHR ? (
                  <div className="relative" ref={openStatusId === member.id ? menuRef : null}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenStatusId(openStatusId === member.id ? null : member.id);
                      }}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors duration-300 ${getStatusBadge(member.status)}`}
                    >
                      {member.status}
                      <ChevronDown className={`w-3 h-3 opacity-50 transition-transform ${openStatusId === member.id ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {openStatusId === member.id && (
                      <div className="absolute right-0 top-full mt-1 w-24 bg-card border border-border rounded-xl shadow-lg transition-all z-50 overflow-hidden animate-in fade-in slide-in-from-top-1">
                        {["Active", "New", "Away", "Inactive"].map((status) => (
                          <button
                            key={status}
                            onClick={(e) => {
                              e.stopPropagation();
                              updateStatus.mutate({ id: member.id, status });
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(member.status)}`}>
                    {member.status}
                  </div>
                )}

                {isHR && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingMember(member);
                    }}
                    className="p-1 hover:bg-muted rounded-lg text-muted-foreground transition-colors"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {editingMember && (
        <EditMemberModal 
          member={editingMember} 
          isOpen={!!editingMember} 
          onClose={() => setEditingMember(null)} 
        />
      )}
    </div>
  );
}