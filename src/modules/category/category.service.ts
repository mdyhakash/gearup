import { prisma } from "../../lib/prisma";
import { ICreateCategory, IUpdateCategory } from "./category.interface";

const createCategory = async (payload: ICreateCategory) => {
  const exists = await prisma.category.findFirst({
    where: {
      name: payload.name,
    },
  });
  if (exists) {
    throw new Error("Category already exists");
  }
  const result = await prisma.category.create({
    data: {
      name: payload.name,
    },
  });
  return result;
};

const getAllCategories = async () => {
  const category = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });
  return category;
};

const getCategoryById = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
  });
  if (!category) {
    throw new Error("Category not found.");
  }
  return category;
};
const updateCategory = async (categoryId: string, payload: IUpdateCategory) => {
  const category = await prisma.category.findUniqueOrThrow({
    where: {
      id: categoryId,
    },
  });
  const result = await prisma.category.update({
    where: { id: categoryId },
    data: {
      ...payload,
    },
  });
  return result;
};

const deleteCategory = async (categoryId: string) => {
  const category = await prisma.category.findUniqueOrThrow({
    where: {
      id: categoryId,
    },
  });
  await prisma.category.delete({
    where: { id: categoryId },
  });
};
export const categoryService = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
