import { GearCondition } from "../../../generated/prisma/enums";
import { GearItemsWhereInput } from "../../../generated/prisma/models";

export interface ICreateGear {
  name: string;
  description: string;
  brand?: string;
  dailyRate: number;
  image?: string;
  stock: number;
  condition: GearCondition;
  categoryId: string;
}
export interface IUpdateGear {
  name?: string;
  description?: string;
  brand?: string;
  dailyRate?: number;
  image?: string;
  stock?: number;
  condition?: GearCondition;
  categoryId?: string;
}

export interface IGearQuery extends GearItemsWhereInput {
  brand?: string;
  searchTerm?: string;
  page?: string;
  limit?: string;
  sortOrder?: string;
  sortBy?: string;
  minPrice?: string;
  maxPrice?: string;
}
