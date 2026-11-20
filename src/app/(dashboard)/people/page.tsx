"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { PeopleTable } from "@/features/people/components/people-table";
import { AddMemberModal } from "@/features/people/components/add-member-modal";
import { usePeople } from "@/features/people/api/use-people";

export default function PeoplePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const { data: teamMembers } = usePeople();

  const tabs = ["All", "Design", "Engineering", "Product", "Operations"];

  return (
    <div className="flex flex-col animate-in fade-in duration-500 w-full">
      
      {/* 👇 هدر: در موبایل عمودی و مینیمال */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 w-full">
        
        <div className="flex flex-col gap-4 w-full md:w-auto">
          <h1 className="text-2xl md:text-3xl font-medium text-foreground transition-colors">
            People
          </h1>
          
          {/* 👇 تب‌ها: اسکرول افقی با استایل مخفی */}
          <div className="flex items-center gap-5 text-sm font-medium text-muted-foreground overflow-x-auto pb-1 w-full max-w-full hide-scrollbar">
            {tabs.map((tab) => (
              <span
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`cursor-pointer transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-primary text-primary-foreground px-4 py-1.5 rounded-full shadow-sm"
                    : "hover:text-foreground"
                }`}
              >
                {tab}
                {tab === "All" && (
                  <span className="opacity-70 ml-1.5">{teamMembers?.length || 0}</span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* 👇 اکشن‌ها: در موبایل افقی و فشرده */}
        <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
          <div className="relative flex-1 md:flex-none">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search members..." 
              className="w-full md:w-60 pl-9 pr-4 py-2.5 bg-card border border-border rounded-full shadow-sm text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground text-foreground"
            />
          </div>
          
          <div className="shrink-0">
            <AddMemberModal />
          </div>
        </div>
      </div>

      {/* جدول اصلی */}
      <PeopleTable searchQuery={searchQuery} activeTab={activeTab} />
      
    </div>
  );
}