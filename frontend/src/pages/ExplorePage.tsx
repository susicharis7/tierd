import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ExploreHeader } from "../features/exploreFeatures/components/ExploreHeader";
import { ExploreSearchResults } from "../features/exploreFeatures/components/ExploreSearchResults";
import { ExploreRightSidebar } from "../features/exploreFeatures/components/ExploreRightSidebar";
import { ExploreLeftSidebar } from "../features/exploreFeatures/components/ExploreLeftSidebar";
import { ExploreFeedColumn } from "../features/exploreFeatures/components/ExploreFeedColumn";
import { ExploreLightbox } from "../features/exploreFeatures/components/ExploreLightbox";
import { useExplorePageController } from "../features/exploreFeatures/hooks/useExplorePageController";

const Explore = () => {
  const {
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
    setLightboxPostId,
  } = useExplorePageController();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <ExploreHeader
        showSearchResults={showSearchResults}
        profilesCount={profiles.length}
        postsCount={posts.length}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        searchLoading={searchLoading}
      />

      <div className="section-container pt-4 pb-16">
        {showSearchResults && (
          <ExploreSearchResults
            searchLoading={searchLoading}
            searchResults={searchResults}
            searchQuery={searchQuery}
          />
        )}

        {!showSearchResults && (
          <div className="grid lg:grid-cols-[220px_1fr_260px] gap-6 items-start">
            <ExploreLeftSidebar
              userId={userId}
              authLoading={authLoading}
              currentProfile={currentProfile}
            />

            <ExploreFeedColumn
              profiles={profiles}
              profilesLoading={profilesLoading}
              composerProps={{
                authLoading,
                userId,
                currentProfile,
                composerContent,
                onComposerContentChange: setComposerContent,
                composerImagePreview,
                onComposerImageSelect: handleComposerImageSelect,
                onComposerImageRemove: handleComposerImageRemove,
                onComposerSubmit: () => void handleComposerSubmit(),
                createPostPending: createPostMutation.isPending,
              }}
              postsSectionProps={{
                postsLoading,
                posts,
                openCommentsPostId,
                commentsFetchPostId,
                commentsForActivePost,
                commentsLoadingActive,
                commentDraft,
                commentMutationPending: commentMutation.isPending,
                commentMutationPostId: commentMutation.variables?.postId,
                onToggleLike: handleToggleLike,
                onToggleComments: handleToggleComments,
                onChangeCommentDraft: setCommentDraft,
                onSubmitComment: handleSubmitComment,
                onOpenMediaLightbox: handleOpenMediaLightbox,
                loadMoreSentinelRef,
                isFetchingNextPage,
              }}
            />

            <ExploreRightSidebar
              isLoggedIn={!!userId}
              profilesLoading={profilesLoading}
              profilesCount={profiles.length}
              postsCount={posts.length}
              hasCurrentProfile={!!currentProfile}
              authLoading={authLoading}
            />
          </div>
        )}
      </div>

      <Footer />

      {lightboxPost?.image_url && (
        <ExploreLightbox
          post={lightboxPost}
          comments={commentsForActivePost}
          commentsLoading={commentsLoadingActive}
          commentDraft={commentDraft}
          onCommentDraftChange={setCommentDraft}
          onSubmitComment={() => handleSubmitComment(lightboxPost.id)}
          commentSubmitting={
            commentMutation.isPending &&
            commentMutation.variables?.postId === lightboxPost.id
          }
          onToggleLike={() => handleToggleLike(lightboxPost.id)}
          onClose={() => setLightboxPostId(null)}
        />
      )}
    </div>
  );
};

export default Explore;
