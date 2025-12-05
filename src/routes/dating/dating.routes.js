import { Router } from "express";
import {
  createDatingProfile,
  deleteDatingProfileByUserId,
  getAllDatingProfiles,
  getDatingProfileByUserId,
  getPendingLikesProfilesDating,
  getSentLikesProfilesDating,
  sendLikeDating,
  updateDatingProfileByUserId,
  getRandomMaleProfiles,
  getRandomFemaleProfiles,
  getAllProfiles,
  // getMatchesProfilesDating,
} from "../../controllers/dating/dating.controller.js";
import {
  blockUser,
  checkIfBlocked,
  getBlockedUsers,
  getUserReports,
  reportUser,
  unblockUser,
  updateReportStatus,
} from "../../controllers/dating/datingReportBlock.controller.js";

const router = Router();

router.route("/createDatingProfile/:id").post(createDatingProfile);
router.route("/").get(getAllProfiles);
router.route("/getAll/:id").get(getAllDatingProfiles);
router.route("/male/:userId").get(getRandomMaleProfiles);
router.route("/female/:userId").get(getRandomFemaleProfiles);
router.route("/:id").get(getDatingProfileByUserId);
router.route("/update/:id").patch(updateDatingProfileByUserId);
router.post("/send_like/:senderId/:receiverId", sendLikeDating);
router.get("/pending_like/:userId", getPendingLikesProfilesDating);
router.get("/sent_like/:userId", getSentLikesProfilesDating);
// router.get("/matched/:userId", getMatchesProfilesDating);
router.route("/delete/:id").delete(deleteDatingProfileByUserId);

// User routes
router.post("/report/:reporterId/:reportedId", reportUser);
router.post("/block/:blockerId/:blockedId", blockUser);
router.post("/unblock/:blockerId/:blockedId", unblockUser);
router.get("/blocked/:userId", getBlockedUsers);
router.get("/check-block/:userId1/:userId2", checkIfBlocked);

// Admin routes
router.get("/reports/:userId", getUserReports);
router.put("/report/:reportId/status", updateReportStatus);

export default router;
