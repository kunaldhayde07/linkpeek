"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/auth/supabase/server";
import { createCollectionSchema, updateCollectionSchema } from "@/lib/collection";
import {
  createCollection,
  updateCollection,
  deleteCollection,
  addPreviewToCollection,
  removePreviewFromCollection,
  listCollections,
} from "@/lib/collection/collection.service";

import type { CollectionWithCount } from "@/lib/collection/collection.types";

/**
 * List all collections for the current user.
 */
export async function listCollectionsAction(): Promise<CollectionWithCount[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  return listCollections(user.id);
}

export async function createCollectionAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const parsed = createCollectionSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  try {
    const collection = await createCollection(user.id, parsed.data);
    revalidatePath("/collections");
    return { success: true, data: collection };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to create collection";
    return { success: false, error: msg.includes("Unique") ? "Collection name already exists" : msg };
  }
}

export async function updateCollectionAction(collectionId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const parsed = updateCollectionSchema.safeParse({
    name: formData.get("name") || undefined,
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  try {
    await updateCollection(collectionId, user.id, parsed.data);
    revalidatePath("/collections");
    return { success: true };
  } catch {
    return { success: false, error: "Collection not found" };
  }
}

export async function deleteCollectionAction(collectionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const deleted = await deleteCollection(collectionId, user.id);
  if (!deleted) return { success: false, error: "Collection not found" };

  revalidatePath("/collections");
  return { success: true };
}

export async function addToCollectionAction(collectionId: string, previewId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    await addPreviewToCollection(collectionId, previewId, user.id);
    revalidatePath("/collections");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed" };
  }
}

export async function removeFromCollectionAction(collectionId: string, previewId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    await removePreviewFromCollection(collectionId, previewId, user.id);
    revalidatePath("/collections");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed" };
  }
}
