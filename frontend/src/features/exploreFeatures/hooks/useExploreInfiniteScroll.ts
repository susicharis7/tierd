import { useEffect, useRef } from "react";

type UseExploreInfiniteScrollParams = {
  postsLoading: boolean;
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
  fetchNextPage: () => unknown;
};

export function useExploreInfiniteScroll({
  postsLoading,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: UseExploreInfiniteScrollParams) {
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = loadMoreSentinelRef.current;
    if (!el || postsLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) return;
        if (hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { root: null, rootMargin: "240px", threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, postsLoading]);

  return { loadMoreSentinelRef };
}
