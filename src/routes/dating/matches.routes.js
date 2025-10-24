import express from "express";
import { getMatchesByUserId } from "../../controllers/dating/matches.controller.js";

const router = express.Router();

router.get("/matches/:userId", getMatchesByUserId);

export default router;
