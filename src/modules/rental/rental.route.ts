import { Router } from "express";
import { rentalController } from "./rental.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/", auth(Role.CUSTOMER), rentalController.createRentalOrder);
router.get("/", auth(Role.CUSTOMER), rentalController.getMyRentals);
router.get("/:id", auth(), rentalController.getRentalById);


export const rentalRoutes = router;
