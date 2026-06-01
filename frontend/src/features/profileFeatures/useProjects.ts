import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "../../components/ui/sonner";
import { projectRepository, type CreateProjectInput } from "../../repositories/projectRepository";

export const projectsKeys = {
  byOwner: (ownerId: string | null) => ["projects", "by-owner", ownerId] as const,
};

export function useProjectsQuery(ownerId: string | null) {
  return useQuery({
    queryKey: projectsKeys.byOwner(ownerId),
    queryFn: () => projectRepository.listByOwner(ownerId!),
    enabled: Boolean(ownerId),
    staleTime: 20_000,
  });
}

export function useCreateProjectMutation(ownerId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Omit<CreateProjectInput, "ownerId">) => {
      if (!ownerId) throw new Error("Missing owner id.");
      return projectRepository.create({ ownerId, ...input });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: projectsKeys.byOwner(ownerId) });
      toast("Project submitted.");
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Could not submit project.";
      toast(message);
    },
  });
}

export function useDeleteProjectMutation(ownerId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => projectRepository.remove(projectId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: projectsKeys.byOwner(ownerId) });
      toast("Project removed.");
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Could not remove project.";
      toast(message);
    },
  });
}
