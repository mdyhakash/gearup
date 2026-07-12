import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { rentalService } from "./rental.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { Role } from "../../../generated/prisma/enums";

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

const getMyRentals = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.user?.id;
    const query = req.query;
    const result = await rentalService.getMyRentals(
      customerId as string,
      query,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "Rental orders fetched successfully.",
      data: result.data,
      meta: result.meta,
    });
  },
);

const getRentalById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const rentalId = req.params.id;
    const userId = req.user?.id;
    const role = req.user?.role;

    const result = await rentalService.getRentalById(
      rentalId as string,
      userId as string,
      role as Role,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "Rental order fetched successfully.",
      data: result,
    });
  },
);
export const rentalController = {
  createRentalOrder,
  getMyRentals,
  getRentalById,
};
