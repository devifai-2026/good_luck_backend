import { Router } from "express";
import { createDatingSubscription, deleteDatingSubscription, getDatingSubscription, updateDatingSubscription } from "../../controllers/subscriptions/dating.subscription.controller.js";


const router = Router();

router.route("/create").post(createDatingSubscription);
router.route("/get").get(getDatingSubscription);
router.route("/update/:subscriptionId").patch(updateDatingSubscription);
router.route("/delete/:subscriptionId").delete(deleteDatingSubscription);

export default router;
