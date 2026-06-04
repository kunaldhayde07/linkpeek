export type ExportFormat = "json" | "csv";

export interface ExportOptions {
  format: ExportFormat;
  collectionId?: string;
  tagIds?: string[];
  startDate?: Date;
  endDate?: Date;
}
