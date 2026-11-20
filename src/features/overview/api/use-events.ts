import { useQuery } from "@tanstack/react-query";

export interface Event {
  id: string;
  title: string;
  date: string | Date;
  type: string | null;
  location: string | null;
  visibility: string;
  creatorId: string | null;
  creator?: {
    name: string;
    avatar: string | null;
  } | null; // 👈 اضافه کردن تایپ creator
}

export function useEvents() {
  return useQuery<Event[]>({
    queryKey: ["events"],
    queryFn: async () => {
      const res = await fetch("/api/events");
      if (!res.ok) throw new Error("Failed to fetch events");
      return res.json();
    },
  });
}