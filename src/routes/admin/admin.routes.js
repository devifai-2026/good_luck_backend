import express from "express";
import { getAdminTotalBalance, getAdminTransactionHistory } from "../../controllers/admin/admin.controller.js";


const router = express.Router();

// Route to create a HomeBanner ad and a corresponding ServiceAd
router.get("/getBalance", getAdminTotalBalance);
router.get("/transaction", getAdminTransactionHistory);


export default router;
