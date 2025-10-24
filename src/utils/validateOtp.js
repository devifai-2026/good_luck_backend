import axios from "axios";

export const validateOTP = async (phoneNumber, verificationId, code) => {
  const customerId = process.env.OTP_CUSTOMER_ID;
  const authToken = process.env.OTP_AUTH_TOKEN;
  const url = `https://cpaas.messagecentral.com/verification/v3/validateOtp?countryCode=91&mobileNumber=${phoneNumber}&verificationId=${verificationId}&customerId=${customerId}&code=${code}`;


  try {
    const response = await axios.get(url, {
      headers: {
        authToken: authToken,
      },
    });

    if (response.data.responseCode === 200) {
      console.log("OTP validated successfully!");
      return { success: true, data: response.data };
    } else {
      console.error("Failed to validate OTP:", response.data.message);
      return { success: false, data: response.data };
    }
  } catch (error) {
    console.error(
      "Error validating OTP:",
      error.response ? error.response.data : error.message
    );
    return {
      success: false,
      data: error.response ? error.response.data : error.message,
    };
  }
};
