export type FuzzyDataSource = 'fuzzy' | 'prisma';

export interface FuzzySearchResult<T> {
  success: boolean;
  dataSource: FuzzyDataSource;
  searchTerm: string;
  count: number;
  items: T[];
}
