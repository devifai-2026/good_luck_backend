import express from "express";
import {
  createCalendarEntry,
  deleteCalendarEntryById,
  getAllCalendarEntries,
  getCalendarEntryByMonth,
  updateCalendarEntryById,
} from "../../controllers/calender/calender.controller.js";

const router = express.Router();

router.post("/create", createCalendarEntry);
router.get("/getAll", getAllCalendarEntries);
router.get("/getByMonth/:month", getCalendarEntryByMonth);
router.patch("/update/:id", updateCalendarEntryById);
router.delete("/delete/:id", deleteCalendarEntryById);

export default router;
