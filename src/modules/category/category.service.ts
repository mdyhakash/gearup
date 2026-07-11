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
const updateCategory = async (id: string, payload: IUpdateCategory) => {
  const result = await prisma.category.update({
    where: { id },
    data: {
      ...payload,
    },
  });
  return result;
};

const deleteCategory = async (id: string) => {
  return prisma.category.delete({
    where: { id },
  });
};
export const categoryService = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
