import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
} from "../../controllers/local services/localservicesCategory.controller.js";

const router = Router();

router.route("/createLocalCategory").post(createCategory);
router.route("/getAll").get(getAllCategories);
router.route("/get/:id").get(getCategoryById);
router.route("/update/:id").patch(updateCategory);
router.route("/delete/:id").delete(deleteCategory);

export default router;
