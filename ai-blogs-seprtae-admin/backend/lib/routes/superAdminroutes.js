import express from "express";
import {
  superAdminSignup,
  superAdminLogin,
  getCompanyWiseBlogCount,
  getRequests,
  approveRequest,
  deleteRequest
} from "../controllers/superAdmin.controller.js";

const router = express.Router();

router.post("/signup", superAdminSignup);
router.post("/login", superAdminLogin);
router.get("/company-blogs", getCompanyWiseBlogCount);
router.get("/getRequests" , getRequests);
router.put("/approveRequest/:id" , approveRequest);
router.delete("/deleteRequest/:id", deleteRequest);

export default router;
