import express from "express";
import {
  superAdminSignup,
  superAdminLogin,
  getCompanyWiseBlogCount,
  getRequests,
  approveRequest
} from "../controllers/superAdmin.controller.js";

const router = express.Router();

router.post("/signup", superAdminSignup);
router.post("/login", superAdminLogin);
router.get("/company-blogs", getCompanyWiseBlogCount);
router.get("/getRequests" , getRequests);
router.put("/approveRequest/:id" , approveRequest);

export default router;
