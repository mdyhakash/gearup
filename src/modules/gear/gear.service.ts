import { GearItemsWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { ICreateGear, IGearQuery, IUpdateGear } from "./gear.interface";

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
const getAllGear = async (query: IGearQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy ? query.sortBy : "createdAt";
  const sortOrder = query.sortOrder ? query.sortOrder : "desc";

  const andConditions: GearItemsWhereInput[] = [];

  if (query.searchTerm) {
    andConditions.push({
      OR: [
        {
          name: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          brand: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (query.categoryId) {
    andConditions.push({
      categoryId: query.categoryId,
    });
  }

  if (query.brand) {
    andConditions.push({
      brand: {
        contains: query.brand,
        mode: "insensitive",
      },
    });
  }

  if (query.minPrice || query.maxPrice) {
    andConditions.push({
      dailyRate: {
        gte: query.minPrice ? Number(query.minPrice) : undefined,
        lte: query.maxPrice ? Number(query.maxPrice) : undefined,
      },
    });
  }

  if (query.condition) {
    andConditions.push({
      condition: query.condition,
    });
  }

  if (query.isAvailable !== undefined) {
    andConditions.push({
      isAvailable: query.isAvailable,
    });
  }

  const result = await prisma.gearItems.findMany({
    where: {
      AND: andConditions,
    },
    take: limit,
    skip: skip,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      provider: {
        omit: {
          password: true,
        },
      },
      category: true,
    },
  });

  const totalGearCount = await prisma.gearItems.count({
    where: {
      AND: andConditions,
    },
  });
  return {
    data: result,
    meta: {
      page,
      limit,
      totalGearCount,
      totalPages: Math.ceil(totalGearCount / limit),
    },
  };
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
