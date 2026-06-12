const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const sendEmail =
require("../utils/sendEmail");

const auth =
require("../middleware/auth");

const AuditLog = require("../models/Auditlog");

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
    // Format: UBa[YY][XX][NNN]
    // UBa = prefix, YY = year (21+), XX = school code, NNN = 3 digits
    const schoolCodes = {
      "NAHPI": "NA",
      "COLTECH": "CO",
      "HITL": "HI",
      "HICM": "HI",
      "HTTC": "HT",
      "HTTTC": "HT",
      "FED": "FE",
      "FS": "FS",
      "FHS": "FH",
      "FLPS": "FL",
      "FA": "FA",
      "FEMS": "FE",
    };

    // Check prefix
    if (!matricule.startsWith("UBa")) {
      return res.status(400).json({
        message: "Matricule must start with 'UBa'",
      });
    }

    // Check total length (should be 10: UBa + 2 digits + 2 letters + 3 digits)
    if (matricule.length !== 10) {
      return res.status(400).json({
        message: "Matricule must be exactly 10 characters (UBa + 2-digit year + 2-letter school code + 3 digits)",
      });
    }

    const remaining = matricule.slice(3); // Remove 'UBa'

    // Extract and validate year
    const yearStr = remaining.slice(0, 2);
    const year = parseInt(yearStr);

    if (isNaN(year)) {
      return res.status(400).json({
        message: "Year must be numeric (e.g., 21 for 2021)",
      });
    }

    if (year < 21) {
      return res.status(400).json({
        message: "Year of entry must be 21 or later (2021+). Lower years are not accepted.",
      });
    }

    // Extract and validate school code
    const schoolCode = remaining.slice(2, 4);
    const expectedCode = schoolCodes[group];

    if (!expectedCode) {
      return res.status(400).json({
        message: "Invalid school/faculty",
      });
    }

    if (schoolCode !== expectedCode) {
      return res.status(400).json({
        message: `School code '${schoolCode}' does not match selected school/faculty. Expected '${expectedCode}' for ${group}`,
      });
    }

    // Extract and validate numbers
    const numbersStr = remaining.slice(4, 7);
    const numbers = parseInt(numbersStr);

    if (isNaN(numbers) || numbersStr.length !== 3) {
      return res.status(400).json({
        message: "Last 3 characters must be digits (000-999)",
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

    const ipAddress = req.ip;

    const user = await User.findOne({ matricule });

    // If user not found, log attempt by IP and detect rapid failures
    if (!user) {
      await AuditLog.create({
        group: null,
        role: null,
        action: "LOGIN_ATTEMPT",
        details: `Failed login attempt for ${matricule}`,
        ipAddress,
      });

      const windowMs = 2 * 60 * 1000; // 2 minutes
      const threshold = 6;

      const recent = await AuditLog.countDocuments({
        ipAddress,
        action: "LOGIN_ATTEMPT",
        createdAt: { $gte: new Date(Date.now() - windowMs) },
      });

      if (recent >= threshold) {
        await AuditLog.create({
          group: null,
          role: null,
          action: "FRAUD_ATTEMPT",
          details: `Multiple failed login attempts for ${matricule} from ${ipAddress}`,
          ipAddress,
        });
      }

      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // Check for account lock
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(403).json({
        message: `Account locked until ${new Date(user.lockUntil).toISOString()}`,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      // increment failed attempts
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

      const lockThreshold = 6; // attempts
      const lockDurationMs = 15 * 60 * 1000; // 15 minutes

      if (user.failedLoginAttempts >= lockThreshold) {
        user.lockUntil = new Date(Date.now() + lockDurationMs);
        await AuditLog.create({
          userId: user._id,
          group: user.group,
          role: user.role,
          action: "FRAUD_ATTEMPT",
          details: `Account locked due to multiple failed logins for ${user.matricule}`,
          ipAddress,
        });
      }

      await user.save();

      await AuditLog.create({
        userId: user._id,
        group: user.group,
        role: user.role,
        action: "LOGIN_ATTEMPT",
        details: `Failed login for ${user.matricule}: invalid password`,
        ipAddress,
      });

      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // Successful login - reset counters and log success
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    await AuditLog.create({
      userId: user._id,
      group: user.group,
      role: user.role,
      action: "LOGIN_SUCCESS",
      details: `Successful login for ${user.matricule}`,
      ipAddress,
    });

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