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
var UserInfo=require('./../server/model/userinfo.schema.js');
describe("testing userinfo schema",function(){
	it("saving data",function(done){
 //this.timeout(10);
		var data;
		data=new UserInfo({
			username:"jinju",
		currentChannel:"bob#general",
		channelList:[{"bob#general"},{"bob#dev"}]
	});
	data.save().then(function(){
		assert(data.isNew===false);
		done();
	});

		
	});
});