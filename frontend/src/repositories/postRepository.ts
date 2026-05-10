import { supabase } from "../lib/supabase";

export type CreatePostInput = {
  userId: string;
  content: string;
  imageUrl?: string | null;
};

export type PostWithAuthor = {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  like_count: number;
  comment_count: number;
  author: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
};

export const postRepository = {
  async create(input: CreatePostInput): Promise<{ id: string }> {
    const { data, error } = await supabase
      .from("posts")
      .insert({
        user_id: input.userId,
        content: input.content,
        image_url: input.imageUrl ?? null,
      })
      .select("id")
      .single();

    if (error) throw error;
    return { id: data.id as string };
  },

  async findAllWithAuthor(limit: number): Promise<PostWithAuthor[]> {
    const { data, error } = await supabase
      .from("posts_with_counts")
      .select(
        "id, content, image_url, created_at, like_count, comment_count, user_id",
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    if (!data || data.length === 0) return [];

    const userIds = [...new Set(data.map((row) => row.user_id as string))];
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url")
      .in("id", userIds);

    if (profilesError) throw profilesError;

    const profileMap = new Map(
      (profiles ?? []).map((profile) => [profile.id, profile]),
    );

    return data.map((row) => {
      const author = profileMap.get(row.user_id as string);
      return {
        id: row.id as string,
        content: row.content as string,
        image_url: (row.image_url as string | null) ?? null,
        created_at: row.created_at as string,
        like_count: (row.like_count as number) ?? 0,
        comment_count: (row.comment_count as number) ?? 0,
        author: {
          id: row.user_id as string,
          username: author?.username ?? null,
          full_name: author?.full_name ?? null,
          avatar_url: author?.avatar_url ?? null,
        },
      };
    });
  },

  async getUserPostStats(userId: string): Promise<{
    totalPosts: number;
    postsLast30d: number;
  }> {
    const { data, error } = await supabase
      .from("profile_post_counts")
      .select("total_posts, posts_last_30d")
      .eq("profile_id", userId)
      .maybeSingle();

    if (error) throw error;

    return {
      totalPosts: (data?.total_posts as number | null) ?? 0,
      postsLast30d: (data?.posts_last_30d as number | null) ?? 0,
    };
  },
};

