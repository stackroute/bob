const mongoose = require("mongoose")
	  , Schema=mongoose.Schema;
var gitChannelSchema = new Schema({
	userName:String,
	message:[{
		author_name: String,
		repo_name: String,
		message:String,
		timestamp: String,
		url:String

	}]
});
module.exports = mongoose.model('GitChannel', gitChannelSchema);
