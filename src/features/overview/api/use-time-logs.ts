import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TimeLog } from "@prisma/client";

export function useTimeLog() {
  return useQuery<TimeLog | null>({
    queryKey: ["time-log"],
    queryFn: async () => {
      const res = await fetch("/api/time-logs");
      if (!res.ok) throw new Error("Failed to fetch time log");
      return res.json();
    },
  });
}

export function useSaveTimeLog() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (durationMinutes: number) => {
      const res = await fetch("/api/time-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duration: durationMinutes }),
      });
      if (!res.ok) throw new Error("Failed to save time log");
      return res.json();
    },
    onSuccess: () => {
      // این بخش باعث می‌شود نمودار Progress به صورت خودکار و بدون رفرش آپدیت شود
      queryClient.invalidateQueries({ queryKey: ["time-log"] });
      queryClient.invalidateQueries({ queryKey: ["progress"] });
    }
  });
}