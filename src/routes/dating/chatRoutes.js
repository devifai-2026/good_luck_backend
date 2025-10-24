import express from "express";
import {
  createChatForMatch,
  getMessagesByMatchAndUserId,
  getMessagesByMatchId
} from "../../controllers/dating/chatController.js";

const router = express.Router();

router.post("/create", createChatForMatch);
router.get("/messages/:matchId/user/:userId", getMessagesByMatchAndUserId);
router.get("/messages/:matchId", getMessagesByMatchId);

export default router;
