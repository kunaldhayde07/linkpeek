import { prisma } from "@/lib/db";
import { logger } from "@/lib/utils";

import type { CollectionWithCount } from "./collection.types";
import type { CreateCollectionInput, UpdateCollectionInput } from "./collection.schemas";

// ============================================================================
// Collection Service
// CRUD operations for preview collections
// ============================================================================

/**
 * List all collections for a user with preview counts.
 */
export async function listCollections(userId: string): Promise<CollectionWithCount[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: {
        select: { previews: true },
      },
    },
  });

  return collections.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    previewCount: c._count.previews,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }));
}

/**
 * Get a single collection by ID with its previews.
 */
export async function getCollection(collectionId: string, userId: string) {
  const collection = await prisma.collection.findFirst({
    where: { id: collectionId, userId },
    include: {
      previews: {
        include: {
          preview: {
            include: {
              tags: {
                include: {
                  tag: { select: { id: true, name: true, color: true } },
                },
              },
            },
          },
        },
        orderBy: { addedAt: "desc" },
      },
      _count: { select: { previews: true } },
    },
  });

  if (!collection) return null;

  return {
    id: collection.id,
    name: collection.name,
    description: collection.description,
    previewCount: collection._count.previews,
    createdAt: collection.createdAt,
    updatedAt: collection.updatedAt,
    previews: collection.previews.map((cp) => ({
      id: cp.preview.id,
      url: cp.preview.url,
      domain: cp.preview.domain,
      title: cp.preview.title,
      description: cp.preview.description,
      image: cp.preview.image,
      favicon: cp.preview.favicon,
      tags: cp.preview.tags.map((t) => t.tag),
      addedAt: cp.addedAt,
      createdAt: cp.preview.createdAt,
    })),
  };
}

/**
 * Create a new collection.
 */
export async function createCollection(
  userId: string,
  input: CreateCollectionInput
): Promise<CollectionWithCount> {
  const collection = await prisma.collection.create({
    data: {
      userId,
      name: input.name,
      description: input.description ?? null,
    },
  });

  logger.info("Collection created", { userId, collectionId: collection.id, name: collection.name });

  return {
    id: collection.id,
    name: collection.name,
    description: collection.description,
    previewCount: 0,
    createdAt: collection.createdAt,
    updatedAt: collection.updatedAt,
  };
}

/**
 * Update a collection's name or description.
 */
export async function updateCollection(
  collectionId: string,
  userId: string,
  input: UpdateCollectionInput
): Promise<CollectionWithCount> {
  const collection = await prisma.collection.update({
    where: { id: collectionId, userId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
    },
    include: { _count: { select: { previews: true } } },
  });

  return {
    id: collection.id,
    name: collection.name,
    description: collection.description,
    previewCount: collection._count.previews,
    createdAt: collection.createdAt,
    updatedAt: collection.updatedAt,
  };
}

/**
 * Delete a collection (does NOT delete its previews).
 */
export async function deleteCollection(collectionId: string, userId: string): Promise<boolean> {
  const result = await prisma.collection.deleteMany({
    where: { id: collectionId, userId },
  });
  return result.count > 0;
}

/**
 * Add a preview to a collection.
 */
export async function addPreviewToCollection(
  collectionId: string,
  previewId: string,
  userId: string
): Promise<void> {
  // Verify ownership of both collection and preview
  const [collection, preview] = await Promise.all([
    prisma.collection.findFirst({ where: { id: collectionId, userId } }),
    prisma.preview.findFirst({ where: { id: previewId, userId } }),
  ]);

  if (!collection) throw new Error("Collection not found");
  if (!preview) throw new Error("Preview not found");

  await prisma.collectionPreview.upsert({
    where: {
      collectionId_previewId: { collectionId, previewId },
    },
    create: { collectionId, previewId },
    update: {}, // Already exists — no-op
  });
}

/**
 * Remove a preview from a collection.
 */
export async function removePreviewFromCollection(
  collectionId: string,
  previewId: string,
  userId: string
): Promise<void> {
  // Verify ownership
  const collection = await prisma.collection.findFirst({
    where: { id: collectionId, userId },
  });

  if (!collection) throw new Error("Collection not found");

  await prisma.collectionPreview.deleteMany({
    where: { collectionId, previewId },
  });
}
