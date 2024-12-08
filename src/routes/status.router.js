import express from "express";
import ResponseBuilder from "../utils/builders/responseBuilder.js";
import { verifyApikeyMiddleware, verifyTokenMiddleware } from "../middlewares/auth.middlewarre.js";

const statusRouter = express.Router()

statusRouter.get('/protected-route/')
