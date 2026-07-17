import { RentalStatus, Role } from "../../../generated/prisma/enums";
import { UserWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import {
  IAdminGearQuery,
  IAdminRentalQuery,
  IUpdateUserStatus,
  IUserQuery,
} from "./admin.interface";

const getAllUsers = async (query: IUserQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const andConditions: UserWhereInput[] = [];

  if (query.searchTerm) {
    andConditions.push({
      OR: [
        { name: { contains: query.searchTerm, mode: "insensitive" } },
        { email: { contains: query.searchTerm, mode: "insensitive" } },
      ],
    });
  }

  if (query.role) {
    andConditions.push({ role: query.role });
  }

  if (query.status) {
    andConditions.push({ status: query.status });
  }

  const where = { AND: andConditions };

  const result = await prisma.user.findMany({
    where,
    take: limit,
    skip,
    orderBy: { createdAt: "desc" },
    omit: { password: true },
    include: { profile: true },
  });

  const total = await prisma.user.count({ where });

  return {
    data: result,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const updateUserStatus = async (userId: string, payload: IUpdateUserStatus) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  if (user.role === Role.ADMIN) {
    throw new Error("You can't change the status of an admin account.");
  }

  const result = await prisma.user.update({
    where: { id: userId },
    data: { status: payload.status },
    omit: { password: true },
  });

  return result;
};

const getAllGear = async (query: IAdminGearQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const result = await prisma.gearItems.findMany({
    take: limit,
    skip,
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      provider: {
        omit: { password: true },
      },
    },
  });

  const total = await prisma.gearItems.count();

  return {
    data: result,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getAllRentals = async (query: IAdminRentalQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const where = {
    ...(query.status && { status: query.status as RentalStatus }),
  };

  const result = await prisma.rentalOrder.findMany({
    where,
    take: limit,
    skip,
    orderBy: { createdAt: "desc" },
    include: {
      items: { include: { gearItem: true } },
      customer: { omit: { password: true } },
      payments: true,
    },
  });

  const total = await prisma.rentalOrder.count({ where });

  return {
    data: result,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const adminService = {
  getAllUsers,
  updateUserStatus,
  getAllGear,
  getAllRentals,
};
