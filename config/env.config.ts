import env from 'dotenv';

env.config();

const envConfig = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',

  userEmail: process.env.TEST_USER_EMAIL || '',
  userPassword: process.env.TEST_USER_PASSWORD || '',

  adminEmail: process.env.TEST_ADMIN_EMAIL || '',
  adminPassword: process.env.TEST_ADMIN_PASSWORD || '',

  blockableUserEmail: process.env.TEST_BLOCKABLE_USER_EMAIL || '',
  blockableUserPassword: process.env.TEST_BLOCKABLE_USER_PASSWORD || '',
};

export default envConfig;
