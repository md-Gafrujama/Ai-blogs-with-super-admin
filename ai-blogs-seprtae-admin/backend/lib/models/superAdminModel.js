// import mongoose from "mongoose";

// const SuperAdminSchema = new mongoose.Schema(
//   {
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true }, 
//   },
//   { timestamps: true }
// );

// export default mongoose.model("SuperAdmin", SuperAdminSchema);
import mongoose from "mongoose";

const SuperAdminSchema = new mongoose.Schema(
  {
    email: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: { 
      type: String, 
      required: true,
      minlength: 6
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

// Don't return password in JSON responses
SuperAdminSchema.methods.toJSON = function() {
  const superAdmin = this.toObject();
  delete superAdmin.password;
  return superAdmin;
};

// Pre-save middleware to hash password (uncomment if using bcrypt)
// SuperAdminSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
//   const bcrypt = await import('bcrypt');
//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });

// Instance method to compare passwords (uncomment if using bcrypt)
// SuperAdminSchema.methods.comparePassword = async function(candidatePassword) {
//   const bcrypt = await import('bcrypt');
//   return bcrypt.compare(candidatePassword, this.password);
// };

const SuperAdmin = mongoose.model("SuperAdmin", SuperAdminSchema);

export default SuperAdmin;