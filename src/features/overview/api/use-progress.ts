import { useQuery } from "@tanstack/react-query";

type DayProgress = {
  id: number;
  label: string;
  value: number; // درصدی از ارتفاع ستون (۰ تا ۱۰۰)
  type: "normal" | "active" | "empty" | "highlight";
  tooltip?: string;
};

type ProgressData = {
  average: string;
  label: string;
  days: DayProgress[];
};

export function useProgress() {
  return useQuery<ProgressData>({
    queryKey: ["progress"],
    queryFn: async () => {
      const res = await fetch("/api/progress");
      if (!res.ok) throw new Error("Failed to fetch progress");
      return res.json();
    },
  });
}