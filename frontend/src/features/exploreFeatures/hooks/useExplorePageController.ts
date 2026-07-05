import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../authFeatures/AuthProvider";
import {
  useExploreProfilesQuery,
  useExploreFeedQuery,
  useExploreFeedLikedPostIdsQuery,
  useExploreSearchQuery,
  useExploreCommentsQuery,
  useExploreLikeMutation,
  useExploreAddCommentMutation,
  useExploreDeleteCommentMutation,
  useExploreDeletePostMutation,
  useExploreCreatePostMutation,
  useExploreUpdatePostMutation,
} from "../useExplorePageData";
import { getExploreActionableMessage } from "../exploreErrors";
import { toast } from "../../../components/ui/sonner";
import { useExploreInfiniteScroll } from "./useExploreInfiniteScroll";

export function useExplorePageController() {
  const { profile: currentProfile, userId, loading: authLoading } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");

  const profilesQuery = useExploreProfilesQuery();
  const feedQuery = useExploreFeedQuery();
  const rawPosts = useMemo(
    () => feedQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [feedQuery.data],
  );
  const visiblePostIds = useMemo(() => rawPosts.map((p) => p.id), [rawPosts]);
  const likedPostIdsQuery = useExploreFeedLikedPostIdsQuery(userId, visiblePostIds);
  const {
    data: searchResults,
    isFetching: searchFetching,
    isPending: searchPending,
    debouncedSearch,
  } = useExploreSearchQuery(searchQuery);

  const [composerContent, setComposerContent] = useState("");
  const [composerImageFile, setComposerImageFile] = useState<File | null>(null);
  const [composerImagePreview, setComposerImagePreview] = useState<string | null>(null);

  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null);
  const [lightboxPostId, setLightboxPostId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState("");

  const commentsFetchPostId = lightboxPostId ?? openCommentsPostId;
  const commentsQuery = useExploreCommentsQuery(commentsFetchPostId);

  useEffect(() => {
    if (!commentsFetchPostId || !commentsQuery.isError) return;
    const err = commentsQuery.error;
    toast(getExploreActionableMessage(err) ?? "Could not load comments.");
  }, [commentsFetchPostId, commentsQuery.isError, commentsQuery.error]);

  const likeMutation = useExploreLikeMutation(userId);
  const commentMutation = useExploreAddCommentMutation(userId, currentProfile);
  const deleteCommentMutation = useExploreDeleteCommentMutation(userId);
  const deletePostMutation = useExploreDeletePostMutation(userId);
  const updatePostMutation = useExploreUpdatePostMutation(userId);
  const createPostMutation = useExploreCreatePostMutation(userId);

  const profiles = profilesQuery.data ?? [];
  const profilesLoading = profilesQuery.isPending;
  const posts = useMemo(() => {
    if (!userId) {
      return rawPosts.map((p) => ({ ...p, liked_by_me: false }));
    }

    const likedPostIds = likedPostIdsQuery.data;
    if (!likedPostIds) return rawPosts;

    return rawPosts.map((p) => ({
      ...p,
      liked_by_me: likedPostIds.has(p.id),
    }));
  }, [likedPostIdsQuery.data, rawPosts, userId]);
  const postsLoading = feedQuery.isPending;

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = feedQuery;

  const { loadMoreSentinelRef } = useExploreInfiniteScroll({
    postsLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

  const searchLoading =
    searchQuery.trim().length > 0 &&
    (searchQuery.trim() !== debouncedSearch ||
      (debouncedSearch.length > 0 && (searchPending || searchFetching)));

  const showSearchResults = searchQuery.trim().length > 0;

  const commentsForActivePost = commentsFetchPostId ? (commentsQuery.data ?? []) : [];
  const commentsLoadingActive =
    Boolean(commentsFetchPostId) && (commentsQuery.isPending || commentsQuery.isFetching);

  const lightboxPost = lightboxPostId
    ? posts.find((p) => p.id === lightboxPostId)
    : undefined;

  const handleOpenMediaLightbox = (postId: string) => {
    setOpenCommentsPostId(null);
    setCommentDraft("");
    setLightboxPostId(postId);
  };

  const handleToggleLike = (postId: string) => {
    if (!userId) {
      toast("Log in to like posts.");
      return;
    }
    likeMutation.mutate({ postId });
  };

  const handleToggleComments = (postId: string) => {
    if (openCommentsPostId === postId) {
      setOpenCommentsPostId(null);
      setCommentDraft("");
      return;
    }
    setOpenCommentsPostId(postId);
    setCommentDraft("");
  };

  const handleSubmitComment = (postId: string) => {
    if (!userId) {
      toast("Log in to comment.");
      return;
    }
    const trimmed = commentDraft.trim();
    if (!trimmed) return;

    commentMutation.mutate(
      { postId, content: trimmed },
      {
        onSuccess: () => {
          setCommentDraft("");
        },
      },
    );
  };

  const handleDeleteComment = (postId: string, commentId: string) => {
    if (!userId) {
      toast("Log in to manage comments.");
      return;
    }

    deleteCommentMutation.mutate({ postId, commentId });
  };

  const handleDeletePost = (postId: string) => {
    if (!userId) {
      toast("Log in to manage posts.");
      return;
    }
    if (openCommentsPostId === postId) {
      setOpenCommentsPostId(null);
      setCommentDraft("");
    }
    if (lightboxPostId === postId) {
      setLightboxPostId(null);
      setCommentDraft("");
    }
    deletePostMutation.mutate({ postId });
  };

  const handleEditPost = async (postId: string, content: string) => {
    if (!userId) {
      toast("Log in to manage posts.");
      return;
    }
    await updatePostMutation.mutateAsync({ postId, content });
  };

  const handleComposerImageSelect = (file: File) => {
    setComposerImageFile(file);
    const url = URL.createObjectURL(file);
    setComposerImagePreview(url);
  };

  const handleComposerImageRemove = () => {
    setComposerImageFile(null);
    if (composerImagePreview) URL.revokeObjectURL(composerImagePreview);
    setComposerImagePreview(null);
  };

  const handleComposerSubmit = async () => {
    if (!userId) {
      toast("Log in to share updates.");
      return;
    }
    if (!composerContent.trim()) return;

    try {
      await createPostMutation.mutateAsync({
        content: composerContent,
        imageFile: composerImageFile,
      });
      setComposerContent("");
      setComposerImageFile(null);
      if (composerImagePreview) URL.revokeObjectURL(composerImagePreview);
      setComposerImagePreview(null);
      toast("Posted to the feed.");
    } catch {
      /* mutation onError shows toast */
    }
  };

  return {
    currentProfile,
    userId,
    authLoading,
    searchQuery,
    setSearchQuery,
    searchResults,
    searchLoading,
    showSearchResults,
    profiles,
    profilesLoading,
    posts,
    postsLoading,
    openCommentsPostId,
    commentsFetchPostId,
    commentsForActivePost,
    commentsLoadingActive,
    lightboxPost,
    commentDraft,
    setCommentDraft,
    loadMoreSentinelRef,
    isFetchingNextPage,
    commentMutation,
    deleteCommentMutation,
    deletePostMutation,
    updatePostMutation,
    createPostMutation,
    composerContent,
    setComposerContent,
    composerImagePreview,
    handleComposerImageSelect,
    handleComposerImageRemove,
    handleComposerSubmit,
    handleOpenMediaLightbox,
    handleToggleLike,
    handleToggleComments,
    handleSubmitComment,
    handleDeleteComment,
    handleDeletePost,
    handleEditPost,
    setLightboxPostId,
  };
}
