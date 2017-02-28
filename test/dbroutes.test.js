// var expect = require('chai').expect;
// var assert = require('chai').assert;
// var request = require("supertest");
// var DbRouter = require('./../server/routes/db.routes.js');
// var express = require('express')
// var router = express.Router()

// request = request(DbRouter);

// describe("testing for domain is present", function() {
//     it('uri is present', function(done) {
//         request
//             .get('/user/jothi/channels')
//             .expect(200)
//                 done();
//             });
    
// });
let mongoose = require("mongoose");
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('./../server/server');
let should = chai.should();
var Users = require('./../server/model/userinfo.schema.js');
chai.use(chaiHttp);

	
describe('/GET/:username UserInfo', () => {
	  it('it should GET information of the user by the username', (done) => {
	  	
	  		chai.request(server)
		    .get('/user/TheLord/channels' )
		 
		    .end((err, res) => {
		    	console.log(res.body);
			  	res.should.have.status(200);
			  	res.body.should.be.a('object');
			  	//res.body.should.have.property('username');
			  	//res.body.should.be.a('array');
			  	//res.body.should.have.property('channelList');
			  	//res.body.should.have.property('currentChannel');
			  	//res.body.should.have.property('username').eql(UserInfo.username);
		      done();
		    });
	  	});
			
	  });
  
