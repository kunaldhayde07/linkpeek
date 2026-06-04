"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/auth/supabase/server";
import { createTagSchema } from "@/lib/tag";
import {
  createTag,
  deleteTag,
  tagPreview,
  untagPreview,
} from "@/lib/tag/tag.service";

export async function createTagAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const parsed = createTagSchema.safeParse({
    name: formData.get("name"),
    color: formData.get("color") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  try {
    const tag = await createTag(user.id, parsed.data);
    revalidatePath("/dashboard");
    revalidatePath("/history");
    return { success: true, data: tag };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to create tag";
    return { success: false, error: msg.includes("Unique") ? "Tag name already exists" : msg };
  }
}

export async function deleteTagAction(tagId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const deleted = await deleteTag(tagId, user.id);
  if (!deleted) return { success: false, error: "Tag not found" };

  revalidatePath("/dashboard");
  revalidatePath("/history");
  return { success: true };
}

export async function tagPreviewAction(previewId: string, tagId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    await tagPreview(previewId, tagId, user.id);
    revalidatePath("/dashboard");
    revalidatePath("/history");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed" };
  }
}

export async function untagPreviewAction(previewId: string, tagId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    await untagPreview(previewId, tagId, user.id);
    revalidatePath("/dashboard");
    revalidatePath("/history");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed" };
  }
}
