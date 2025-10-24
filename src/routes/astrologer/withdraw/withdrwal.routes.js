import express from "express";
import { createWithdrawalRequest, deleteWithdrawalRequestById, getAllWithdrawalRequests, getWithdrawalRequestById, getWithdrawalRequestsByAstrologerId, updateWithdrawalRequestById } from './../../../controllers/astrologer/withdrawalRequest.controller.js';

const router = express.Router();

router.post("/create", createWithdrawalRequest);
router.get("/", getAllWithdrawalRequests);
router.get("/:id", getWithdrawalRequestById);
router.get("/astrologer/:astrologerId", getWithdrawalRequestsByAstrologerId);
router.patch("/:id", updateWithdrawalRequestById);
router.delete("/:id", deleteWithdrawalRequestById);

export default router;
