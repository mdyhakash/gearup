import { Router } from "express";
import { paymentController } from "./payment.controller";
import { auth } from "../../middleware/auth";

const router = Router();

router.post("/create", auth("CUSTOMER"), paymentController.createPayment);
router.post("/confirm", paymentController.confirmPayment);
router.get("/", auth("CUSTOMER"), paymentController.getMyPayments);
router.get("/:id", auth(), paymentController.getPaymentById);

export const paymentRoutes = router;
