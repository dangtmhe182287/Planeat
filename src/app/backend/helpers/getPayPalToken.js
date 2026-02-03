const axios = require('axios');

const getPayPalToken = async () => {
  const response = await axios.post(
    `${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`, 
    'grant_type=client_credentials',
    {
      auth: {
        username: process.env.PAYPAL_CLIENT_ID,
        password: process.env.PAYPAL_CLIENT_SECRET
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }
  );
  return response.data.access_token;
};

module.exports = {getPayPalToken};