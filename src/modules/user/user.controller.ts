import { NextFunction, Request, Response } from "express";
import { userServices } from "./user.service";

const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const payload = req.body;
  const result = await userServices.registerUser(payload);
  try {
    res.status(201).json({
      success: true,
      message: "User register successfully",
      data: result,
    });
  } catch (error: any) {
    res.send(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const userController = {
  registerUser,
};
