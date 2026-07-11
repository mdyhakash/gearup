import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { categoryService } from "./category.service";
import httpStatus from "http-status";

const createCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const result = await categoryService.createCategory(payload);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      message: "Category created successfully",
      data: result,
    });
  },
);
const getAllCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await categoryService.getAllCategories();
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      message: "Categories fetched successfully",
      data: result,
    });
  },
);
const getCategoryById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const categoryId = req.params.id;
    const result = await categoryService.getCategoryById(categoryId as string);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      message: "Category fetched successfully",
      data: result,
    });
  },
);
const updateCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const categoryId = req.params.id;
    const payload = req.body;
    const result = await categoryService.updateCategory(
      categoryId as string,
      payload,
    );
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      message: "Category updated successfully",
      data: result,
    });
  },
);
const deleteCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const categoryId = req.params.id;
    const result = await categoryService.deleteCategory(categoryId as string);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      message: "Category deleted successfully",
      data: result,
    });
  },
);

export const categoryController = {
  createCategory,
  getAllCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
