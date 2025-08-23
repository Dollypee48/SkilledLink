const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

module.exports = {
  sendSMS: (to, body) => twilio.messages.create({ body, from: process.env.TWILIO_PHONE_NUMBER, to })
};