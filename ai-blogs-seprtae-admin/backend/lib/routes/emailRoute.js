import express from "express";
import { subscribeEmail } from "../controllers/blog.controller.js";
import multer from "multer";

const emailRouter = express.Router();

const upload = multer();

emailRouter.post("/", upload.none(), subscribeEmail);

export default emailRouter; 