import { Router } from "express";
import { createLocalSubscription, deleteLocalSubscription, getLocalSubscription, updateLocalSubscription } from "../../controllers/subscriptions/localSubscription.controller.js";


const router = Router();

router.route("/create").post(createLocalSubscription);
router.route("/get").get(getLocalSubscription);
router.route("/update/:subscriptionId").patch(updateLocalSubscription);
router.route("/delete/:subscriptionId").delete(deleteLocalSubscription);

export default router;
