import { Router } from "express";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";
import { gearController } from "./gear.controller";

const router = Router();

router.post("/", auth(Role.PROVIDER), gearController.createGear);
router.get("/", gearController.getAllGear);
router.get("/:id", gearController.getGearById);
router.put("/:id", auth(Role.PROVIDER, Role.ADMIN), gearController.updateGear);
router.delete(
  "/:id",
  auth(Role.PROVIDER, Role.ADMIN),
  gearController.deleteGear,
);

export const gearRoutes = router;
