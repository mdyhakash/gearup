import { Router } from "express";
import { rentalController } from "./rental.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/", auth(Role.CUSTOMER), rentalController.createRentalOrder);
router.get("/", auth(Role.CUSTOMER), rentalController.getMyRentals);
router.get("/:id", auth(), rentalController.getRentalById);
router.patch(
  "/:id/cancel",
  auth(Role.CUSTOMER),
  rentalController.cancelRentalOrder,
);

export const rentalRoutes = router;

//provider routes
const providerRouter = Router();
providerRouter.get(
  "/",
  auth(Role.PROVIDER),
  rentalController.getProviderOrders,
);
providerRouter.patch(
  "/:id",
  auth(Role.PROVIDER, Role.ADMIN),
  rentalController.updateOrderStatus,
);

export const providerOrderRoutes = providerRouter;
