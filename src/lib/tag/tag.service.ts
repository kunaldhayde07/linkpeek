import { prisma } from "@/lib/db";
import { logger } from "@/lib/utils";

import type { TagWithCount } from "./tag.types";
import type { CreateTagInput, UpdateTagInput } from "./tag.schemas";

// ============================================================================
// Tag Service
// CRUD operations for tags + preview tagging
// ============================================================================

/**
 * List all tags for a user with usage counts.
 */
export async function listTags(userId: string): Promise<TagWithCount[]> {
  const tags = await prisma.tag.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { previews: true } },
    },
  });

  return tags.map((t) => ({
    id: t.id,
    name: t.name,
    color: t.color,
    previewCount: t._count.previews,
    createdAt: t.createdAt,
  }));
}

/**
 * Create a new tag.
 */
export async function createTag(userId: string, input: CreateTagInput): Promise<TagWithCount> {
  const tag = await prisma.tag.create({
    data: {
      userId,
      name: input.name.toLowerCase(),
      color: input.color,
    },
  });

  return {
    id: tag.id,
    name: tag.name,
    color: tag.color,
    previewCount: 0,
    createdAt: tag.createdAt,
  };
}

/**
 * Update a tag.
 */
export async function updateTag(
  tagId: string,
  userId: string,
  input: UpdateTagInput
): Promise<TagWithCount> {
  const tag = await prisma.tag.update({
    where: { id: tagId, userId },
    data: {
      ...(input.name !== undefined && { name: input.name.toLowerCase() }),
      ...(input.color !== undefined && { color: input.color }),
    },
    include: { _count: { select: { previews: true } } },
  });

  return {
    id: tag.id,
    name: tag.name,
    color: tag.color,
    previewCount: tag._count.previews,
    createdAt: tag.createdAt,
  };
}

/**
 * Delete a tag (removes associations but not previews).
 */
export async function deleteTag(tagId: string, userId: string): Promise<boolean> {
  const result = await prisma.tag.deleteMany({
    where: { id: tagId, userId },
  });
  return result.count > 0;
}

/**
 * Add a tag to a preview.
 */
export async function tagPreview(
  previewId: string,
  tagId: string,
  userId: string
): Promise<void> {
  // Verify ownership
  const [preview, tag] = await Promise.all([
    prisma.preview.findFirst({ where: { id: previewId, userId } }),
    prisma.tag.findFirst({ where: { id: tagId, userId } }),
  ]);

  if (!preview) throw new Error("Preview not found");
  if (!tag) throw new Error("Tag not found");

  await prisma.previewTag.upsert({
    where: {
      previewId_tagId: { previewId, tagId },
    },
    create: { previewId, tagId },
    update: {},
  });
}

/**
 * Remove a tag from a preview.
 */
export async function untagPreview(
  previewId: string,
  tagId: string,
  userId: string
): Promise<void> {
  const preview = await prisma.preview.findFirst({ where: { id: previewId, userId } });
  if (!preview) throw new Error("Preview not found");

  await prisma.previewTag.deleteMany({
    where: { previewId, tagId },
  });
}
