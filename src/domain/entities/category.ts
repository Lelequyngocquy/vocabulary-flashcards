export interface CategoryItem {
  id: number;
  category: string;
  display_order: number;
  count?: number;
}

export interface UnitItem {
  name: string;
  count?: number;
}
