import jwt from 'jsonwebtoken'
import Blog from '../models/BlogModel.js';
import Comment from '../models/CommentModel.js';
import EmailModel from '../models/EmailModel.js';
import redis from '../config/redis.js';
import Admin from '../models/adminModel.js'
import Request from "../models/requestModel.js"


export const adminSignup = async (req, resp) => {
  try {
    const Data = req.body;
  
    if (!Data.company || !Data.email || !Data.password) {
      return resp
        .status(400)
        .json({ error: "Company, email, or password is missing" });
    }

    const c = await Request.findOne({
      company: new RegExp(`^${Data.company}$`, "i"),
    });

    console.log("🔎 Matched request:", c);

    if (!c) {
      return resp.status(404).json({
        warning: "No request found for this company",
      });
    } 
    
    else if (c.status.toLowerCase() === "pending") {
      return resp.json({ warning: "Your company isn’t approved yet" });
    }

    const newAdmin = await Admin.create({
      company: c.company, 
      email: Data.email,
      password: Data.password,
    });

    return resp.status(201).json({
      message: `Admin for ${c.company} has been created successfully`,
      
    });
  } catch (error) {
   
    return resp.status(500).json({ error: "Internal server error" });
  }
};



export const adminLogin = async (req, res)=>{
    try {
        const {email, password} = req.body;


        const admin = await Admin.findOne({ email, password});
        const company = admin.company;

        if(!admin){    
           return res.json({ success: false, message: "Invalid credentials" });
        }

        if(!password){
            res.json({error:"password required"});
        }

        const token = jwt.sign({email}, process.env.JWT_SECRET)
        res.json({success: true, token , company});
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

export const getAllBlogsAdmin = async (req,  res) => {
    try {
        const { company } = req.query; // Get company from query parameter
        let filter = {};
        
        if (company) {
            filter.company = company;
        }
        
        const blogs = await Blog.find(filter).sort({createdAt: -1}).limit(5);
        await redis.set("blogs",JSON.stringify(blogs),"EX",60 )
        res.json({success: true, blogs, company: company || 'all'})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

export const getAllComments = async (req, res) =>{
    try {
        const comments = await Comment.find({}).populate("blog").sort({createdAt: -1})
        res.json({success: true, comments})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

export const getDashboard = async (req, res) =>{
    try {
        const recentBlogs = await Blog.find({}).sort({ createdAt: -1 }).limit(5);
        const blogs = await Blog.countDocuments();
        const comments = await Comment.countDocuments();
        const drafts = await Blog.countDocuments({isPublished: false});

 
        const companyCounts = await Blog.aggregate([
          { $group: { _id: "$company", count: { $sum: 1 } } }
        ]);
        const companyBlogCounts = {};
        companyCounts.forEach(item => {
          companyBlogCounts[item._id] = item.count;
        });

        const dashboardData = {
            blogs, comments, drafts, recentBlogs,
            companyBlogCounts
        };
        res.json({success: true, dashboardData});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const deleteCommentById = async (req, res) =>{
    try {
        const {id} = req.body;
        await Comment.findByIdAndDelete(id);
        res.json({success: true, message:"Comment deleted successfully" })
    } catch (error) {
       res.json({success: false, message: error.message}) 
    }
}

export const approveCommentById = async (req, res) =>{
    try {
        const {id} = req.body;
        await Comment.findByIdAndUpdate(id, {isApproved: true});
        res.json({success: true, message:"Comment approved successfully" })
    } catch (error) {
       res.json({success: false, message: error.message}) 
    }
}

export const getAllEmails = async (req, res) => {
    try {
        const emails = await EmailModel.find({}).sort({date: -1});
        res.json({success: true, emails})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

export const deleteEmailById = async (req, res) => {
    try {
        const {id} = req.query;
        await EmailModel.findByIdAndDelete(id);
        res.json({success: true, msg: "Email deleted successfully" })
    } catch (error) {
       res.json({success: false, message: error.message}) 
    }
}


export const updatePassword = async (req, resp) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return resp.status(400).json({ success: false, msg: "Email and password are required" });
    }

    const result = await Admin.updateOne(
      { email: email }, 
      { $set: { password: password } }
    );

    if (result.matchedCount === 0) {
      return resp.status(404).json({ success: false, msg: "User not found" });
    }

    return resp.json({ success: true, msg: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    return resp.status(500).json({ success: false, msg: "Server error" });
  }
}

 export const editBlogs = async (req, resp) => {
  try {
   
    const { id } = req.params;

    if (!id) {
      return resp.status(400).json({ error: "Blog ID is required" });
    }

    const result = await Blog.findByIdAndUpdate(
      id,
      req.body, { new: true }
    );

    if (!result) {
      return resp.status(404).json({ error: "Blog not found" });
    }

    return resp.json({ message: "Blog updated successfully", blog: result });
  } catch (err) {
    return resp
      .status(500)
      .json({ error: "Unexpected error while updating blog", details: err.message });
  }
};


// export const deleteBlog = async (req, res) => {
//   try {
//     const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
//     if (!deletedBlog) return res.status(404).json({ error: "Blog not found" });
//     res.json({ message: "Blog deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ error: "Error deleting blog" });
//   }
// };
