const mongoose = require("mongoose"),
	  Schema=mongoose.Schema;

    var subbookSchema=mongoose.Schema(
{
   channelid:String,
   sender:String,
   timestamp:String,
   msg:String
});
var bookmarkSchema=new Schema({
    userName:String,
    bookmark:[subbookSchema]
});


var bookmarkHistory=mongoose.model("Bookmarks",bookmarkSchema);
module.exports=bookmarkHistory;
