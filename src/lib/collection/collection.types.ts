// ============================================================================
// Collection Domain Types
// ============================================================================

export interface CollectionWithCount {
  id: string;
  name: string;
  description: string | null;
  previewCount: number;
  createdAt: Date;
  updatedAt: Date;
}
