const mongoose = require('mongoose')
    , Schema = mongoose.Schema;
let userSchema = new Schema({
  channelName : String,
  members : [String],
  admin:String,
  requests:[String],
  type:String
});
module.exports = mongoose.model('channelinfo', userSchema);
