import { RentalStatus, Role } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { ICreateRental, IRentalQuery } from "./rentel.interface";

const validTransitions: Record<string, string[]> = {
  PLACED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["CANCELLED"],
  PAID: ["PICKED_UP"],
  PICKED_UP: ["RETURNED"],
};
const createRentalOrder = async (
  customerId: string,
  payload: ICreateRental,
) => {
  const { startDate, endDate, items } = payload;

  if (!items.length) {
    throw new Error(
      "At least one gear item is required to place a rental order.",
    );
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start >= end) {
    throw new Error("End date must be after start date.");
  }

  const days = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );

  const result = await prisma.$transaction(async (tx) => {
    let totalAmount = 0;
    const oderItemsData = [];

    for (const item of items) {
      const gear = await tx.gearItems.findUniqueOrThrow({
        where: {
          id: item.gearItemId,
        },
      });
      if (!gear.isAvailable) {
        throw new Error(`${gear.name} is not available for rent right now.`);
      }
      if (gear.stock < item.quantity) {
        throw new Error(
          `Only ${gear.stock} unit of ${gear.name} left in stock.`,
        );
      }

      const subtotal = gear.dailyRate * item.quantity * days;

      totalAmount = totalAmount + subtotal;

      oderItemsData.push({
        gearItemId: gear.id,
        quantity: item.quantity,
        dailyRate: gear.dailyRate,
        subtotal,
      });

      await tx.gearItems.update({
        where: { id: gear.id },
        data: {
          stock: gear.stock - item.quantity,
        },
      });
    }
    const rentalOrder = await tx.rentalOrder.create({
      data: {
        customerId,
        startDate: start,
        endDate: end,
        totalAmount,
        items: {
          create: oderItemsData,
        },
      },
      include: {
        items: {
          include: {
            gearItem: true,
          },
        },
      },
    });

    return rentalOrder;
  });
  return result;
};

const getMyRentals = async (customerId: string, query: IRentalQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const where = {
    customerId,
    ...(query.status && { status: query.status as RentalStatus }),
  };

  const result = await prisma.rentalOrder.findMany({
    where,
    take: limit,
    skip,
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: { gearItem: true },
      },
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

const getRentalById = async (rentalId: string, userId: string, role: Role) => {
  const rentalOrder = await prisma.rentalOrder.findUnique({
    where: { id: rentalId },
    include: {
      items: {
        include: { gearItem: true },
      },
      payments: true,
      customer: {
        omit: { password: true },
      },
    },
  });
  if (!rentalOrder) {
    throw new Error("Rental order not found.");
  }
  const isOwner = rentalOrder.customerId === userId;
  const isProvider = rentalOrder.items.some(
    (item) => item.gearItem.providerId === userId,
  );
  const isAdmin = role === Role.ADMIN;
  if (!isOwner && !isProvider && !isAdmin) {
    throw new Error("You don't have permission to view this rental order.");
  }

  return rentalOrder;
};

const cancelRentalOrder = async (rentalId: string, customerId: string) => {
  const rentalOrder = await prisma.rentalOrder.findFirstOrThrow({
    where: { id: rentalId },
    include: { items: true },
  });

  if (rentalOrder.customerId !== customerId) {
    throw new Error("You're not hte owner of this rental order.");
  }
  if (rentalOrder.status !== RentalStatus.PLACED) {
    throw new Error("Only orders with PLACED status can be cancelled");
  }
  const result = await prisma.$transaction(async (tx) => {
    for (const item of rentalOrder.items) {
      await tx.gearItems.update({
        where: { id: item.gearItemId },
        data: { stock: { increment: item.quantity } },
      });
    }
    const updated = await tx.rentalOrder.update({
      where: { id: rentalId },
      data: { status: RentalStatus.CANCELLED },
    });
    return updated;
  });
  return result;
};
//get provider order
const getProviderOrders = async (providerId: string, query: IRentalQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const where = {
    items: {
      some: {
        gearItem: {
          providerId,
        },
      },
    },
    ...(query.status && { status: query.status as RentalStatus }),
  };

  const result = await prisma.rentalOrder.findMany({
    where,
    take: limit,
    skip,
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: { gearItem: true },
      },
      customer: {
        omit: { password: true },
      },
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

const updateOrderStatus = async (
  rentalId: string,
  providerId: string,
  isAdmin: boolean,
  status: RentalStatus,
) => {
  const rentalOrder = await prisma.rentalOrder.findUnique({
    where: { id: rentalId },
    include: {
      items: {
        include: { gearItem: true },
      },
    },
  });
  if (!rentalOrder) {
    throw new Error("Rental order not found");
  }
  const isProvider = rentalOrder.items.some(
    (item) => item.gearItem.providerId === providerId,
  );
  if (!isAdmin && !isProvider) {
    throw new Error("You're not the provider of this rental order.");
  }

  const allowedNext = validTransitions[rentalOrder.status] || [];
  if (!isAdmin && !allowedNext.includes(status)) {
    throw new Error(
      `Cannot move rental order from ${rentalOrder.status} to ${status}.`,
    );
  }
  const result = await prisma.$transaction(async (tx) => {
    if (status === RentalStatus.RETURNED) {
      for (const item of rentalOrder.items) {
        await tx.gearItems.update({
          where: { id: item.gearItemId },
          data: {
            stock: { increment: item.quantity },
          },
        });
      }
    }
    const updated = await tx.rentalOrder.update({
      where: { id: rentalId },
      data: { status },
    });
    return updated;
  });
  return result;
};
export const rentalService = {
  createRentalOrder,
  getMyRentals,
  getRentalById,
  cancelRentalOrder,
  getProviderOrders,
  updateOrderStatus,
};
