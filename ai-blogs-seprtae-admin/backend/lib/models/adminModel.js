import mongoose  from "mongoose";

const adminSchema = new mongoose.Schema({

    company: {
        type:String,
        required:true
    },
    email: {

        type: String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
}, {timestamps:true});

export default mongoose.model("Admin" , adminSchema);