import OneSignal from "onesignal-node";
import { User } from "../models/auth/user.model.js";
import { Auth } from "../models/auth/auth.model.js";

const client = new OneSignal.Client({
  app: {
    appAuthKey:
      "os_v2_app_s35bknj6bvaa5nzhbqwmniyfar4m3bzfbpcusimyuamqsa7fkf2ilireoauy5yqpdwcx46vcjwwvuf7utzzx6glrl6zluchlgodjqvq",
    appId: "96fa1535-3e0d-400e-b727-0c2cc6a30504",
    
  },
});

const sendNotification = async (phone, title, message) => {
  try {
    // Find the auth record by phone number to get the role
    const authRecord = await Auth.findOne({ phone });
    if (!authRecord) {
      console.log("Auth record not found for the given phone number");
      return;
    }

    // Find the user by authId to get the OneSignal Player ID
    const user = await User.findOne({ authId: authRecord._id });
    if (!user || !user.oneSignalPlayerId) {
      console.log("User not found or OneSignal Player ID is missing");
      return;
    }

    // Determine the role and customize the notification message if needed
    let roleSpecificMessage = message;
    if (authRecord.user_type === "astrologer") {
      roleSpecificMessage = `Hello Astrologer, ${message}`;
    } else if (authRecord.user_type === "user") {
      roleSpecificMessage = `Hello User, ${message}`;
    }

    // Prepare the notification payload
    const notification = {
      contents: { en: roleSpecificMessage },
      headings: { en: title },
      include_player_ids: [user.oneSignalPlayerId], // Target the user's OneSignal Player ID
    };

    // Send the notification via OneSignal API
    await client.createNotification(notification);

    console.log(`Notification sent successfully to ${authRecord.user_type}`);
  } catch (error) {
    console.error("Failed to send push notification:", error.message);
  }
};

export default sendNotification;
