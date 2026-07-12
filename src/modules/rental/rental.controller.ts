import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { rentalService } from "./rental.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createRentalOrder = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.user?.id;
    const payload = req.body;
    const result = await rentalService.createRentalOrder(
      customerId as string,
      payload,
    );
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      message: "Rental order placed successfully.",
      data: result,
    });
  },
);

export const rentalController = {
  createRentalOrder,
};
