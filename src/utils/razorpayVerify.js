import crypto from "crypto";
import Razorpay from "razorpay";

let razorpayInstance = null;

const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
};

// Verifies the HMAC signature Razorpay returns after a successful checkout.
// Formula per Razorpay docs: hmac_sha256(order_id + "|" + payment_id, key_secret)
export const verifyRazorpaySignature = ({ orderId, paymentId, signature }) => {
  if (!orderId || !paymentId || !signature) return false;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature);
  const actualBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== actualBuffer.length) return false;

  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
};

// Confirms the amount actually captured by Razorpay for this payment matches
// the expected plan price, so a client can't pay for a cheap tier while
// requesting an expensive one.
export const fetchAndVerifyPaidAmount = async (paymentId, expectedAmountInRupees) => {
  const payment = await getRazorpayInstance().payments.fetch(paymentId);

  if (!payment || payment.status !== "captured") {
    return false;
  }

  return payment.amount === Math.round(expectedAmountInRupees * 100);
};
