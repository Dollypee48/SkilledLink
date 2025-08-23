const axios = require('axios');

module.exports = {
  verifyIdentity: async (documentType, documentNumber) => {
    const response = await axios.post('https://api.verifyme.ng/v1/identity/verify', {
      document_type: documentType,
      document_number: documentNumber
    }, {
      headers: { Authorization: `Bearer ${process.env.VERIFYME_API_KEY}` }
    });
    return response.data;
  }
};