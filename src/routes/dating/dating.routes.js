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

export default router;
