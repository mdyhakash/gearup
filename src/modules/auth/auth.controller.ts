import { NextFunction, Request, Response } from "express";
import { authServices } from "./auth.service";

const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const payload = req.body;
  const result = await authServices.registerUser(payload);
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

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body;
  const { accessToken, refreshToken } = await authServices.loginUser(payload);
  try {
    res.status(201).json({
      success: true,
      message: "User Logged in successfully",
      data: { accessToken, refreshToken },
    });
  } catch (error: any) {
    res.send(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const authController = {
  registerUser,
  loginUser,
};
