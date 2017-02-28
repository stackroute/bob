const mongoose = require('mongoose')
    , Schema = mongoose.Schema;
    mongoose.connect('mongodb://localhost:27017/test');

    var db=mongoose.connection;
    db.on('error',console.error.bind(console,'connection error:'));
    db.once('open',function()
    {
    	console.log("db connected");
    });
var assert=require('assert');
var mocha=require('mocha');
var Chathistory=require('./../server/model/chathistory.schema.js');
describe("testing chathistory schema",function(){
	it("saving data",function(done){
 //this.timeout(10);
		var data;
		data=new Chathistory({
			channelname:"bob#general",
			msgs:[{
		sender: "joe",
		msg : "hai",
		TimeStamp: "ISD"

	}],
	//p_page:_15034556,
	//n_page: _123456
	});
	data.save().then(function(){
		assert(data.isNew===false);
		done();
	});

		
	});
});