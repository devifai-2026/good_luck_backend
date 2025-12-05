import { Router } from "express";
import {
  createMatrimonyProfile,
  deleteMatrimonyProfileByUserId,
  getAllMatrimonyProfile,
  getAllProfile,
  getMatrimonyProfileByUserId,
  getPendingLikesProfilesMatrimony,
  getRandomBrides,
  getRandomGrooms,
  getSentLikesProfilesMatrimony,
  sendLikeMatrimony,
  updateMatrimonyProfileByUserId,
} from "../../controllers/matrimony/matrimony.controller.js";
import {
  blockMatrimonyUser,
  canInteractWithMatrimonyUser,
  checkMatrimonyBlockStatus,
  getBlockedMatrimonyUsers,
  getMatrimonyReportsByStatus,
  getMatrimonyUserReports,
  reportMatrimonyUser,
  unblockMatrimonyUser,
  updateMatrimonyReportStatus,
} from "../../controllers/matrimony/matrimonyReportBlock.controller.js";

const router = Router();

router.route("/createMatrimonyProfile/:id").post(createMatrimonyProfile);
router.route("/").get(getAllProfile);
router.route("/getAll/:id").get(getAllMatrimonyProfile);
router.route("/brides/:userId").get(getRandomBrides);
router.route("/grooms/:userId").get(getRandomGrooms);
router.route("/:id").get(getMatrimonyProfileByUserId);
router.route("/update/:id").patch(updateMatrimonyProfileByUserId);
router.post("/send_like/:senderId/:receiverId", sendLikeMatrimony);
router.get("/get/pending_like/:userId", getPendingLikesProfilesMatrimony);
router.get("/get/sent_like/:userId", getSentLikesProfilesMatrimony);
router.route("/delete/:id").delete(deleteMatrimonyProfileByUserId);

// Matrimony Report & Block Routes
router.post("/report/:reporterId/:reportedId", reportMatrimonyUser);
router.post("/block/:blockerId/:blockedId", blockMatrimonyUser);
router.post("/unblock/:blockerId/:blockedId", unblockMatrimonyUser);
router.get("/blocked/:userId", getBlockedMatrimonyUsers);
router.get("/check-block/:userId1/:userId2", checkMatrimonyBlockStatus);
router.get("/can-interact/:userId1/:userId2", canInteractWithMatrimonyUser);

// Admin Routes
router.get("/reports/:userId", getMatrimonyUserReports);
router.get("/reports/status/:status", getMatrimonyReportsByStatus);
router.put("/report/:reportId/status", updateMatrimonyReportStatus);

export default router;
