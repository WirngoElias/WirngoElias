const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const sendEmail =
require("../utils/sendEmail");

const auth =
require("../middleware/auth");

const router = express.Router();

const validGroups = [
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
];

router.post("/register", async (req, res) => {
  try {
    const {
      fullName,
      matricule,
      email,
      password,
      dob,
      group,
    } = req.body;

    // AGE CHECK
    const birthDate = new Date(dob);

    const ageDifMs = Date.now() - birthDate.getTime();

    const ageDate = new Date(ageDifMs);

    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    if (age < 18) {
      return res.status(400).json({
        message: "You must be at least 18 years old",
      });
    }

    // GROUP VALIDATION
    if (!validGroups.includes(group)) {
      return res.status(400).json({
        message: "Invalid school/faculty",
      });
    }

    // MATRICULE VALIDATION
    if (!matricule.startsWith("UBa")) {
      return res.status(400).json({
        message: "Invalid matricule format",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { matricule }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      matricule,
      email,
      password: hashedPassword,
      dob,
      group,
    });

    res.status(201).json({
      message: "Registration successful",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { matricule, password } = req.body;

    const user = await User.findOne({ matricule });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        group: user.group,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.json({
      token,
      group: user.group,
      role: user.role,
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
router.post(
  "/forgot-password",

  async (req,res) => {

    try {

      const {
        matricule,
        email,
      } = req.body;

      const user =
      await User.findOne({
        matricule,
        email,
      });

      if(!user){

        return res.status(404).json({
          message:"User not found",
        });
      }

      const otp =
      Math.floor(
        100000 +
        Math.random() * 900000
      ).toString();

      user.resetOTP = otp;

      user.otpExpires =
      Date.now() +
      10 * 60 * 1000;

      await user.save();

      await sendEmail(

        email,

        "VoteSecure Password Reset OTP",

        `Your OTP is ${otp}`

      );

      res.json({
        message:
        "OTP sent to email",
      });

    } catch(error){

      console.log(error);

      res.status(500).json({
        message:"Server error",
      });

    }
  }
);
router.post(
  "/reset-password",

  async (req,res) => {

    try {

      const {
        email,
        otp,
        newPassword,
      } = req.body;

      const user =
      await User.findOne({
        email,
      });

      if(!user){

        return res.status(404).json({
          message:"User not found",
        });
      }

      if(

        user.resetOTP !== otp ||

        user.otpExpires <
        Date.now()

      ){

        return res.status(400).json({
          message:"Invalid or expired OTP",
        });
      }

      const bcrypt =
      require("bcryptjs");

      const salt =
      await bcrypt.genSalt(10);

      user.password =
      await bcrypt.hash(
        newPassword,
        salt
      );

      user.resetOTP = "";
      user.otpExpires = null;

      await user.save();

      res.json({
        message:
        "Password reset successful",
      });

    } catch(error){

      console.log(error);

      res.status(500).json({
        message:"Server error",
      });

    }
  }
);
router.get(
  "/profile",
  auth,
  async (req,res) => {

    try {

      const user =
      await User.findById(
        req.user.id
      ).select("fullName group role")

      if(!user){

        return res.status(404).json({
          message:"User not found",
        });
      }

      res.json(user);

    } catch(error){

      res.status(500).json({
        message:error.message,
      });
    }
  }
);
module.exports = router;