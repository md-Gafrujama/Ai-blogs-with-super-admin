import fs from 'fs';
import imagekit from '../config/imagekit.js';
import Blog from '../models/BlogModel.js';
import Comment from '../models/CommentModel.js';
import EmailModel from '../models/EmailModel.js';
import main from '../config/gemini.js';
import emailService from '../config/nodemailer.js';
import redis from '../config/redis.js'
import Request from '../models/requestModel.js';





function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Helper function to slugify the blog title
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^a-z0-9\-]/g, '')    // Remove all non-alphanumeric chars except -
    .replace(/\-+/g, '-')           // Replace multiple - with single -
    .replace(/^-+/, '')              // Trim - from start of text
    .replace(/-+$/, '');             // Trim - from end of text
}

export const addBlog = async (req, res) => {
  try {
    // If using FormData, fields are in req.body, file in req.file
    const { title, description, category, author, authorImg, isPublished, company } = req.body;
    const imageFile = req.file;

    if (!title || !description || !category || !author || !authorImg || !imageFile || !company) {
      return res.json({ success: false, message: "Missing required fields" });
    }

    const fileBuffer = fs.readFileSync(imageFile.path);

    // Upload Image to ImageKit
    const response = await imagekit.upload({
      file: fileBuffer,
      fileName: imageFile.originalname,
      folder: "/blogs"
    });

    // Clean up temp file
    fs.unlinkSync(imageFile.path);

    // optimization through imagekit URL transformation
    const optimizedImageUrl = imagekit.url({
      path: response.filePath,
      transformation: [
        { quality: 'auto' },
        { format: 'webp' },
        { width: '1280' }
      ]
    });

    const image = optimizedImageUrl;
    const slug = slugify(title);

    const created = await Blog.create({ title, description, category, author, authorImg, image, slug, company, isPublished: isPublished === 'true' });

    // Send newsletter only if the blog is published at creation time
    if (created.isPublished) {
      try {
        const companyPattern = new RegExp(`^${escapeRegex(created.company)}$`, 'i');
        const subscribers = await EmailModel.find({ company: companyPattern }).lean();
        const recipientEmails = subscribers.map(s => s.email).filter(Boolean);

        console.log('📰 Newsletter recipients (create):', recipientEmails.length, 'company:', created.company);
        console.log('📰 SMTP_USER configured:', !!process.env.SMTP_USER);
        console.log('📰 FROM_EMAIL configured:', !!process.env.FROM_EMAIL);
        
        if (recipientEmails.length > 0 && process.env.SMTP_USER) {
          const siteBaseUrl = process.env.SITE_BASE_URL || 'https://example.com';
          const blogUrl = `${siteBaseUrl}/blogs/${created.slug}`;

          // Send individual emails to each subscriber
          for (const email of recipientEmails) {
            try {
const msg = {
  to: email,
  from: process.env.FROM_EMAIL || 'no-reply@example.com',
  subject: `📰 New Blog Published: ${created ? created.title : blog.title}`,
  html: `
  <div style="max-width:600px; margin:0 auto; font-family: Arial, Helvetica, sans-serif; line-height:1.6; color:#333; background:#f9f9f9; padding:20px; border-radius:8px;">
    <!-- Header -->
    <div style="text-align:center; padding-bottom:20px; border-bottom:1px solid #ddd;">
      <h1 style="margin:0; font-size:24px; color:#222;">${created ? created.company : blog.company} Newsletter</h1>
    </div>

    <!-- Blog Content -->
    <div style="padding:20px 0;">
      <h2 style="font-size:20px; margin:0 0 12px; color:#444;">${created ? created.title : blog.title}</h2>
      <p style="margin:0 0 12px; font-size:15px; color:#555;">
        ${(created ? created.description : blog.description)?.slice(0, 200) || ''}...
      </p>

      <p style="margin:20px 0;">
        <a href="${blogUrl}" target="_blank" rel="noopener noreferrer" 
          style="background:#007BFF; color:#fff; padding:12px 20px; border-radius:5px; text-decoration:none; font-size:15px; display:inline-block;">
          👉 Read Full Blog
        </a>
      </p>
    </div>

    <!-- Divider -->
    <hr style="border:none; border-top:1px solid #ddd; margin:20px 0;"/>

    <!-- Footer -->
    <div style="text-align:center; font-size:12px; color:#888;">
      <p>You’re receiving this email because you subscribed to <strong>${created ? created.company : blog.company}</strong> updates.</p>
      <p>
        <a href="${siteBaseUrl}/unsubscribe?email=${encodeURIComponent(email)}" 
           style="color:#888; text-decoration:underline;">Unsubscribe</a>
      </p>
    </div>
  </div>
  `,
};


              // Try different possible method names for sending emails
              if (typeof emailService.sendMail === 'function') {
                await emailService.sendMail(msg);
              } else if (typeof emailService.send === 'function') {
                await emailService.send(msg);
              } else if (typeof emailService.sendMultiple === 'function') {
                // If only sendMultiple is available, use it but with individual emails
                await emailService.sendMultiple({...msg, to: [email]});
              } else {
                throw new Error('No valid email sending method found');
              }
              
              console.log(`Newsletter sent to ${email}`);
            } catch (mailErr) {
              console.error(`Failed to send to ${email}:`, mailErr.message);
            }
          }
          console.log('All newsletters sent successfully');
        }
      } catch (mailErr) {
        console.error('Newsletter send failed:', mailErr.code, mailErr.response?.body || mailErr.message);
      }
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
    const { blogId } = req.params;
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.json({ success: false, message: "Blog not found" });
    }
    res.json({ success: true, blog });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export const deleteBlogById = async (req, res) => {
  try {
    const { id } = req.body;
    await Blog.findByIdAndDelete(id);
    // Delete all comments associated with the blog
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

    // If just published, send newsletter
    if (!wasPublished && blog.isPublished) {
      try {
        const companyPattern = new RegExp(`^${escapeRegex(blog.company)}$`, 'i');
        const subscribers = await EmailModel.find({ company: companyPattern }).lean();
        const recipientEmails = subscribers.map(s => s.email).filter(Boolean);

        console.log('Newsletter recipients (toggle):', recipientEmails.length, 'company:', blog.company);
        if (recipientEmails.length > 0 && process.env.SMTP_USER) {
          const siteBaseUrl = process.env.SITE_BASE_URL || 'https://example.com';
          const blogUrl = `${siteBaseUrl}/blogs/${blog.slug}`;

          // Send individual emails to each subscriber
          for (const email of recipientEmails) {
            try {
              const msg = {
                to: email,
                from: process.env.FROM_EMAIL || 'no-reply@example.com',
                subject: `New blog: ${blog.title}`,
                html: `
                  <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2 style="margin: 0 0 12px;">${blog.title}</h2>
                    <p style="margin: 0 0 12px;">${blog.description?.slice(0, 180) || ''}...</p>
                    <p style="margin: 0 0 12px;">
                      <a href="${blogUrl}" target="_blank" rel="noopener noreferrer">Read the full post</a>
                    </p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;"/>
                    <p style="font-size: 12px; color: #666;">You received this because you subscribed to our newsletter.</p>
                    <p style="font-size: 12px; color: #666;">
                      <a href="${siteBaseUrl}/unsubscribe?email=${encodeURIComponent(email)}" style="color: #666;">Unsubscribe</a>
                    </p>
                  </div>
                `,
              };

              // Try different possible method names for sending emails
              if (typeof emailService.sendMail === 'function') {
                await emailService.sendMail(msg);
              } else if (typeof emailService.send === 'function') {
                await emailService.send(msg);
              } else if (typeof emailService.sendMultiple === 'function') {
                // If only sendMultiple is available, use it but with individual emails
                await emailService.sendMultiple({...msg, to: [email]});
              } else {
                throw new Error('No valid email sending method found');
              }
              
              console.log(`Newsletter sent to ${email}`);
            } catch (mailErr) {
              console.error(`Failed to send to ${email}:`, mailErr.message);
            }
          }
          console.log('All newsletters sent successfully');
        }
      } catch (mailErr) {
        console.error('Newsletter send failed on publish toggle:', mailErr.code, mailErr.response?.body || mailErr.message);
      }
    }
    res.json({ success: true, message: 'Blog status updated' });
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

    await redis.set("comments" , JSON.stringify(comments) , "EX",60);

    res.json({ success: true, comments });
    
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export const generateContent = async (req, res) => {
  try {
    const { prompt } = req.body;
    
    // Enhanced prompt to generate properly formatted blog content
    const enhancedPrompt = `Generate a comprehensive blog post about "${prompt}". 
    
    Please format the response as a well-structured blog with the following HTML structure:
    
    - Start with an engaging introduction paragraph
    - Include 3-4 main sections with clear headings (use <h2> tags)
    - Each section should have 2-3 paragraphs of content
    - Use <p> tags for paragraphs
    - Include bullet points where appropriate (use <ul> and <li> tags)
    - End with a conclusion paragraph
    - Make the content engaging, informative, and easy to read
    - Use proper HTML formatting with <h2>, <p>, <ul>, <li> tags
    - Keep paragraphs concise (2-4 sentences each)
    - Include practical tips or actionable advice where relevant
    
    The content should be professional yet conversational in tone.`;
    
    const rawContent = await main(enhancedPrompt);
    
    // Format the content into proper HTML structure
    let formattedContent = rawContent;
    
    // Clean up the content and ensure proper HTML structure
    formattedContent = formattedContent
      .replace(/```html\s*/g, '') // Remove ```html markers
      .replace(/```\s*/g, '') // Remove ``` markers
      .replace(/^\s*<html>\s*/i, '') // Remove <html> tags
      .replace(/<\/html>\s*$/i, '') // Remove </html> tags
      .replace(/^\s*<body>\s*/i, '') // Remove <body> tags
      .replace(/<\/body>\s*$/i, '') // Remove </body> tags
      .replace(/^\s*<head>.*?<\/head>\s*/is, '') // Remove <head> section
      .replace(/^\s*<!DOCTYPE.*?>\s*/i, '') // Remove DOCTYPE
      .trim();
    
    // Ensure proper HTML structure if the AI didn't format it correctly
    if (!formattedContent.includes('<h2>') && !formattedContent.includes('<p>')) {
      // Split content into paragraphs and format manually
      const paragraphs = rawContent.split('\n\n').filter(p => p.trim());
      
      formattedContent = '';
      
      // First paragraph as introduction
      if (paragraphs.length > 0) {
        formattedContent += `<p>${paragraphs[0].trim()}</p>`;
      }
      
      // Add section headings and content
      for (let i = 1; i < paragraphs.length; i++) {
        const paragraph = paragraphs[i].trim();
        if (paragraph.length > 0) {
          // If paragraph starts with a number or looks like a heading, make it h2
          if (/^\d+\.\s|^[A-Z][^.!?]*$/.test(paragraph) && paragraph.length < 100) {
            formattedContent += `<h2>${paragraph}</h2>`;
          } else {
            formattedContent += `<p>${paragraph}</p>`;
          }
        }
      }
    }
    
    // Final cleanup - remove extra whitespace and normalize
    formattedContent = formattedContent
      .replace(/\n\s*\n/g, '') // Remove extra line breaks
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/>\s+</g, '><') // Remove whitespace between tags
      .trim();
    
    // Ensure we have valid HTML structure
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
    const blog = await Blog.findOne({ slug, isPublished: true }); // Only return published blogs
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
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);

    let { email, company } = req.body;

    if (!email) {
      return res.json({ success: false, message: "Email is required" });
    }

    if (!company) {
      return res.json({ success: false, message: "Company is required" });
    }

    // Check if email already exists for that company
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
    const { email } = req.query;
    
    if (!email) {
      return res.json({ success: false, message: "Email is required" });
    }
    
    const result = await EmailModel.deleteOne({ email });
    
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
}
