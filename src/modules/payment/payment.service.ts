import { PaymentStatus, RentalStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { sslcommerzUtils } from "../../utils/sslcommerz";
import { IInitiatePayment } from "./payment.interface";

const initiatePayment = async (
  customerId: string,
  payload: IInitiatePayment,
) => {
  const { rentalOrderId } = payload;

  const rentalOrder = await prisma.rentalOrder.findUniqueOrThrow({
    where: { id: rentalOrderId },
    include: { customer: true },
  });

  if (rentalOrder.customerId !== customerId) {
    throw new Error("You're not the owner of this rental order.");
  }

  if (
    rentalOrder.status !== RentalStatus.PLACED &&
    rentalOrder.status !== RentalStatus.CONFIRMED
  ) {
    throw new Error("This rental order is not eligible for payment.");
  }

  const existingPayment = await prisma.payment.findFirst({
    where: {
      rentalOrderId,
      status: { in: [PaymentStatus.PENDING, PaymentStatus.COMPLETED] },
    },
  });

  if (existingPayment?.status === PaymentStatus.COMPLETED) {
    throw new Error("This rental order has already been paid for.");
  }

  const transactionId = `GEARUP-${rentalOrderId}-${Date.now()}`;

  const apiResponse = await sslcommerzUtils.initSession({
    rentalOrderId,
    amount: rentalOrder.totalAmount,
    transactionId,
    customerName: rentalOrder.customer.name,
    customerEmail: rentalOrder.customer.email,
    customerPhone: rentalOrder.customer.phone ?? undefined,
    customerAddress: rentalOrder.customer.address ?? undefined,
  });

  if (!apiResponse?.GatewayPageURL) {
    throw new Error("Failed to initiate SSLCommerz payment session.");
  }

  const payment = await prisma.payment.create({
    data: {
      rentalOrderId,
      customerId,
      transactionId,
      amount: rentalOrder.totalAmount,
    },
  });

  return {
    paymentUrl: apiResponse.GatewayPageURL as string,
    transactionId: payment.transactionId,
  };
};

const validatePayment = async (
  orderId: string,
  tranId: string,
  status: string,
  payload: Record<string, unknown>,
) => {
  if (status !== "success") {
    await prisma.payment.update({
      where: { transactionId: tranId },
      data: { status: PaymentStatus.FAILED },
    });
    return status;
  }

  const val_id = payload.val_id as string | undefined;

  if (!val_id) {
    await prisma.payment.update({
      where: { transactionId: tranId },
      data: { status: PaymentStatus.FAILED },
    });
    return "fail";
  }

  const validation = await sslcommerzUtils.validatePayment(val_id);

  if (validation?.status !== "VALID" && validation?.status !== "VALIDATED") {
    await prisma.payment.update({
      where: { transactionId: tranId },
      data: { status: PaymentStatus.FAILED },
    });
    return "fail";
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { transactionId: tranId },
      data: {
        status: PaymentStatus.COMPLETED,
        paidAt: new Date(),
      },
    });

    await tx.rentalOrder.update({
      where: { id: orderId },
      data: { status: RentalStatus.PAID },
    });
  });

  return status;
};

const getMyPayments = async (customerId: string) => {
  const payments = await prisma.payment.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
    include: { rentalOrder: true },
  });
  return payments;
};

const getPaymentById = async (
  paymentId: string,
  customerId: string,
  isAdmin: boolean,
) => {
  const payment = await prisma.payment.findUniqueOrThrow({
    where: { id: paymentId },
    include: { rentalOrder: true },
  });

  if (!isAdmin && payment.customerId !== customerId) {
    throw new Error("You don't have permission to view this payment.");
  }

  return payment;
};

export const paymentService = {
  initiatePayment,
  validatePayment,
  getMyPayments,
  getPaymentById,
};
