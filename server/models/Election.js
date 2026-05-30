const mongoose = require("mongoose");

const candidateSchema =
new mongoose.Schema({

  name:{
    type:String,
    required:true,
  },

  speech:{
    type:String,
    default:"",
  },

  photo:{
    type:String,
    default:"",
  },

  video:{
    type:String,
    default:"",
  },

  votes:{
    type:Number,
    default:0,
  },

});

const electionSchema =
new mongoose.Schema({

  title:{
    type:String,
    required:true,
  },

  group:{
    type:String,
    required:true,
  },

  candidates:[candidateSchema],

  startTime:{
    type:Date,
    required:true,
  },

  endTime:{
    type:Date,
    required:true,
  },

  active:{
    type:Boolean,
    default:true,
  },

});

module.exports =
mongoose.model(
  "Election",
  electionSchema
);