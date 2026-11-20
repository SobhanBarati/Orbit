"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { 
  Search, ChevronLeft, ChevronRight, FileText, Download, Mail, MapPin, 
  Briefcase, Loader2, TrendingUp, Check, X, CalendarDays
} from "lucide-react";
import { format, getDaysInMonth, startOfMonth, getDay, isSameDay } from "date-fns";
import { RequestLeaveModal } from "@/features/payroll/components/request-leave-modal";

export default function PayrollPage() {
  const [activeTab, setActiveTab] = useState("Work hours");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());

  const queryClient = useQueryClient();

  const { data: currentUser, isLoading: isLoadingCurrentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) return null;
      return res.json();
    },
  });

  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["people-with-logs"],
    queryFn: async () => {
      const res = await fetch("/api/people");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { data: leaves = [], isLoading: isLoadingLeaves } = useQuery({
    queryKey: ["leaves"],
    queryFn: async () => {
      const res = await fetch("/api/leaves");
      if (!res.ok) return [];
      return res.json();
    },
  });

  useEffect(() => {
    if (currentUser && !selectedUserId) {
      setSelectedUserId(currentUser.id);
    }
  }, [currentUser, selectedUserId]);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter((u: any) => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const selectedUser = useMemo(() => {
    if (!users || users.length === 0) return null;
    return users.find((u: any) => u.id === selectedUserId) || currentUser || users[0];
  }, [users, selectedUserId, currentUser]);

  const currentMonthLogs = useMemo(() => {
    if (!selectedUser?.timeLogs) return [];
    return selectedUser.timeLogs.filter((log: any) => {
      const logDate = new Date(log.date);
      return logDate.getMonth() === currentDate.getMonth() && logDate.getFullYear() === currentDate.getFullYear();
    });
  }, [selectedUser, currentDate]);

  const totalMinutesThisMonth = currentMonthLogs.reduce((acc: number, log: any) => acc + (log.duration || 0), 0);
  const totalOvertimeThisMonth = currentMonthLogs.reduce((acc: number, log: any) => acc + (log.overtime || 0), 0);
  const totalHoursThisMonth = (totalMinutesThisMonth / 60).toFixed(1);
  const totalOvertimeHours = (totalOvertimeThisMonth / 60).toFixed(1);
  
  const targetHours = 160;
  const progressPercent = Math.min(100, Math.round((parseFloat(totalHoursThisMonth) / targetHours) * 100));

  const totalPTO = 25;
  const usedPTO = selectedUser?.usedPTO || 0; 
  const ptoPercent = Math.round((usedPTO / totalPTO) * 100);

  const handleDownloadPayslip = () => {
    if (!selectedUser) return;
    const monthlySalary = selectedUser.baseSalary ? Math.round(selectedUser.baseSalary / 12) : 0;
    const csvContent = `Name,Role,Email,Base Salary,Monthly Salary,Month\n"${selectedUser.name}","${selectedUser.role}","${selectedUser.email}",$${selectedUser.baseSalary || 0},$${monthlySalary},${format(currentDate, "MMMM yyyy")}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Payslip_${selectedUser.name.replace(" ", "_")}_${format(currentDate, "MMM_yyyy")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLeaveStatus = async (id: string, status: "Approved" | "Rejected") => {
    try {
      const res = await fetch("/api/leaves", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ["leaves"] });
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      }
    } catch (error) {
      console.error("Failed to update leave status", error);
    }
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const startingDayOfWeek = getDay(startOfMonth(currentDate));
  const monthName = format(currentDate, "MMMM yyyy");
  const monthlySalary = selectedUser?.baseSalary ? Math.round(selectedUser.baseSalary / 12) : 0;

  if (isLoadingCurrentUser || isLoadingUsers || isLoadingLeaves) {
    return (
      <div className="flex h-[850px] items-center justify-center bg-background w-full transition-colors">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[850px] p-4 md:p-6 bg-background w-full transition-colors">
      
      {/* ستون راست (پروفایل) */}
      {selectedUser && (
        <Card className="w-full lg:w-[320px] shrink-0 rounded-[32px] border-none shadow-sm bg-card p-6 flex flex-col h-full overflow-y-auto transition-colors order-1 lg:order-3">
          <div className="flex flex-col items-center mb-6 mt-2">
            <Avatar className="w-24 h-24 border-4 border-primary/20 shadow-sm mb-4">
              <AvatarImage src={selectedUser.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {selectedUser.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-[18px] font-bold text-foreground text-center">{selectedUser.name}</h2>
            <p className="text-[13px] font-medium text-muted-foreground mt-1 text-center">{selectedUser.role} • {selectedUser.team}</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-[13px]">
              <Mail className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground w-16">Email</span>
              <span className="font-bold text-foreground truncate" title={selectedUser.email}>{selectedUser.email}</span>
            </div>
            <div className="flex items-center gap-3 text-[13px]">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground w-16">Based in</span>
              <span className="font-bold text-foreground">{selectedUser.location}</span>
            </div>
            <div className="flex items-center gap-3 text-[13px]">
              <Briefcase className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground w-16">Joined</span>
              <span className="font-bold text-foreground">{format(new Date(selectedUser.joinedAt), "MMM yyyy")}</span>
            </div>
          </div>

          <div className="mb-8">
            <h4 className="text-[14px] font-bold text-foreground mb-3">Documents</h4>
            <div className="flex flex-col gap-2">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-background rounded-xl text-[12px] font-bold text-foreground hover:bg-muted border border-border transition-colors w-full justify-start">
                <FileText className="w-4 h-4 text-primary" /> Contract.pdf
              </button>
              <button 
                onClick={handleDownloadPayslip}
                className="flex items-center gap-2 px-4 py-2.5 bg-background rounded-xl text-[12px] font-bold text-foreground hover:bg-muted border border-border transition-colors w-full justify-between group"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" /> Payslip-{format(currentDate, "MM")}.csv
                </div>
                <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-[14px] font-bold text-foreground mb-4">This month</h4>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-[12px] font-bold mb-2">
                  <span className="text-muted-foreground">Paid time off</span>
                  <span className="text-foreground">{usedPTO} / {totalPTO}</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden transition-colors">
                  <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${ptoPercent}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[12px] font-bold mb-2">
                  <span className="text-muted-foreground">Hours vs plan</span>
                  <span className="text-foreground">{totalHoursThisMonth} / {targetHours}</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden transition-colors">
                  <div className="h-full bg-foreground rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ستون وسط (کارت اصلی) */}
      <Card className="flex-1 rounded-[32px] border-none shadow-sm bg-card p-4 md:p-8 flex flex-col w-full min-w-0 transition-colors order-2 lg:order-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
          <div>
            <div className="text-[24px] md:text-[32px] font-bold text-foreground tracking-tight leading-none mb-4">
              {totalHoursThisMonth}
              <span className="text-lg md:text-xl text-muted-foreground font-medium ml-1">h</span> 
              <span className="text-lg md:text-xl font-normal text-muted-foreground/50 mx-2">/</span> 
              ${monthlySalary.toLocaleString()}
            </div>
            <div className="flex gap-4 md:gap-8 text-[13px] md:text-[14px] font-medium mt-2 overflow-x-auto hide-scrollbar">
              {["Work hours", "Overtime", "Leave"].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 border-b-[3px] whitespace-nowrap transition-colors ${
                    activeTab === tab ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col items-start sm:items-end gap-3 mb-2 w-full sm:w-auto">
            <span className="text-sm font-bold text-foreground">{monthName}</span>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                className="p-2 bg-background rounded-full shadow-sm hover:bg-muted transition-colors border border-border"
              >
                <ChevronLeft className="w-4 h-4 text-foreground" />
              </button>
              <button 
                onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                className="p-2 bg-background rounded-full shadow-sm hover:bg-muted transition-colors border border-border"
              >
                <ChevronRight className="w-4 h-4 text-foreground" />
              </button>
            </div>
          </div>
        </div>

        {activeTab === "Work hours" && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-6 md:h-8 bg-muted rounded-full flex transition-colors overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full flex items-center justify-center transition-all duration-500 min-w-[3rem]" 
                  style={{ width: `${Math.max(progressPercent, 5)}%` }}
                >
                  <span className="text-[10px] md:text-[12px] font-bold text-primary-foreground">{progressPercent}%</span>
                </div>
              </div>
              <div className="px-3 md:px-4 py-1 md:py-1.5 bg-background border border-border text-foreground text-[10px] md:text-[12px] font-bold rounded-full transition-colors">
                {Math.max(0, 100 - progressPercent)}%
              </div>
            </div>

            {/* 👇 نمای تقویم ماهانه برای دسکتاپ - اصلاح شده با w-full */}
            <div className="hidden md:block flex-1 bg-background rounded-[24px] shadow-sm border border-border p-6 transition-colors w-full">
              <div className="grid grid-cols-7 gap-y-8 text-center w-full">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div key={i} className="text-[12px] font-bold text-muted-foreground mb-2">{day}</div>
                ))}
                
                {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dayLog = currentMonthLogs.find((log: any) => new Date(log.date).getDate() === dayNum);
                  const hasWork = !!dayLog;
                  const hoursWorked = dayLog ? (dayLog.duration / 60).toFixed(1) : 0;
                  const isSelected = dayNum === selectedDay;
                  
                  return (
                    <div 
                      key={i} 
                      onClick={() => setSelectedDay(dayNum)}
                      className={`flex flex-col items-center justify-center gap-1 group cursor-pointer p-2 rounded-2xl transition-all ${
                        isSelected 
                          ? 'border-2 border-primary bg-primary/5 shadow-sm' 
                          : 'border-2 border-transparent hover:bg-muted/50'
                      }`}
                    >
                      <span className={`text-[15px] font-bold ${
                        hasWork || isSelected ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {dayNum}
                      </span>
                      <div className="h-4 flex items-center justify-center mt-1">
                        {hasWork && (
                          <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-md">
                            {hoursWorked}h
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 👇 نمای لیست عمودی برای موبایل */}
            <div className="md:hidden flex flex-col gap-2 w-full">
              {currentMonthLogs.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground bg-background rounded-2xl border border-border">
                  No work logs this month.
                </div>
              ) : (
                currentMonthLogs.map((log: any) => {
                  const logDate = new Date(log.date);
                  const hoursWorked = (log.duration / 60).toFixed(1);
                  const percentOfDay = Math.min((log.duration / 480) * 100, 100);
                  
                  return (
                    <div key={log.id} className="flex items-center justify-between bg-background p-3 rounded-xl border border-border w-full">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex flex-col items-center justify-center">
                          <span className="text-[10px] font-bold leading-none">{format(logDate, "MMM")}</span>
                          <span className="text-sm font-bold leading-none">{format(logDate, "d")}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-foreground">{hoursWorked} hours</span>
                          <span className="text-[11px] text-muted-foreground">{format(logDate, "EEEE")}</span>
                        </div>
                      </div>
                      <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${percentOfDay}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {activeTab === "Overtime" && (
          <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-6">
              <div className="bg-background rounded-[24px] p-5 md:p-6 border border-border">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs md:text-sm font-bold text-muted-foreground">Total Overtime</span>
                  <span className="px-2 md:px-3 py-1 bg-primary/10 text-primary text-[9px] md:text-[10px] font-bold rounded-full">This Month</span>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-foreground">
                  {totalOvertimeHours} <span className="text-base md:text-lg text-muted-foreground font-normal">hrs</span>
                </div>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-2">Based on your work logs</p>
              </div>

              <div className="bg-background rounded-[24px] p-5 md:p-6 border border-border">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs md:text-sm font-bold text-muted-foreground">Hourly Rate</span>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-foreground">
                  ${monthlySalary ? Math.round(monthlySalary / 160) : 0}
                </div>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-2">Estimated per hour</p>
              </div>
            </div>

            <div className="bg-background rounded-[24px] shadow-sm border border-border p-6 flex-1 flex flex-col items-center justify-center transition-colors">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              </div>
              <p className="text-sm font-bold text-foreground">Overtime Details</p>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-2 text-center max-w-xs">
                You have logged {totalOvertimeHours} hours of overtime this month. Keep up the hard work!
              </p>
            </div>
          </div>
        )}

        {activeTab === "Leave" && (
          <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-background rounded-[24px] shadow-sm border border-border p-4 md:p-6 flex-1 flex flex-col transition-colors">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                <h3 className="font-bold text-foreground">Leave Requests</h3>
                {currentUser?.accessLevel !== "HR" && <RequestLeaveModal />}
              </div>
              
              <div className="space-y-3 md:space-y-4">
                {leaves.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-10">No leave requests found.</div>
                ) : (
                  leaves.map((leave: any) => (
                    <div key={leave.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 border border-border rounded-2xl gap-3">
                      <div className="flex items-center gap-3 md:gap-4">
                        <Avatar className="w-9 h-9 md:w-10 md:h-10">
                          <AvatarImage src={leave.user.avatar} />
                          <AvatarFallback className="bg-muted text-muted-foreground">
                            {leave.user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-bold text-foreground">{leave.user.name}</p>
                          <p className="text-[11px] md:text-xs text-muted-foreground">
                            {leave.type} • {leave.days} Days • {format(new Date(leave.startDate), "MMM d")}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-end gap-2">
                        <span className={`px-2 md:px-3 py-1 text-[10px] md:text-[11px] font-bold rounded-full border
                          ${leave.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 
                            leave.status === 'Rejected' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' : 
                            'bg-primary/10 text-primary border-primary/20'}`}
                        >
                          {leave.status}
                        </span>

                        {currentUser?.accessLevel === "HR" && leave.status === "Pending" && (
                          <div className="flex gap-1 md:gap-2 ml-2 md:ml-4">
                            <button 
                              onClick={() => handleLeaveStatus(leave.id, "Approved")}
                              className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <Check className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            </button>
                            <button 
                              onClick={() => handleLeaveStatus(leave.id, "Rejected")}
                              className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <X className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* ستون چپ (لیست تیم) */}
      <Card className="w-full lg:w-[280px] shrink-0 rounded-[32px] border-none shadow-sm bg-card p-4 flex flex-col h-full overflow-hidden transition-colors order-3 lg:order-1">
        <div className="flex flex-col gap-4 mb-4 px-2 mt-2">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-[16px] text-foreground">Team</h3>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search member..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-colors text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>
        
        <div className="flex flex-col gap-1.5 overflow-y-auto hide-scrollbar">
          {filteredUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center mt-4">No members found</p>
          ) : (
            filteredUsers.map((member: any) => {
              const isActive = selectedUser?.id === member.id;
              return (
                <div 
                  key={member.id}
                  onClick={() => setSelectedUserId(member.id)}
                  className={`relative flex items-center gap-3 p-3 rounded-[20px] cursor-pointer transition-all ${
                    isActive ? "bg-muted/80 shadow-sm" : "bg-transparent hover:bg-muted/50"
                  }`}
                >
                  {isActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-l-full" />
                  )}
                  
                  <Avatar className={`w-10 h-10 border-2 ${isActive ? 'border-primary/30' : 'border-background shadow-sm'}`}>
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className={isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground text-xs"}>
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className={`text-[14px] font-bold leading-tight ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {member.name}
                    </span>
                    <span className={`text-[12px] mt-0.5 ${isActive ? 'text-primary' : 'text-muted-foreground/70'}`}>
                      {member.role || member.team}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}