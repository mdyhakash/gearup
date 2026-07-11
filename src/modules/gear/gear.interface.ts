import { GearCondition } from "../../../generated/prisma/enums";

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
