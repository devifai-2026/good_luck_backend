import { Router } from "express";
import { getAstrologerChatHistory, getChatList } from "../../controllers/chatController/astrologerWithUser/controller.js";

const router = Router();

router.get('/chat-history/:userId/:astrologerId', getAstrologerChatHistory);
// router.get('/chat-list/:userId', getChatListForUser);
router.get('/chat-list/:id', getChatList);

export default router;
