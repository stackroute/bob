const mongoose = require('mongoose')
    , Schema = mongoose.Schema;
let tasksSchema = new Schema({
  channelName : String,
  tasks : []
});
module.exports = mongoose.model('task', tasksSchema);
