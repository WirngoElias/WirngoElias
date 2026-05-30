const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    electionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Election",
    },

    candidateName: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vote", voteSchema);