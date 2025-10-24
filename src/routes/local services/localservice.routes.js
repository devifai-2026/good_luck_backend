import { Router } from "express";
import {
  createLocalService,
  deleteLocalService,
  getAllLocalServices,
  getLocalServiceById,
  getLocalServicesByCategory,
  updateLocalService,
  searchLocalServicesByLocation,
  getLocalServicesByCity,
  getLocalServicesByState,
  filterLocalServices,
} from "../../controllers/local services/localservice.controller.js";

const router = Router();

router.route("/").post(createLocalService).get(getAllLocalServices);
router.route("/search/location").get(searchLocalServicesByLocation);
router.route("/city/:city").get(getLocalServicesByCity);
router.route("/state/:state").get(getLocalServicesByState);
router.route("/category/:categoryId").get(getLocalServicesByCategory);
router.route("/filter").get(filterLocalServices);
router
  .route("/:id")
  .get(getLocalServiceById)
  .patch(updateLocalService)
  .delete(deleteLocalService);


export default router;
