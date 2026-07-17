import { prisma } from "../../lib/prisma";
import { RentalStatus } from "../../../generated/prisma/enums";
import { ICreateReview, IReviewQuery } from "./review.interface";

const createReview = async (customerId: string, payload: ICreateReview) => {
  const { rentalOrderId, gearItemId, rating, comment } = payload;

  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5.");
  }

  const rentalOrder = await prisma.rentalOrder.findUniqueOrThrow({
    where: { id: rentalOrderId },
    include: { items: true },
  });

  if (rentalOrder.customerId !== customerId) {
    throw new Error("You're not the owner of this rental order.");
  }

  if (rentalOrder.status !== RentalStatus.RETURNED) {
    throw new Error("You can only review gear after it has been returned.");
  }

  const orderedItem = rentalOrder.items.find(
    (item) => item.gearItemId === gearItemId,
  );
  if (!orderedItem) {
    throw new Error("This gear item was not part of this rental order.");
  }

  const existingReview = await prisma.review.findFirst({
    where: { customerId, gearItemId, rentalOrderId },
  });
  if (existingReview) {
    throw new Error(
      "You've already reviewed this gear item for this rental order.",
    );
  }

  const review = await prisma.review.create({
    data: {
      customerId,
      gearItemId,
      rentalOrderId,
      rating,
      comment,
    },
    include: {
      customer: {
        omit: { password: true },
      },
    },
  });

  return review;
};

const getGearReviews = async (gearItemId: string, query: IReviewQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const where = { gearItemId };

  const result = await prisma.review.findMany({
    where,
    take: limit,
    skip,
    orderBy: { createdAt: "desc" },
    include: {
      customer: {
        omit: { password: true },
      },
    },
  });

  const total = await prisma.review.count({ where });

  const aggregate = await prisma.review.aggregate({
    where,
    _avg: { rating: true },
  });

  return {
    data: result,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      averageRating: aggregate._avg.rating ?? 0,
    },
  };
};

const getMyReviews = async (customerId: string) => {
  const reviews = await prisma.review.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
    include: {
      gearItem: true,
    },
  });
  return reviews;
};

export const reviewService = {
  createReview,
  getGearReviews,
  getMyReviews,
};
