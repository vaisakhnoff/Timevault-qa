import env from 'dotenv';

env.config()


const envConfig = {

    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    
    userEmail :process.env.TEST_USER_EMAIL || '',
    userPassword : process.env.TEST_USER_PASSWORD || '',

    adminEmail : process.env.TEST_ADMIN_EMAIL || '',
    adminPassword : process.env.TEST_ADMIN_PASSWORD || '',


}

export default envConfig

