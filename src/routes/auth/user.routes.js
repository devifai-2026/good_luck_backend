import { Router } from "express";

import {
  addWalletBalance,
  auth_request_verify_OTP,
  authRequest,
  buyAdSubscription,
  buyDatingSubscription,
  buyLocalSubscription,
  buyMatrimonySubscription,
  checkPromoCode,
  deleteUserAccount,
  getAllUsers,
  getAstrologersAndReviewsByUserId,
  getTransactionHistoryByUserId,
  getUserProfileDetailsById,
  getWalletBalanceByUserId,
  login_verify_OTP,
  loginUser,
  refreshAccessToken,
  resendOTP,
  updateUserById,
} from "../../controllers/auth/user.controller.js";
import { verifyJWT } from "./../../middlewares/auth.middleware.js";
const router = Router();

router.route("/newUserRequest").post(authRequest);
router.route("/authRequestVerifyotp").post(auth_request_verify_OTP);
router.route("/login").post(loginUser);
router.route("/loginVerifyotp").post(login_verify_OTP);
router.route("/resend_otp").post(resendOTP);
router.post('/ads-subscription/buy', buyAdSubscription);
router.post('/matrimony-subscription/buy', buyMatrimonySubscription);
router.post('/dating-subscription/buy', buyDatingSubscription);
router.post('/local-subscription/buy', buyLocalSubscription);
router.route("/userWallet/addBalance/:userId").patch(addWalletBalance);
router.get('/wallet-balance/:userId', getWalletBalanceByUserId);
router.get('/transaction-history/:userId', getTransactionHistoryByUserId);
router.get('/profile/:userId', getUserProfileDetailsById);
router.patch('/update-profile/:userId', updateUserById);
router.get('/get-astrologers-reviews/:userId', getAstrologersAndReviewsByUserId);
router.post('/check-promo-code', checkPromoCode);
router.delete('/delete-profile/:userId', deleteUserAccount);
router.get('/getAllUsers', getAllUsers);

// secure routes
// router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh_token").post(verifyJWT, refreshAccessToken);

export default router;
