const mongoose = require("mongoose"),
	  Schema=mongoose.Schema;
var chathistorySchema = new Schema({

	channelname:String,
	msgs:[{
		sender: String,
		msg : String,
		TimeStamp: String

	}],
	p_page: Schema.Types.ObjectId,
	n_page: Schema.Types.ObjectId
});
var ChatHistory = mongoose.model('ChatHistory', chathistorySchema);
module.exports = ChatHistory;



