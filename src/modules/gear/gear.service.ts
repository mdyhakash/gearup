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
const updateGear = async (
  gearId: string,
  payload: IUpdateGear,
  providerId: string,
  isAdmin: boolean,
) => {
  const gear = await prisma.gearItems.findUniqueOrThrow({
    where: {
      id: gearId,
    },
  });
  if (!isAdmin && gear.providerId !== providerId) {
    throw new Error("You're not the owner of this item.");
  }
  const result = await prisma.gearItems.update({
    where: { id: gearId },
    data: {
      ...payload,
    },
    include: {
      provider: {
        omit: {
          password: true,
        },
      },
    },
  });
  return result;
};
const deleteGear = async (
  gearId: string,
  providerId: string,
  isAdmin: boolean,
) => {
  const gear = await prisma.gearItems.findUniqueOrThrow({
    where: {
      id: gearId,
    },
  });
  if (!isAdmin && gear.providerId !== providerId) {
    throw new Error("You're not the owner of this item.");
  }
  await prisma.gearItems.delete({
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
