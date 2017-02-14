const mongoose = require('mongoose')
    , Schema = mongoose.Schema;
let userSchema = new Schema({
  username : String,
  channelList : [String]
});
module.exports = mongoose.model('userinfo', userSchema);
