import { prisma } from "../../lib/prisma";
import { ICreateRental } from "./rentel.interface";

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

  const days =
    Math.ceil(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

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

export const rentalService = {
  createRentalOrder,
};
