const mongoose =
require("mongoose");

const auditLogSchema =
new mongoose.Schema({

  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
  },

  group:{
    type:String,
  },

  role:{
    type:String,
  },

  action:{
    type:String,
    required:true,
  },

  details:{
    type:String,
    required:true,
  },

  ipAddress:{
    type:String,
  },

},{
  timestamps:true,
});

module.exports =
mongoose.model(
  "AuditLog",
  auditLogSchema
);