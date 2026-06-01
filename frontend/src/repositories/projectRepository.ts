import { supabase } from "../lib/supabase";

export type ProjectRow = {
  id: string;
  owner_id: string;
  slug: string | null;
  name: string;
  description: string | null;
  repo_url: string | null;
  live_url: string | null;
  is_verified: boolean;
  created_at: string;
};

export type CreateProjectInput = {
  ownerId: string;
  name: string;
  description?: string;
  repoUrl?: string;
  liveUrl?: string;
};

function toNullableTrimmed(value?: string) {
  const v = value?.trim() ?? "";
  return v.length > 0 ? v : null;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50);
}

export const projectRepository = {
  async listByOwner(ownerId: string): Promise<ProjectRow[]> {
    const { data, error } = await supabase
      .from("projects")
      .select("id, owner_id, slug, name, description, repo_url, live_url, is_verified, created_at")
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as ProjectRow[];
  },

  async create(input: CreateProjectInput): Promise<ProjectRow> {
    const name = input.name.trim();
    if (!name) throw new Error("Project name is required.");

    const seed = slugify(name) || "project";
    const suffix = Date.now().toString(36).slice(-5);

    const { data, error } = await supabase
      .from("projects")
      .insert({
        owner_id: input.ownerId,
        name,
        slug: `${seed}-${suffix}`,
        description: toNullableTrimmed(input.description),
        repo_url: toNullableTrimmed(input.repoUrl),
        live_url: toNullableTrimmed(input.liveUrl),
      })
      .select("id, owner_id, slug, name, description, repo_url, live_url, is_verified, created_at")
      .single();

    if (error) throw error;
    return data as ProjectRow;
  },

  async remove(projectId: string): Promise<void> {
    const { error } = await supabase.from("projects").delete().eq("id", projectId);
    if (error) throw error;
  },
};
