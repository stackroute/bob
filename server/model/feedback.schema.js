const mongoose = require('mongoose')
    , Schema = mongoose.Schema;
let feedbackSchema = new Schema({
  name : String,
  comment : String
});
module.exports = mongoose.model('feedback', feedbackSchema);
