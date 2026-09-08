const axios = require('axios');

/**
 * Sends an OTP via SMS.
 * Currently configured to simulate sending an SMS or use Fast2SMS if API key is present.
 * 
 * @param {string} phone - The recipient's phone number
 * @param {string} otp - The OTP to send
 */
const sendSMS = async (phone, otp) => {
    try {
        const message = `${otp} is your mobile verification code.`;

        // If FAST2SMS_API_KEY is available in env, send real SMS
        if (process.env.FAST2SMS_API_KEY) {
            await axios.get('https://www.fast2sms.com/dev/bulkV2', {
                params: {
                    authorization: process.env.FAST2SMS_API_KEY,
                    variables_values: otp,
                    route: 'otp',
                    numbers: phone
                }
            });
            console.log(`[SMS Service] OTP sent successfully to ${phone} via Fast2SMS`);
        } else {
            // Mock SMS for development/testing
            console.log(`[SMS Service - MOCK] Simulated sending SMS to ${phone}: "${message}"`);
        }
        return true;
    } catch (error) {
        console.error(`[SMS Service] Error sending SMS to ${phone}:`, error?.response?.data || error.message);
        throw new Error('Failed to send SMS');
    }
};

module.exports = {
    sendSMS
};
