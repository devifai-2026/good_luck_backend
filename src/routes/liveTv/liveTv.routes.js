import express from "express";
import {
  createLiveTV,
  deleteLiveTVById,
  getAllLiveTV,
  getLiveTVById,
  updateLiveTVById,
} from "../../controllers/liveTv/liveTv.controller.js";

const router = express.Router();

router.post("/create", createLiveTV);
router.get("/getAll", getAllLiveTV);
router.get("/get/:id", getLiveTVById);
router.patch("/update/:id", updateLiveTVById);
router.delete("/delete/:id", deleteLiveTVById);

export default router;
