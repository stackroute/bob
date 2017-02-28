const mongoose = require('mongoose')
    , Schema = mongoose.Schema;
let githubaccesstokenSchema = new Schema({
  username : String,
  token : String
});
module.exports = mongoose.model('githubatoken', githubaccesstokenSchema);
