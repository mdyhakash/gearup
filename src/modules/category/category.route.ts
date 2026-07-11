import { Router } from "express";
import { categoryController } from "./category.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/", auth(Role.ADMIN), categoryController.createCategory);
router.get("/", categoryController.getAllCategory);
router.get("/:id", categoryController.getCategoryById);
router.patch("/:id", auth(Role.ADMIN), categoryController.updateCategory);
router.delete("/:id", auth(Role.ADMIN), categoryController.deleteCategory);

export const categoryRoutes = router;
