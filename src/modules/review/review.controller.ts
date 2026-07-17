import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { reviewService } from "./review.service";
import httpStatus from "http-status";

const createReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.user?.id as string;
    const payload = req.body;
    const result = await reviewService.createReview(customerId, payload);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      message: "Review submitted successfully.",
      data: result,
    });
  },
);

const getGearReviews = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const gearItemId = req.params.gearItemId;
    const query = req.query;
    const result = await reviewService.getGearReviews(
      gearItemId as string,
      query,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "Reviews fetched successfully.",
      data: result.data,
      meta: result.meta,
    });
  },
);

const getMyReviews = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.user?.id as string;
    const result = await reviewService.getMyReviews(customerId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "Your reviews fetched successfully.",
      data: result,
    });
  },
);

export const reviewController = {
  createReview,
  getGearReviews,
  getMyReviews,
};
