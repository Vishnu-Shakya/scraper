// models/Topic.js
const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true, // Automatically generate an ObjectId
  },
  timestamp: {
    type: Date,
    default: Date.now, // Automatically set the timestamp when the document is created
  },
  nameoftrend1: {
    type: String,
    required: true,
  },
  nameoftrend2: {
    type: String,
    required: true,
  },
  nameoftrend3: {
    type: String,
    required: true,
  },
  nameoftrend4: {
    type: String,
    required: true,
  },
  nameoftrend5: {
    type: String,
    required: true,
  },
  ip:{
    type:String,
    required:true
  }
});

const Topic = mongoose.model('Topic', topicSchema);

module.exports = Topic;