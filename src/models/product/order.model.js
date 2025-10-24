import mongoose from "mongoose";
import { validatePhoneNumber } from "../../utils/validatePhoneNumber.js";

const { Schema, model } = mongoose;

const orderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    city: {
      type: String,
      trim: true,
      required: [true, "City name is required"],
    },
    state: {
      type: String,
      trim: true,
      required: [true, "State description is required"],
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
    order_details: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product id is required"],
    },
    delivery_date: {
      type: Date,
    },
    is_order_complete: {
      type: Boolean,
      default: false,
    },
    // cancel_order: {
    //   isCancel: {
    //     type: Boolean,
    //     default: false,
    //   },
    //   cancel_date_time: {
    //     type: Date,
    //     default: null,
    //   },
    // },
    quantity: {
      type: Number,
      default: 1,
    },
    total_price: {
      type: Number,
    },
    payment_method: {
      type: String,
      required: [true, "Payment method is required"],
    },
    is_payment_done: {
      type: Boolean,
      default: false,
    },
    promo_code: {
      type: Number,
    },
    isPromoCodeApplied: {
      type: Boolean,
      default: false,
    },
    isSuperNoteApplied: {
      type: Boolean,
      default: false,
    },
    transaction_id: {
      type: String,
      required: function () {
        return this.is_payment_done;
      },
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Order = model("Order", orderSchema);

export default Order;
