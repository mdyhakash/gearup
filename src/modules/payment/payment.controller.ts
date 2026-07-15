import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { paymentService } from "./payment.service";
import { catchAsync } from "../../utils/catchAsync";
import { NextFunction, Request, Response } from "express";
const createPayment = catchAsync(async (req, res) => {
  const customerId = req.user?.id as string;
  const payload = req.body;
  const result = await paymentService.initiatePayment(customerId, payload);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Payment session created successfully.",
    data: result,
  });
});

const confirmPayment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { rentalOrderId, tranId, status } = req.query;
    const payload = req.body;

    const response = await paymentService.validatePayment(
      rentalOrderId as string,
      tranId as string,
      status as string,
      payload,
    );

    if (response === "success") {
      res.redirect("https://web.programming-hero.com/dashboard");
    } else if (response === "fail") {
      res.redirect("https://www.facebook.com");
    } else if (response === "cancel") {
      res.redirect("https://www.youtube.com");
    }
  },
);

const getMyPayments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.user?.id as string;
    const result = await paymentService.getMyPayments(customerId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "Payment history fetched successfully.",
      data: result,
    });
  },
);

const getPaymentById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const paymentId = req.params.id;
    const customerId = req.user?.id;
    const isAdmin = req.user?.role === "ADMIN";
    const result = await paymentService.getPaymentById(
      paymentId as string,
      customerId as string,
      isAdmin,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "Payment fetched successfully.",
      data: result,
    });
  },
);

export const paymentController = {
  createPayment,
  confirmPayment,
  getMyPayments,
  getPaymentById,
};
