import { NextFunction, Request, Response } from "express";
import { authServices } from "./auth.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const registerUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const result = await authServices.registerUser(payload);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      message: "User registered successfully",
      data: { result },
    });
  },
);

const loginUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const { accessToken, refreshToken } = await authServices.loginUser(payload);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      message: "User logged in successfully",
      data: { accessToken, refreshToken },
    });
  },
);

const refreshToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.refreshToken;
    const { accessToken } = await authServices.refreshToken(token);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24,
    });

    res.status(201).json({
      success: true,
      message: "user logged in succesfully",
      data: { accessToken },
    });
  },
);

const getMyProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;
    const result = await authServices.getMyProfile(userId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "User profile fetched successfully",
      data: { result },
    });
  },
);
export const authController = {
  registerUser,
  loginUser,
  refreshToken,
  getMyProfile,
};
