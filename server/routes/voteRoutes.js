const express = require("express");

const router = express.Router();

const auth =
require("../middleware/auth");

const Vote =
require("../models/Vote");

const Election =
require("../models/Election");

const User =
require("../models/User");

const AuditLog =
require("../models/AuditLog");

router.post(
  "/cast",
  auth,
  async (req,res) => {

    try {

      const {
        electionId,
        candidateName,
      } = req.body;

      const user =
      await User.findById(req.user.id);

      if(!user){

        return res.status(404).json({
          message:"User not found",
        });
      }

      // FRAUD DETECTION
      const recentVote =
      await Vote.findOne({

        userId:user._id,

        createdAt:{
          $gte:new Date(
            Date.now() - 5000
          ),
        },
      });

      if(recentVote){

        await AuditLog.create({

          userId:user._id,

          action:"FRAUD_ATTEMPT",

          details:
          "Rapid multiple voting attempt",

          ipAddress:req.ip,
        });

        return res.status(429).json({
          message:
          "Too many voting attempts",
        });
      }

      const election =
      await Election.findById(
        electionId
      );

      if(!election){

        return res.status(404).json({
          message:"Election not found",
        });
      }

      // PREVENT CROSS GROUP VOTING
      if(
        election.group !== user.group
      ){

        return res.status(403).json({
          message:"Unauthorized group",
        });
      }

      // CHECK ACTIVE
      if(!election.active){

        return res.status(400).json({
          message:"Election closed",
        });
      }

      // CHECK TIME
      if(
        new Date() > election.endTime
      ){

        election.active = false;

        await election.save();

        return res.status(400).json({
          message:"Election ended",
        });
      }

      // CHECK IF ALREADY VOTED
      const existingVote =
      await Vote.findOne({

        userId:user._id,

        electionId,
      });

      if(existingVote){

        return res.status(400).json({
          message:
          "You already voted",
        });
      }

      // SAVE VOTE
      await Vote.create({

        userId:user._id,

        electionId,

        candidateName,
      });

      // INCREMENT CANDIDATE VOTES
      const candidate =
      election.candidates.find(
        c => c.name === candidateName
      );

      if(candidate){

        candidate.votes += 1;
      }

      await election.save();

      // AUDIT LOG
      await AuditLog.create({

        userId:user._id,

        action:"VOTE_CAST",

        details:
        `${user.matricule}
        voted for
        ${candidateName}`,

        ipAddress:req.ip,
      });

      res.json({
        message:"Vote successful",
      });

    } catch (error) {

      console.log(
        "======= VOTE ERROR ======="
      );

      console.log(error);

      console.log(
        "=========================="
      );

      res.status(500).json({
        message:error.message,
      });

    }
  }
);

module.exports = router;