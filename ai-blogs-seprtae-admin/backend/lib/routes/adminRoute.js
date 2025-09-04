import express from "express";
import {adminSignup, adminLogin, approveCommentById, deleteCommentById, getAllBlogsAdmin, getAllComments, getDashboard, getAllEmails, deleteEmailById } from "../controllers/admin.controller.js";
import auth from "../middlewares/auth.middleware.js";
//  import redis from "../config/redis.js";

const adminRouter = express.Router();



adminRouter.post("/login", adminLogin);
adminRouter.get("/comments", auth, getAllComments);
adminRouter.get("/blogs", auth, getAllBlogsAdmin);
adminRouter.post("/delete-comment", auth, deleteCommentById);
adminRouter.post("/approve-comment", auth, approveCommentById);
adminRouter.get("/dashboard", auth, getDashboard);
adminRouter.get("/emails", auth, getAllEmails);
adminRouter.delete("/emails", auth, deleteEmailById);
adminRouter.post("/signUp",adminSignup);


export default adminRouter;