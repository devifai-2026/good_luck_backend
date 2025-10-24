import { Router } from "express";
import {
  createOrders,
  getPaymentByPaymentId,
} from "../../controllers/payment/razorpay.controller.js";

const router = Router();

router.post("/pay/orders", createOrders);
router.get("/payment/:paymentId", getPaymentByPaymentId);

export default router;
