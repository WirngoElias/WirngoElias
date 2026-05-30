const express = require("express");

const bcrypt = require("bcryptjs");

const User = require("../models/User");

const router = express.Router();

router.get("/create-admin", async (req,res) => {

  try {

    const existingAdmin =
    await User.findOne({
      matricule:"ADMIN001",
    });

    if(existingAdmin){

      return res.json({
        message:"Admin already exists",
      });
    }

    const hashedPassword =
    await bcrypt.hash("admin123",10);

    const admin =
    await User.create({

      fullName:"System Admin",

      matricule:"ADMIN001",

      email:"admin@votesecure.com",

      password:hashedPassword,

      dob:new Date("2000-01-01"),

      group:"NAHPI",

      role:"admin",
    });

    res.json({
      message:"Admin created successfully",
      admin,
    });

  } catch (error) {

    res.status(500).json({
      message:error.message,
    });
  }
});

module.exports = router;