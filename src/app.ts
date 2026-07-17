import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import config from "./config";
import { authRoutes } from "./modules/auth/auth.route";
import { categoryRoutes } from "./modules/category/category.route";
import { gearRoutes } from "./modules/gear/gear.route";
import { notFoundRoute } from "./middleware/notFoundRoute";
import { globalErrorHanlder } from "./middleware/globalErrorHandler";
import {
  providerOrderRoutes,
  rentalRoutes,
} from "./modules/rental/rental.route";
import { paymentRoutes } from "./modules/payment/payment.router";
import { reviewRoutes } from "./modules/review/review.route";
import { adminRoutes } from "./modules/admin/admin.route";

const app = express();

app.use(
  cors({
    origin: config.app_url,
  }),
);
app.use(express.json());
app.use(express.text());
app.use(
  express.urlencoded({
    extended: true,
  }),
);
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/gear", gearRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/provider/orders", providerOrderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFoundRoute);
app.use(globalErrorHanlder);
export default app;
