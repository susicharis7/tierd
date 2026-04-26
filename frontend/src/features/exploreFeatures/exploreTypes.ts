/** Cursor-paginated chunk; reusable for other list endpoints. */
export type PaginatedResult<T> = {
  items: T[];
  /** ISO `created_at` of the last item when another page may exist; otherwise null. */
  nextCursor: string | null;
};

export type ExploreProfile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type FeedPost = {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  like_count: number;
  comment_count: number;
  /** Filled client-side for logged-in users. */
  liked_by_me?: boolean;
  author: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
};

export type PostComment = {
  id: string;
  post_id: string;
  content: string;
  created_at: string;
  author: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
};
