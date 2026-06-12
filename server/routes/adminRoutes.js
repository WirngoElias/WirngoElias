const multer =
require("multer");

const path =
require("path");
const express = require("express");

const router = express.Router();

const auth =
require("../middleware/auth");

const adminAuth =
require("../middleware/adminauth");

const superAdminAuth =
require("../middleware/superAdminAuth");

const bcrypt = require("bcryptjs");

const Election =
require("../models/Election");

const User =
require("../models/User");

const Vote =
require("../models/Vote");

const AuditLog =
require("../models/Auditlog");

const storage =
multer.diskStorage({

  destination:
  function(req,file,cb){

    cb(null,"uploads/");
  },

  filename:
  function(req,file,cb){

    cb(
      null,

      Date.now() +
      path.extname(file.originalname)
    );
  },
});

const upload =
multer({ storage });
// ====================================
// CREATE SUB-ADMIN
// ====================================

router.post(
  "/create-sub-admin",
  auth,
  superAdminAuth,
  async (req, res) => {
    try {
      const { fullName, matricule, email, password, group } = req.body;

      if (!fullName || !matricule || !email || !password || !group) {
        return res.status(400).json({
          message: "All fields are required",
        });
      }

      const existing = await User.findOne({
        $or: [{ email }, { matricule }],
      });

      if (existing) {
        return res.status(400).json({
          message: "Sub-admin already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const admin = await User.create({
        fullName,
        matricule,
        email,
        password: hashedPassword,
        dob: new Date("2000-01-01"),
        group,
        role: "admin",
      });

      await AuditLog.create({
        userId: req.user.id,
        group: req.user.group,
        role: req.user.role,
        action: "CREATE_SUB_ADMIN",
        details: `${req.user.matricule || "SUPERADMIN"} created admin for ${group}`,
        ipAddress: req.ip,
      });

      res.status(201).json({
        message: "Sub-admin created successfully",
        admin,
      });
    } catch (error) {
      console.log("CREATE SUB-ADMIN ERROR:");
      console.log(error);
      res.status(500).json({
        message: error.message,
      });
    }
  }
);

// ====================================
// CREATE ELECTION
// ====================================

router.post(
  "/create-election",
  auth,
  adminAuth,
  upload.fields([
    {
      name:"candidatePhotos",
      maxCount:20,
    },
    {
      name:"candidateVideos",
      maxCount:20,
    },
  ]),
  async (req,res) => {

    try {

      const title = req.body.title;
      const requestedGroup = req.body.group;
      const duration = req.body.duration;

      const group =
        req.user.role === "superadmin"
          ? requestedGroup
          : req.user.group;

      if (!group) {
        return res.status(400).json({
          message: "Group is required for this election",
        });
      }

      let candidates = JSON.parse(req.body.candidates);
      const photos = req.files.candidatePhotos || [];
      const videos = req.files.candidateVideos || [];

      candidates = candidates.map((candidate, index) => ({
        ...candidate,
        photo: photos[index] ? `/uploads/${photos[index].filename}` : null,
        video: videos[index] ? `/uploads/${videos[index].filename}` : null,
      }));

      // VALIDATE DURATION
     const parsedDuration =
      Number(duration);

      if(
        isNaN(parsedDuration) ||
        parsedDuration <= 0
      ){

        return res.status(400).json({
          message:
          "Duration must be a positive number",
        });
      }

      // CREATE TIMES
      const startTime =
      new Date();

      const endTime =
      new Date(

        startTime.getTime() +

        parsedDuration *
        60 *
        60 *
        1000
      );

      // CREATE ELECTION
      const election =
      await Election.create({

        title,

        group,

        candidates,

        startTime,

        endTime,

        active:true,
      });

      await AuditLog.create({
        userId: req.user.id,
        group,
        role: req.user.role,
        action: "CREATE_ELECTION",
        details: `${req.user.matricule || req.user.email} created election ${title} for ${group}`,
        ipAddress: req.ip,
      });

      res.status(201).json({

        message:
        "Election created successfully",

        election,
      });

    } catch (error) {

      console.log(
        "CREATE ELECTION ERROR:"
      );

      console.log(error);

      res.status(500).json({
        message:error.message,
      });

    }
  }
);


// ====================================
// DASHBOARD STATS
// ====================================

router.get(
  "/stats",
  auth,
  adminAuth,
  async (req,res) => {

    try {

      const allGroups = [
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

      const groups =
        req.user.role === "superadmin"
          ? allGroups
          : [req.user.group];

      const stats = [];

      // GET ALL VOTES ONCE
      const allVotes =
      await Vote.find();

      for(const group of groups){

        // TOTAL USERS
        const registered =
        await User.countDocuments({
          group,
        });

        // USERS IN GROUP
        const usersInGroup =
        await User.find({
          group,
        });

        const userIds =
        usersInGroup.map(
          user => user._id.toString()
        );

        // UNIQUE USERS WHO VOTED
        const votedUserIds =
        new Set();

        allVotes.forEach((vote) => {

          if(

            vote.userId &&

            userIds.includes(
              vote.userId.toString()
            )

          ){

            votedUserIds.add(
              vote.userId.toString()
            );
          }
        });

        const voted =
        votedUserIds.size;

        const notVoted =
        registered - voted;

        const turnout =

          registered > 0

          ? (

              (
                voted /
                registered
              ) * 100

            ).toFixed(1)

          : 0;

        stats.push({

          group,

          registered,

          voted,

          notVoted,

          turnout,
        });
      }

      // TOTAL ELECTIONS
      const elections =
        req.user.role === "superadmin"
          ? await Election.find()
          : await Election.find({ group: req.user.group });

      // TOTAL VOTES
      const totalVotes =
        req.user.role === "superadmin"
          ? await Vote.countDocuments()
          : await Vote.countDocuments({
              electionId: {
                $in: elections.map((e) => e._id),
              },
            });

      res.json({

        stats,

        elections,

        totalVotes,
      });

    } catch (error) {

      console.log(
        "STATS ERROR:"
      );

      console.log(error);

      res.status(500).json({
        message:error.message,
      });

    }
  }
);
router.get(
  "/analytics",
  async (req,res) => {

    try {

      const allGroups = [
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

      const groups =
        req.user.role === "superadmin"
          ? allGroups
          : [req.user.group];

      const analytics = [];

      for(const group of groups){

        // =====================
        // TOTAL REGISTERED
        // =====================

        const registered = await User.countDocuments({
          group,
          role:"student",
        });

        // =====================
        // GROUP ELECTIONS
        // =====================

        const elections =
        await Election.find({
          group,
        }).select("_id");

        const electionIds =
        elections.map(
          e => e._id
        );

        // =====================
        // UNIQUE VOTERS
        // =====================

        const votedUsers =
        await Vote.distinct(
          "userId",
          {
            electionId:{
              $in:electionIds,
            },
          }
        );

        const voted =
        votedUsers.length;

        // =====================
        // NOT VOTED
        // =====================

        const notVoted =
        registered - voted;

        // =====================
        // PARTICIPATION
        // =====================

        const participation =
        registered > 0

        ? (
            (voted / registered)
            * 100
          ).toFixed(1)

        : 0;

        analytics.push({

          group,

          registered,

          voted,

          notVoted,

          participation,

        });
      }

      res.json(analytics);

    } catch(error){

      console.log(error);

      res.status(500).json({
        message:error.message,
      });
    }
  }
);
// ====================================
// AUDIT LOGS
// ====================================

router.get(
  "/audit-logs",
  auth,
  adminAuth,
  async (req,res) => {

    try {

      const page =
      parseInt(req.query.page) || 1;

      const limit =
      parseInt(req.query.limit) || 10;

      const skip =
      (page - 1) * limit;

      const search =
      req.query.search || "";

      const action =
      req.query.action || "";

      let query = {};

      // FILTER ACTION
      if(

        action &&

        action !== "ALL"

      ){

        query.action = action;
      }

      // LIMIT ADMIN TO OWN GROUP LOGS
      if(req.user.role === "admin"){
        query.group = req.user.group;
      }

      // FETCH LOGS
      const logs =
      await AuditLog.find(query)

      .populate(
        "userId",
        "matricule group"
      )

      .sort({
        createdAt:-1,
      })

      .skip(skip)

      .limit(limit);

      // SEARCH FILTER
      const filteredLogs =
      logs.filter((log) => {

        if(!search){

          return true;
        }

        return (

          log.userId &&

          log.userId.matricule

          .toLowerCase()

          .includes(
            search.toLowerCase()
          )
        );
      });

      // TOTAL COUNT
      const total =
      await AuditLog.countDocuments(
        query
      );

      res.json({

        logs:filteredLogs,

        currentPage:page,

        totalPages:
        Math.ceil(
          total / limit
        ),

      });

    } catch (error) {

      console.log(
        "AUDIT LOG ERROR:"
      );

      console.log(error);

      res.status(500).json({
        message:error.message,
      });

    }
  }
);

module.exports = router;