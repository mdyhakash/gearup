import SSLCommerzPayment from "sslcommerz-lts";
import config from "../config";

type TInitSession = {
  rentalOrderId: string;
  amount: number;
  transactionId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
};

const initSession = async (payload: TInitSession) => {
  const sslcz = new SSLCommerzPayment(
    config.sslcommerz_store_id,
    config.sslcommerz_store_password,
  );

  const paymentData = {
    store_id: config.sslcommerz_store_id,
    store_passwd: config.sslcommerz_store_password,
    total_amount: payload.amount,
    currency: "BDT",
    tran_id: payload.transactionId,
    success_url: `${config.app_url}/api/payments/confirm?rentalOrderId=${payload.rentalOrderId}&tranId=${payload.transactionId}&status=success`,
    fail_url: `${config.app_url}/api/payments/confirm?rentalOrderId=${payload.rentalOrderId}&tranId=${payload.transactionId}&status=fail`,
    cancel_url: `${config.app_url}/api/payments/confirm?rentalOrderId=${payload.rentalOrderId}&tranId=${payload.transactionId}&status=cancel`,
    shipping_method: "NO",
    product_name: "Gear Rental",
    product_category: "Rental",
    product_profile: "general",
    cus_name: payload.customerName,
    cus_email: payload.customerEmail,
    cus_add1: payload.customerAddress || "N/A",
    cus_add2: "N/A",
    cus_city: "Dhaka",
    cus_state: "N/A",
    cus_postcode: "1000",
    cus_country: "Bangladesh",
    cus_phone: payload.customerPhone || "01711111111",
    cus_fax: "01711111111",
  };

  const apiResponse = await sslcz.init(paymentData);
  return apiResponse;
};

const validatePayment = async (val_id: string) => {
  const sslcz = new SSLCommerzPayment(
    config.sslcommerz_store_id,
    config.sslcommerz_store_password,
  );

  const validation = await sslcz.validate({ val_id });
  return validation;
};

export const sslcommerzUtils = {
  initSession,
  validatePayment,
};
