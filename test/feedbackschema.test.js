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
var feedback=require('./../server/model/feedback.schema.js');
describe("testing chathistory schema",function(){
	it("saving data",function(done){
 //this.timeout(10);
		var data;
		data=new feedback({
			name:"ramya",
			comment:"user-friendly"
	});
	data.save().then(function(){
		assert(data.isNew===false);
		done();
	});

		
	});
});