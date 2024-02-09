export enum SortOrder {
  Asc = 'asc',
  Desc = 'desc',
}

export interface Sort<SortColumn extends string> {
  column: SortColumn;
  order?: SortOrder;
}
