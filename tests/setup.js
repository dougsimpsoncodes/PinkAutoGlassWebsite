// Load environment variables before tests run
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

module.exports = async () => {
  // Global setup function
  console.log('Environment variables loaded');
};
