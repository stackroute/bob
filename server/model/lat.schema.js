const mongoose = require('mongoose'),
    Schema = mongoose.Schema;
let latSchema = new Schema({
    username: String,
    lat: {}
});
module.exports = mongoose.model('lat', latSchema);
