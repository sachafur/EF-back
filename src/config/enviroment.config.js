import dotenv from 'dotenv';


dotenv.config();


const ENVIROMENT = {
    PORT: process.env.PORT,
    DB_URL: process.env.DB_URL,
    
    JWT_SECRET: process.env.JWT_SECRET,
    GMAIL_PASS: process.env.GMAIL_PASS,
    GMAIL_USER: process.env.GMAIL_USER,
    API_KEY_INTERN: process.env.API_KEY_INTERN,
    MYSQL: {
        USERNAME: process.env.MYSQL_USERNAME,
        HOST: process.env.MYSQL_HOST,
        PASSWORD: process.env.MYSQL_PASSWORD,
        DATABASE: process.env.MYSQL_DATABASE
    }
}

export default ENVIROMENT


