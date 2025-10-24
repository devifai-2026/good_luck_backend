import axios from "axios";

export const sendOTP = async (phoneNumber) => {
  const customerId = process.env.OTP_CUSTOMER_ID;
  const authToken = process.env.OTP_AUTH_TOKEN;
  const url = `https://cpaas.messagecentral.com/verification/v3/send?countryCode=91&customerId=${customerId}&flowType=SMS&mobileNumber=${phoneNumber}`;

  try {
    // Send the request to the API to send OTP
    const response = await axios.post(
      url,
      {},
      {
        headers: {
          authToken: authToken, // Use actual token here
        },
      }
    );

    // console.log(response)

    // Check if the response was successful
    if (response.data.status === "success") {
      // console.log('OTP sent successfully!');
      return { success: true, data: response.data };
    } else {
      // console.error('Failed to send OTP:', response.data.message);
      return { success: false, data: response.data };
    }
  } catch (error) {
    // Handle errors properly by checking error.response
    console.error(
      "Error sending OTP:",
      error.response ? error.response.data : error.message
    );
    return {
      success: false,
      data: error.response ? error.response.data : error.message,
    };
  }
};
