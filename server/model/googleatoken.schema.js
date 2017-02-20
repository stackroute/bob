const mongoose = require('mongoose')
    , Schema = mongoose.Schema;
let googleaccesstokenSchema = new Schema({
  username : String,
  token : {}
});
module.exports = mongoose.model('googleatoken', googleaccesstokenSchema);
