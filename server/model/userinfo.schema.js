const mongoose = require('mongoose')
    , Schema = mongoose.Schema;
let userSchema = new Schema({
  username : String,
  channelList : [String],
  currentChannel: String
});
module.exports = mongoose.model('UserInfo', userSchema);
