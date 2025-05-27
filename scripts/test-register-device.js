const axios = require('axios');
require("dotenv").config();


// Replace these values with real ones
const API_URL = 'https://lms-stage.josip-prpic.from.hr/api/register-device';
const JWT_SECRET = process.env.JWT_TOKEN
const testPayload = {
  serial: 'lms-proto-t1-abc123-2025-05-25',
  deviceName: 'lms-proto-t1-abc123'
};

async function testRegisterDevice() {
  try {
    const response = await axios.post(API_URL, testPayload, {
      headers: {
        Authorization: `Bearer ${JWT_SECRET}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Success response:');
    console.log(response.data);
  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
    } else {
      console.error('❌ Request Error:', error.message);
    }
  }
}

testRegisterDevice();
