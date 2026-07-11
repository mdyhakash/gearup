import { prisma } from "../../lib/prisma";
import { ICreateGear, IUpdateGear } from "./gear.interface";

const createGear = async (providerId: string, payload: ICreateGear) => {
  const category = await prisma.category.findUnique({
    where: {
      id: payload.categoryId,
    },
  });
  if (!category) {
    throw new Error("Category not found");
  }
  const gear = await prisma.gearItems.create({
    data: {
      ...payload,
      providerId,
    },
    include: {
      category: true,
    },
  });
  return gear;
};
const updateGear = async (gearId: string, payload: IUpdateGear) => {
  const gear = await prisma.gearItems.update({
    where: { id: gearId },
    data: {
      ...payload,
    },
  });
  return gear;
};
const deleteGear = async (gearId: string) => {
  return prisma.gearItems.delete({
    where: { id: gearId },
  });
};
const getAllGear = async () => {
  const result = await prisma.gearItems.findMany({
    orderBy: {
      name: "asc",
    },
  });
  return result;
};
const getGearById = async (gearId: string) => {
  const gear = await prisma.gearItems.findUnique({
    where: {
      id: gearId,
    },
    include: {
      category: true,
      provider: {
        omit: {
          password: true,
        },
      },
    },
  });
  if (!gear) {
    throw new Error("Gear not found.");
  }
  return gear;
};

export const gearServices = {
  createGear,
  updateGear,
  deleteGear,
  getAllGear,
  getGearById,
};
