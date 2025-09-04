// import express from 'express';
// import cors from 'cors';
// import blogRouter from './lib/routes/blogRoute.js';
// import adminRouter from './lib/routes/adminRoute.js';
// import emailRouter from './lib/routes/emailRoute.js';
// import superAdminRouter from './lib/routes/superAdminroutes.js';  // ✅ Import super admin routes
// import { ConnectDB } from './lib/config/db.js';
// // import redis from './lib/config/redis.js';
// import 'dotenv/config';

// ConnectDB();

// const app = express();

// // redis.on("connect" , ()=>{
// //   console.log("redis connected successfully");
// // })

// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));


// app.use('/api/blog', blogRouter);
// app.use('/api/admin', adminRouter);
// app.use('/api/email', emailRouter);
// app.use('/api/super-admin', superAdminRouter);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });


import express from 'express';
import cors from 'cors';
import blogRouter from './lib/routes/blogRoute.js';
import adminRouter from './lib/routes/adminRoute.js';
import emailRouter from './lib/routes/emailRoute.js';
import superAdminRouter from './lib/routes/superAdminroutes.js';
import { ConnectDB } from './lib/config/db.js';
import 'dotenv/config';

// Initialize database connection
ConnectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/blog', blogRouter);
app.use('/api/admin', adminRouter);
app.use('/api/email', emailRouter);
app.use('/api/super-admin', superAdminRouter);

// Add a health check route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Export the app as a serverless function
export default app;