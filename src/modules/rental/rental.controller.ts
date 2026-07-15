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
const cancelRentalOrder = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const rentalId = req.params.id;
    const cutomerId = req.user?.id;

    const result = await rentalService.cancelRentalOrder(
      rentalId as string,
      cutomerId as string,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "Rental order cancelled successfully.",
      data: result,
    });
  },
);
const getProviderOrders = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.user?.id;
    const query = req.query;

    const result = await rentalService.getProviderOrders(
      providerId as string,
      query,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "Provider orders fetched successfully.",
      data: result.data,
      meta: result.meta,
    });
  },
);
const updateOrderStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const rentalId = req.params.id;
    const providerId = req.user?.id;
    const isAdmin = req.user?.role === Role.ADMIN;
    const { status } = req.body;

    const result = await rentalService.updateOrderStatus(
      rentalId as string,
      providerId as string,
      isAdmin,
      status,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "Rental order status updated successfully.",
      data: result,
    });
  },
);

export const rentalController = {
  createRentalOrder,
  getMyRentals,
  getRentalById,
  cancelRentalOrder,
  getProviderOrders,
  updateOrderStatus,
};
