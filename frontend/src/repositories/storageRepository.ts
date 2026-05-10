import { supabase } from "../lib/supabase";

export const storageRepository = {
  async uploadFeedImage(userId: string, file: File): Promise<string> {
    const ext = file.name.split(".").pop() ?? "png";
    const path = `${userId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("feed-images")
      .upload(path, file, { upsert: false });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("feed-images").getPublicUrl(path);
    return data.publicUrl;
  },
};

