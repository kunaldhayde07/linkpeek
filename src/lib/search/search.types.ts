export interface SearchResult {
  id: string;
  title: string | null;
  description: string | null;
  url: string;
  domain: string;
  image: string | null;
  favicon: string | null;
  createdAt: Date;
  rank: number;
  titleHighlight: string;
  descriptionHighlight: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  totalPages: number;
  query: string;
}
