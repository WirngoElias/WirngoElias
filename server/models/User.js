const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },

    matricule: {
      type: String,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    dob: {
      type: Date,
      required: true,
    },

    group: {
      type: String,
      required: true,
      enum: [
        "NAHPI",
        "COLTECH",
        "HITL",
        "HICM",
        "HTTC",
        "HTTTC",
        "FED",
        "FS",
        "FHS",
        "FLPS",
        "FA",
        "FEMS",
      ],
    },

    hasVoted: {
      type: Boolean,
      default: false,
    },

    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
    resetOTP:{
  type:String,
  default:"",
},

otpExpires:{
  type:Date,
},
  },
  { timestamps: true }
  
);


module.exports = mongoose.model("User", userSchema);