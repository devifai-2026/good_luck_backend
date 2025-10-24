import express from "express";
import { createPanchang, deletePanchangById, getAllPanchang, getPanchangByDate, getPanchangByDay, getPanchangByMonth, updatePanchangById } from "../../controllers/panchag/panchang.controller.js";


const router = express.Router();

router.post("/create", createPanchang);
router.get("/getAll", getAllPanchang);
router.get("/getByDate/:date", getPanchangByDate);
router.get("/getByDay/:day", getPanchangByDay);
router.get("/getByMonth/:month", getPanchangByMonth);
router.patch("/update/:id", updatePanchangById);
router.delete("/delete/:id", deletePanchangById);

export default router;
