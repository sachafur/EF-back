import ENVIROMENT from "./config/enviroment.config.js";
import express from "express";
import mongoose from './db/config.js';
import cors from 'cors'
import statusRouter from "./routes/status.router.js";
import dotenv from 'dotenv';
import authRouter from "./routes/authrouter.js";

dotenv.config()

const app = express();
const PORT = process.env.PORT || 3000

app.use(express.json())

app.use('/api/status', statusRouter)
app.use('/api/auth', authRouter)

app.listen(PORT, () => {
    console.log('El servidor se esta ejecutando http://localhost:${PORT}')
})