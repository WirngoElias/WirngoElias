const express = require("express");

const router = express.Router();

const auth =
require("../middleware/auth");

const Election =
require("../models/Election");

const User =
require("../models/User");
const Vote =
require("../models/Vote");

router.get(
  "/my-elections",
  auth,
  async (req,res) => {

    try {

      const user =
      await User.findById(
        req.user.id
      );

      // GET ELECTIONS
      const elections =
      await Election.find({
        group:user.group
      });

      // ADD VOTED STATUS
      const electionsWithVoteStatus =
      await Promise.all(

        elections.map(
          async (election) => {

            const existingVote =
            await Vote.findOne({

              electionId:
              election._id,

              userId:
              req.user.id,

            });

            const now = new Date();
            const isActive =
              now >= election.startTime &&
              now <= election.endTime;

            if (election.active !== isActive) {
              election.active = isActive;
              await election.save().catch(() => {});
            }

            return {

              ...election.toObject(),

              active: isActive,

              hasVoted:
              !!existingVote,

            };
          }
        )
      );

      res.json(
        electionsWithVoteStatus
      );

    } catch(error){

      console.log(error);

      res.status(500).json({
        message:error.message
      });

    }
  }
);

// GET ALL ELECTIONS ACROSS ALL GROUPS
router.get(
  "/all",
  auth,
  async (req,res) => {
    try {
      const elections = await Election.find().sort({ startTime: -1 });

      const electionsWithStatus = elections.map((election) => {
        const now = new Date();
        const isActive =
          now >= election.startTime &&
          now <= election.endTime;

        if (election.active !== isActive) {
          election.active = isActive;
          election.save().catch(() => {});
        }

        return {
          ...election.toObject(),
          active: isActive,
        };
      });

      res.json(electionsWithStatus);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message:error.message,
      });
    }
  }
);
// GET RESULTS
router.get(
  "/results",
  auth,
  async (req,res) => {

    try {

      const user =
      await User.findById(
        req.user.id
      );

      let elections = [];

      if (user.role === "superadmin") {
        elections = await Election.find().sort({ startTime: -1 });
      } else if (user.role === "admin") {
        elections = await Election.find({
          group: user.group,
        }).sort({ startTime: -1 });
      } else {
        elections = await Election.find({
          group: user.group,
        }).sort({ startTime: -1 });
      }

      const formattedResults =
      elections.map((election) => {

        const now = new Date();
        const isActive =
          now >= election.startTime &&
          now <= election.endTime;

        if (election.active !== isActive) {
          election.active = isActive;
          election.save().catch(() => {});
        }

        const totalVotes =
        election.candidates.reduce(
          (sum,candidate) =>
            sum + candidate.votes,
          0
        );

        const candidates =
        election.candidates.map(
          (candidate) => ({

            name:candidate.name,

            votes:candidate.votes,

            speech:
            candidate.speech,

            percentage:
            totalVotes > 0
            ? (
                candidate.votes /
                totalVotes
              ) * 100
            : 0,
          })
        );

        // =========================
        // DETERMINE LEADER/WINNER/TIE
        // =========================

        let statusText =
        "No votes yet";

        if(candidates.length > 0){

          const sorted =
          [...candidates].sort(
            (a,b) =>
              b.votes - a.votes
          );

          const highestVotes =
          sorted[0].votes;

          // ALL CANDIDATES WITH HIGHEST VOTES
          const leaders =
          sorted.filter(
            candidate =>
              candidate.votes === highestVotes
          );

          // NO VOTES YET
          if(highestVotes === 0){

            statusText =
            "Tie";

          }

          // ACTIVE ELECTION
          else if(isActive){

            if(leaders.length > 1){

              statusText =
              "Tie";

            } else {

              statusText =
              `${leaders[0].name} is leading`;

            }

          }

          // CLOSED ELECTION
          else{

            if(leaders.length > 1){

              statusText =
              "Tie";

            } else {

              statusText =
              `Winner: ${leaders[0].name}`;

            }
          }
        }

        return {

          _id:election._id,

          title:election.title,

          group:election.group,

          active:isActive,

          startTime:
          election.startTime,

          endTime:
          election.endTime,

          totalVotes,

          statusText,

          candidates,
        };
      });

      res.json(formattedResults);

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message:error.message,
      });

    }
  }
);
module.exports = router;