import fs from 'fs';
import imagekit from '../config/imagekit.js';
import Blog from '../models/BlogModel.js';
import Comment from '../models/CommentModel.js';
import EmailModel from '../models/EmailModel.js';
import main from '../config/gemini.js';
import emailService from '../config/nodemailer.js';
import redis from '../config/redis.js';
import Request from '../models/requestModel.js';

// ------------------------- CONFIG ------------------------- //
const companyBaseURL = {
  personifiedb2b: "https://blogs.personifiedb2bmarketing.com",
  quoreit: "https://quore-it-ai-blogs.vercel.app",
  company3: "",
  company4: ""
};

const companyWiseSMTP = {
  personifiedb2b: {
    SMTP_PASS: "uwlfybytsnfeuvwe",
    SMTP_USER: "mdrizwan6386@gmail.com",
    FROM_EMAIL: "mdrizwan6386@gmail.com"
  },
  quoreit: {
    SMTP_PASS: "uwlfybytsnfeuvwe",
    SMTP_USER: "mdrizwan6386@gmail.com",
    FROM_EMAIL: "mdrizwan6386@gmail.com"
  },
  company3: {
    SMTP_PASS: "",
    SMTP_USER: "",
    FROM_EMAIL: ""
  },
  company4: {
    SMTP_PASS: "",
    SMTP_USER: "",
    FROM_EMAIL: ""
  }
};

// ------------------------- HELPERS ------------------------- //

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')           
    .replace(/[^a-z0-9\-]/g, '')    
    .replace(/\-+/g, '-')           
    .replace(/^-+/, '')             
    .replace(/-+$/, '');            
}

async function sendNewsletter(blog) {
  try {
    const companyPattern = new RegExp(`^${escapeRegex(blog.company)}$`, 'i');
    const subscribers = await EmailModel.find({ company: companyPattern }).lean();
    const recipientEmails = subscribers.map(s => s.email).filter(Boolean);

    const smtpConfig = companyWiseSMTP[blog.company];
    const siteBaseUrl = companyBaseURL[blog.company];

    if (!smtpConfig || !smtpConfig.SMTP_USER) {
      console.warn(`No SMTP config for company: ${blog.company}`);
      return;
    }

    if (recipientEmails.length === 0) {
      console.log(`No subscribers for ${blog.company}`);
      return;
    }

    const blogUrl = `${siteBaseUrl}/blogs/${blog.slug}`;

    for (const email of recipientEmails) {
      try {
        const msg = {
          to: email,
          from: smtpConfig.FROM_EMAIL || 'no-reply@example.com',
          subject: `📰 New Blog Published: ${blog.title}`,
          html: `
            <div style="font-family: Arial, Helvetica, sans-serif;">
              <h2>${blog.title}</h2>
              <p>${blog.description?.slice(0, 200) || ''}...</p>
              <a href="${blogUrl}" target="_blank">👉 Read Full Blog</a>
              <hr/>
              <p style="font-size:12px;color:#666;">
                You subscribed to <strong>${blog.company}</strong> updates.
                <a href="${siteBaseUrl}/unsubscribe?email=${encodeURIComponent(email)}&company=${encodeURIComponent(blog.company)}">Unsubscribe</a>
              </p>
            </div>
          `
        };

        if (typeof emailService.sendMail === 'function') {
          await emailService.sendMail(msg);
        } else if (typeof emailService.send === 'function') {
          await emailService.send(msg);
        } else if (typeof emailService.sendMultiple === 'function') {
          await emailService.sendMultiple({ ...msg, to: [email] });
        } else {
          throw new Error('No valid email sending method found');
        }

        console.log(`Newsletter sent to ${email}`);
      } catch (mailErr) {
        console.error(`Failed to send to ${email}:`, mailErr.message);
      }
    }
  } catch (err) {
    console.error("Newsletter send failed:", err.message);
  }
}

// ------------------------- CONTROLLERS ------------------------- //
export const addBlog = async (req, res) => {
  try {
    const { title, description, category, author, authorImg, isPublished, company, department, subcategory } = req.body;
    const imageFile = req.file;

    if (!title || !description || !category || !author || !authorImg || !imageFile || !company || !department || !subcategory) {
      return res.json({ success: false, message: "Missing required fields" });
    }

    const fileBuffer = fs.readFileSync(imageFile.path);
    const response = await imagekit.upload({
      file: fileBuffer,
      fileName: imageFile.originalname,
      folder: "/blogs"
    });
    fs.unlinkSync(imageFile.path);

    const optimizedImageUrl = imagekit.url({
      path: response.filePath,
      transformation: [
        { quality: 'auto' },
        { format: 'webp' },
        { width: '1280' }
      ]
    });

    const slug = slugify(title);

    const created = await Blog.create({ 
      title,
      description,
      category,
      department,
      subcategory,
      author,
      authorImg,
      image: optimizedImageUrl,
      slug,
      company,
      isPublished: isPublished === 'true'
    });

    if (created.isPublished) {
      await sendNewsletter(created);
    }

    res.json({ success: true, message: "Blog added successfully" });

  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ isPublished: true });
    const responseData = { success: true, blogs };
    await redis.set("blogs", JSON.stringify(responseData), "EX", 60);
    res.json(responseData);
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params; // use `id` since your route has :id
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

   
    res.json(blog);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


export const deleteBlogById = async (req, res) => {
  try {
    const { id } = req.body;
    await Blog.findByIdAndDelete(id);
    await Comment.deleteMany({ blog: id });
    res.json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export const togglePublish = async (req, res) => {
  try {
    const { id } = req.body;
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.json({ success: false, message: "Blog not found" });
    }

    const wasPublished = blog.isPublished;
    blog.isPublished = !blog.isPublished;
    await blog.save();

    if (!wasPublished && blog.isPublished) {
      await sendNewsletter(blog);
    }

    res.json({ success: true, message: "Blog status updated" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { blog, name, content } = req.body;
    await Comment.create({ blog, name, content });
    res.json({ success: true, message: 'Comment added for review' });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export const getBlogComments = async (req, res) => {
  try {
    const { blogSlug } = req.body;
    const blog = await Blog.findOne({ slug: blogSlug });
    if (!blog) {
      return res.json({ success: false, message: "Blog not found" });
    }
    const comments = await Comment.find({ blog: blog._id, isApproved: true }).sort({ createdAt: -1 });
    await redis.set("comments", JSON.stringify(comments), "EX", 60);
    res.json({ success: true, comments });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export const generateContent = async (req, res) => {
  try {
    const { prompt } = req.body;
    const enhancedPrompt = `Generate a comprehensive blog post about "${prompt}". 
    Please format using HTML with <h2>, <p>, <ul>, <li>, intro, 3-4 sections, and conclusion.`;

    const rawContent = await main(enhancedPrompt);
    let formattedContent = rawContent
      .replace(/```html\s*/g, '')
      .replace(/```\s*/g, '')
      .replace(/^\s*<html>\s*/i, '')
      .replace(/<\/html>\s*$/i, '')
      .replace(/^\s*<body>\s*/i, '')
      .replace(/<\/body>\s*$/i, '')
      .replace(/^\s*<head>.*?<\/head>\s*/is, '')
      .replace(/^\s*<!DOCTYPE.*?>\s*/i, '')
      .trim();

    if (!formattedContent.includes('<h2>') && !formattedContent.includes('<p>')) {
      const paragraphs = rawContent.split('\n\n').filter(p => p.trim());
      formattedContent = paragraphs.map((p, i) =>
        i === 0 ? `<p>${p.trim()}</p>` :
        /^\d+\.\s|^[A-Z][^.!?]*$/.test(p) && p.length < 100 ? `<h2>${p}</h2>` : `<p>${p}</p>`
      ).join('');
    }

    formattedContent = formattedContent.replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();
    if (!formattedContent.startsWith('<')) {
      formattedContent = `<p>${formattedContent}</p>`;
    }

    res.json({ success: true, content: formattedContent });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const blog = await Blog.findOne({ slug, isPublished: true });
    if (!blog) {
      return res.json({ success: false, message: "Blog not found" });
    }
    res.json({ success: true, blog });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export const subscribeEmail = async (req, res) => {
  try {
    const { email, company } = req.body;
    if (!email) return res.json({ success: false, message: "Email is required" });
    if (!company) return res.json({ success: false, message: "Company is required" });

    const existingEmail = await EmailModel.findOne({ email, company });
    if (existingEmail) {
      return res.json({ success: false, message: "Email already subscribed to this company" });
    }

    await EmailModel.create({ email, company });
    res.json({ success: true, msg: "Email subscribed successfully" });
  } catch (error) {
    console.error('Subscribe email error:', error);
    res.json({ success: false, message: error.message });
  }
};

export const unsubscribeEmail = async (req, res) => {
  try {
    const { email, company } = req.query;
    if (!email) return res.json({ success: false, message: "Email is required" });
    if (!company) return res.json({ success: false, message: "Company is required" });

    const result = await EmailModel.deleteOne({ email, company });
    if (result.deletedCount > 0) {
      res.json({ success: true, message: "Successfully unsubscribed" });
    } else {
      res.json({ success: false, message: "Email not found in our subscription list" });
    }
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.json({ success: false, message: error.message });
  }
};

export const request = async (req, resp) => {
  try {
    const { fullname, company, email, businessType } = req.body;
    if (!fullname || !company || !email || !businessType) {
      return resp.status(400).json({ success: false, message: "Some required fields are missing" });
    }
    const created = await Request.create({ fullname, company, email, businessType });
    return resp.status(200).json({ success: true, message: "Your request has been sent successfully", data: created });
  } catch (error) {
    console.error('Request handler error:', error);
    return resp.status(500).json({ success: false, message: error.message });
  }
};
