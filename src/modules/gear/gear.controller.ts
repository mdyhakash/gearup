import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { gearServices } from "./gear.service";
import { sendResponse } from "../../utils/sendResponse";
import HttpStatus from "http-status";

const createGear = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const provderId = req.user?.id;
    const payload = req.body;
    const result = await gearServices.createGear(provderId as string, payload);

    sendResponse(res, {
      statusCode: HttpStatus.CREATED,
      message: "Gear item created succesfully.",
      data: result,
    });
  },
);

const getAllGear = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const gear = await gearServices.getAllGear();
    sendResponse(res, {
      statusCode: HttpStatus.CREATED,
      message: "Gear item fetched succesfully.",
      data: gear,
    });
  },
);
const getGearById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const gearId = req.params.id;
    const gear = await gearServices.getGearById(gearId as string);
    sendResponse(res, {
      statusCode: HttpStatus.CREATED,
      message: "Gear item fetched succesfully.",
      data: gear,
    });
  },
);
const updateGear = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const gearId = req.params.id;
    const payload = req.body;
    const providerId = req.user?.id;
    const isAdmin = req.user?.role === "ADMIN";
    const gear = await gearServices.updateGear(
      gearId as string,
      payload,
      providerId as string,
      isAdmin as boolean,
    );
    sendResponse(res, {
      statusCode: HttpStatus.CREATED,
      message: "Gear item updated succesfully.",
      data: gear,
    });
  },
);
const deleteGear = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const gearId = req.params.id;
    const providerId = req.user?.id;
    const isAdmin = req.user?.role === "ADMIN";
    const gear = await gearServices.deleteGear(
      gearId as string,
      providerId as string,
      isAdmin as boolean,
    );
    sendResponse(res, {
      statusCode: HttpStatus.CREATED,
      message: "Gear item deleted succesfully.",
      data: gear,
    });
  },
);
export const gearController = {
  createGear,
  updateGear,
  deleteGear,
  getAllGear,
  getGearById,
};
