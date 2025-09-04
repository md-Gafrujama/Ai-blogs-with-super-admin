// import jwt from "jsonwebtoken";
// import SuperAdmin from "../models/SuperAdminModel.js";
// import Blog from "../models/BlogModel.js";
// import Request from "../models/requestModel.js"


// export const superAdminSignup = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const existing = await SuperAdmin.findOne({ email });
//     if (existing) {
//       return res.json({ success: false, message: "Super admin already exists" });
//     }

  
//     await SuperAdmin.create({ email, password });

//     res.json({ success: true, message: "Super admin registered successfully" });
//   } catch (error) {
//     res.json({ success: false, message: error.message });
//   }
// };

// export const superAdminLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const superAdmin = await SuperAdmin.findOne({ email });
//     if (!superAdmin) {
//       return res.json({ success: false, message: "Invalid credentials" });
//     }

  
//     if (password !== superAdmin.password) {
//       return res.json({ success: false, message: "Invalid credentials" });
//     }

//     // Generate JWT
//     const token = jwt.sign(
//       { email: superAdmin.email, role: "superadmin" },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     res.json({ success: true, token,  role:"super-admin" });
//   } catch (error) {
//     res.json({ success: false, message: error.message });
//   }
// };

// // Get Blog Count Company-wise
// export const getCompanyWiseBlogCount = async (req, res) => {
//   try {
//     const companyCounts = await Blog.aggregate([
//       { $group: { _id: "$company", count: { $sum: 1 } } },
//     ]);

//     const result = {};
//     companyCounts.forEach((item) => {
//       result[item._id] = item.count;
//     });

//     res.json({ success: true, companyBlogCounts: result });
//   } catch (error) {
//     res.json({ success: false, message: error.message });
//   }
// };

// export const getRequests = async(req , resp) => {
 
//   try{
//        const data = await Request.find();
       
//        if(!data) {
//            resp.json({message:"error while fetching"});
//        }
//        else {
//         resp.json(data);
//        }
//   } catch{
//           resp.send({error:error.message , message:"nhi ho paya kaam"});
//   }
  
// }

// export const approveRequest = async (req, resp) => {
//   try {
//     const { id } = req.params;
//     const { status, rejectionReason } = req.body;

//     // validate status
//     if (!["approved", "rejected", "pending"].includes(status)) {
//       return resp.json({ success: false, message: "Invalid status value" });
//     }

//     // find request first
//     const request = await Request.findById(id);
//     if (!request) {
//       return resp.json({ success: false, message: "Request not found" });
//     }

   
//     request.status = status;
//     request.reviewedAt = new Date();
//     request.reviewedBy = "SuperAdmin"; 
//     if (status === "rejected") {
//       request.rejectionReason = rejectionReason || "No reason provided";
//     }

//     await request.save();

    
//     if (status === "approved") {
//       const existingAdmin = await Admin.findOne({ company: request.company });
//       if (!existingAdmin) {
//         await Admin.create({
//           company: request.company,
//           email: request.email,
//           password: request.password, 
//         });
//       }
//     }

//     return resp.json({
//       success: true,
//       message: `Request has been ${status}`,
//       request,
//     });
//   } catch (error) {
//     resp.json({ success: false, message: error.message });
//   }
// };
  import jwt from "jsonwebtoken";
import SuperAdmin from "../models/SuperAdminModel.js";
import Blog from "../models/BlogModel.js";
import Request from "../models/requestModel.js";
import Admin from "../models/AdminModel.js"; // Added missing import

export const superAdminSignup = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existing = await SuperAdmin.findOne({ email });
    if (existing) {
      return res.json({ success: false, message: "Super admin already exists" });
    }

    await SuperAdmin.create({ email, password });

    res.json({ success: true, message: "Super admin registered successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const superAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const superAdmin = await SuperAdmin.findOne({ email });
    if (!superAdmin) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    if (password !== superAdmin.password) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { email: superAdmin.email, role: "superadmin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ success: true, token, role: "super-admin" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Get Blog Count Company-wise
export const getCompanyWiseBlogCount = async (req, res) => {
  try {
    const companyCounts = await Blog.aggregate([
      { $group: { _id: "$company", count: { $sum: 1 } } },
    ]);

    const result = {};
    companyCounts.forEach((item) => {
      result[item._id] = item.count;
    });

    res.json({ success: true, companyBlogCounts: result });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getRequests = async (req, resp) => {
  try {
    const data = await Request.find();

    if (!data) {
      return resp.json({ success: false, message: "Error while fetching requests" });
    }

    resp.json({ success: true, data });
  } catch (error) { // Fixed: added 'error' parameter
    resp.json({ success: false, error: error.message, message: "Failed to fetch requests" });
  }
};

export const approveRequest = async (req, resp) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    // validate status
    if (!["approved", "rejected", "pending"].includes(status)) {
      return resp.json({ success: false, message: "Invalid status value" });
    }

    // find request first
    const request = await Request.findById(id);
    if (!request) {
      return resp.json({ success: false, message: "Request not found" });
    }

    request.status = status;
    request.reviewedAt = new Date();
    request.reviewedBy = "SuperAdmin";

    if (status === "rejected") {
      request.rejectionReason = rejectionReason || "No reason provided";
    }

    await request.save();

    if (status === "approved") {
      const existingAdmin = await Admin.findOne({ company: request.company });
      if (!existingAdmin) {
        await Admin.create({
          company: request.company,
          email: request.email,
          password: request.password,
        });
      }
    }

    return resp.json({
      success: true,
      message: `Request has been ${status}`,
      request,
    });
  } catch (error) {
    resp.json({ success: false, message: error.message });
  }
};
