import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { adminService } from "./admin.service";
import httpStatus from "http-status";

const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await adminService.getAllUsers(query);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "Users fetched successfully.",
      data: result.data,
      meta: result.meta,
    });
  },
);

const updateUserStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const payload = req.body;
    const result = await adminService.updateUserStatus(
      userId as string,
      payload,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "User status updated successfully.",
      data: result,
    });
  },
);

const getAllGear = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await adminService.getAllGear(query);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "Gear listings fetched successfully.",
      data: result.data,
      meta: result.meta,
    });
  },
);

const getAllRentals = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await adminService.getAllRentals(query);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "Rental orders fetched successfully.",
      data: result.data,
      meta: result.meta,
    });
  },
);

export const adminController = {
  getAllUsers,
  updateUserStatus,
  getAllGear,
  getAllRentals,
};
