import express from "express";
import { getAdminTotalBalance, getAdminTransactionHistory } from "../../controllers/admin/admin.controller.js";


const router = express.Router();

// Route to create a HomeBanner ad and a corresponding ServiceAd
router.get("/getBalance/:adminId", getAdminTotalBalance);
router.get("/transaction/:adminId", getAdminTransactionHistory);


export default router;
