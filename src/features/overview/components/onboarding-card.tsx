"use client";

import { useState } from "react";
import { CheckCircle2, Circle, MonitorPlay, Key, Laptop, Target, Coffee, BookOpen, Loader2, Plus, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useTasks, useToggleTask, useAddTask } from "../api/use-tasks";
import { format } from "date-fns";

const getTaskIcon = (title: string, category: string) => {
  if (category === "Setup") return Laptop;
  if (category === "Team") return Coffee;
  const t = title.toLowerCase();
  if (t.includes("interview")) return MonitorPlay;
  if (t.includes("tax") || t.includes("access")) return Key;
  if (t.includes("goal")) return Target;
  return BookOpen;
};

export function OnboardingCard() {
  const { data: tasks, isLoading } = useTasks();
  const toggleTask = useToggleTask();
  const addTask = useAddTask();
  
  const [activeTab, setActiveTab] = useState("Paperwork");
  const tabs = ["Paperwork", "Setup", "Team"];

  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter(t => t.isCompleted).length || 0;
  const progressPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const filteredTasks = tasks?.filter(task => {
    const taskCategory = (task as any).category || "Paperwork";
    return taskCategory === activeTab;
  });

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    addTask.mutate({ title: newTaskTitle, category: activeTab }, {
      onSuccess: () => {
        setNewTaskTitle(""); 
        setIsAdding(false);  
      }
    });
  };

  if (isLoading) {
    return (
      <Card className="rounded-[32px] border-none shadow-sm bg-card p-6 lg:row-span-2 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </Card>
    );
  }

  return (
    <Card className="rounded-[32px] border-none shadow-sm bg-card border-border text-foreground p-6 lg:row-span-2 flex flex-col h-full transition-colors">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-bold text-foreground">Onboarding</h3>
          <div className="flex items-center gap-6 mt-4 text-xs font-bold border-b border-border pb-3">
            {tabs.map((tab) => (
              <span 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`cursor-pointer transition-colors pb-3 -mb-[13px] ${
                  activeTab === tab ? "text-foreground border-b-2 border-primary" : "text-muted-foreground hover:text-foreground border-b-2 border-transparent"
                }`}
              >
                {tab}
              </span>
            ))}
          </div>
        </div>
        <span className="text-2xl font-bold text-foreground">{progressPercentage}%</span>
      </div>

      <div className="bg-muted/30 border border-border rounded-[24px] p-5 flex-1 text-foreground overflow-hidden flex flex-col relative">
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-muted-foreground">Onboarding tasks</span>
            <button 
              onClick={() => setIsAdding(!isAdding)} 
              className="p-1 bg-primary/20 hover:bg-primary/30 rounded-full transition-colors text-primary"
            >
              <Plus className={`w-3 h-3 transition-transform ${isAdding ? "rotate-45" : ""}`} />
            </button>
          </div>
          <span className="text-sm font-bold text-muted-foreground">
            {filteredTasks?.filter(t => t.isCompleted).length || 0}/{filteredTasks?.length || 0}
          </span>
        </div>
        
        {isAdding && (
          <form onSubmit={handleAddTask} className="mb-4 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <input
              autoFocus
              type="text"
              placeholder={`Add task to ${activeTab}...`}
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-[13px] text-foreground focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
            />
            <button 
              type="submit" 
              disabled={addTask.isPending} 
              className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {addTask.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            </button>
          </form>
        )}

        <div className="space-y-5 overflow-y-auto pr-2 custom-scrollbar flex-1 relative z-10">
          {filteredTasks?.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center mt-4">No tasks in {activeTab}.</p>
          ) : (
            filteredTasks?.map((task, index) => {
              const taskCategory = (task as any).category || "Paperwork";
              const Icon = getTaskIcon(task.title, taskCategory);
              const isActive = !task.isCompleted && (index === 0 || filteredTasks[index - 1].isCompleted);

              let iconColorClass = "bg-muted text-muted-foreground";
              if (taskCategory === "Setup") iconColorClass = "bg-blue-500/10 text-blue-500";
              else if (taskCategory === "Team") iconColorClass = "bg-purple-500/10 text-purple-500";
              else if (taskCategory === "Paperwork") iconColorClass = "bg-primary/10 text-primary";

              return (
                <div 
                  key={task.id} 
                  onClick={() => toggleTask.mutate({ id: task.id, isCompleted: !task.isCompleted })}
                  className={`flex items-start justify-between group cursor-pointer ${isActive ? 'opacity-100' : 'opacity-70 hover:opacity-100'} transition-opacity`}
                >
                  <div className="flex gap-3">
                    <div className={`mt-0.5 p-1.5 rounded-md ${iconColorClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold transition-colors ${task.isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{task.title}</h4>
                      <p className="text-[11px] text-muted-foreground mt-1">{format(new Date(task.dueDate), "MMM d, HH:mm")}</p>
                    </div>
                  </div>
                  <div>
                    {task.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-primary fill-primary/20" />
                    ) : (
                      <Circle className="w-5 h-5 text-border group-hover:text-primary transition-colors" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Card>
  );
}