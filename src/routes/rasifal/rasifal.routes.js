import express from "express";
import { createRasifal, deleteRasifalById, getAllRasifal, getRasifalByDate, getRasifalByDay, getRasifalByMonth, updateRasifalById } from "../../controllers/rasifal/rasifal.controller.js";


const router = express.Router();

// Define routes for Rasifal
router.post("/create", createRasifal);
router.get("/getAll", getAllRasifal);
router.get("/getByDate/:date", getRasifalByDate);
router.get("/getByDay/:day", getRasifalByDay);
router.get("/getByMonth/:month", getRasifalByMonth);
router.patch("/update/:id", updateRasifalById);
router.delete("/delete/:id", deleteRasifalById);

export default router;
