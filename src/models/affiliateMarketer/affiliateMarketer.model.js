import mongoose from "mongoose";
import walletSchema from "../wallet/wallet.model.js";
import { validatePhoneNumber } from "../../utils/validatePhoneNumber.js";

const { Schema } = mongoose;

const affiliateSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    authId: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    Fname: {
      type: String,
      // required: [true, "First name is required"],
    },
    Lname: {
      type: String,
      // required: [true, "Last name is required"],
    },
    profile_picture: {
      type: String,
      required: [true, "Profile picture is required"],
    },
    phone: {
      type: String,
      required: [true, "Phone Number is required"],
      validate: {
        validator: function (v) {
          return validatePhoneNumber(v); // Use the validatePhoneNumber function
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    wallet: {
      type: walletSchema,
      default: () => ({ balance: 0, transactionHistory: [] }),
    },
    promo_code: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const AffiliateMarketer = mongoose.model("AffiliateMarketer", affiliateSchema);

export default AffiliateMarketer;
