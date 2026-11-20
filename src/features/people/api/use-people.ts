import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "@prisma/client";

export function usePeople(searchQuery: string = "") {
  return useQuery<User[]>({
    // اضافه کردن searchQuery به queryKey برای رفرش خودکار کش با هر بار تایپ
    queryKey: ["people", searchQuery],
    queryFn: async () => {
      const url = searchQuery 
        ? `/api/people?search=${encodeURIComponent(searchQuery)}` 
        : "/api/people";
        
      const res = await fetch(url);
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    },
  });
}

export function useAddPerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newPerson: Partial<User>) => {
      const res = await fetch("/api/people", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPerson),
      });
      if (!res.ok) throw new Error("Failed to add person");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
    },
  });
}