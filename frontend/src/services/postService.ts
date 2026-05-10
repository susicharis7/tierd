import { activityFactory } from "../factories/activityFactory";
import { activityRepository } from "../repositories/activityRepository";
import { postRepository } from "../repositories/postRepository";
import { storageRepository } from "../repositories/storageRepository";

export type CreatePostServiceInput = {
  userId: string;
  content: string;
  imageFile?: File | null;
};

function validatePostContent(content: string): string {
  const trimmed = content.trim();
  if (!trimmed) throw new Error("Post content cannot be empty.");
  if (trimmed.length > 4000) throw new Error("Post content is too long.");
  return trimmed;
}

export const postService = {
  async createPost(input: CreatePostServiceInput): Promise<{ id: string }> {
    const content = validatePostContent(input.content);

    let imageUrl: string | null = null;
    if (input.imageFile) {
      imageUrl = await storageRepository.uploadFeedImage(
        input.userId,
        input.imageFile,
      );
    }

    const created = await postRepository.create({
      userId: input.userId,
      content,
      imageUrl,
    });

    const activity = activityFactory.createPostActivity(input.userId, created.id);

    try {
      await activityRepository.create({
        actor_profile_id: activity.user_id,
        target_profile_id: activity.user_id,
        event_type: "post_created",
        entity_type: "post",
        entity_id: created.id,
        metadata: {
          message: activity.message,
          points: activity.points,
          ...activity.metadata,
        },
        visibility: "public",
      });
    } catch (error) {
      // Activity logging is non-blocking for core post flow.
      console.warn("[postService] activity logging skipped:", error);
    }

    return created;
  },
};
