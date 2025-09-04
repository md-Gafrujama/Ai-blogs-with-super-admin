// import mongoose  from "mongoose";

// const adminSchema = new mongoose.Schema({

//     company: {
//         type:String,
//         required:true
//     },
//     email: {

//         type: String,
//         required:true
//     },
//     password:{
//         type:String,
//         required:true
//     }
// }, {timestamps:true});

// export default mongoose.model("Admin" , adminSchema);


import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
    trim: true,
    index: true // Add index for better query performance
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensure email uniqueness
    trim: true,
    lowercase: true, // Store emails in lowercase
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6 // Minimum password length
  },
  isActive: {
    type: Boolean,
    default: true // Track if admin account is active
  },
  lastLogin: {
    type: Date,
    default: null // Track last login time
  }
}, { 
  timestamps: true 
});

// Create compound index for company + email combination
adminSchema.index({ company: 1, email: 1 });

// Pre-save middleware to hash password (if you're using bcrypt)
// adminSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
//   const bcrypt = await import('bcrypt');
//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });

// Instance method to compare passwords
// adminSchema.methods.comparePassword = async function(candidatePassword) {
//   const bcrypt = await import('bcrypt');
//   return bcrypt.compare(candidatePassword, this.password);
// };

// Don't return password in JSON responses
adminSchema.methods.toJSON = function() {
  const admin = this.toObject();
  delete admin.password;
  return admin;
};

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;