import { Router } from "express";
import { createMatrimonySubscription, deleteMatrimonySubscription, getMatrimonySubscription, updateMatrimonySubscription } from "../../controllers/subscriptions/matrimony.subscription.controller.js";

const router = Router();

router.route("/create").post(createMatrimonySubscription);
router.route("/get").get(getMatrimonySubscription);
router.route("/update/:subscriptionId").patch(updateMatrimonySubscription);
router.route("/delete/:subscriptionId").delete(deleteMatrimonySubscription);

export default router;
