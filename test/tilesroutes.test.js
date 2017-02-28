// var expect = require('chai').expect;
// var assert = require('chai').assert;
// var request = require("supertest");
// var TilesRouter = require('./../server/routes/tiles.routes.js');
// var express = require('express')
// var router = express.Router()
// request = request(TilesRouter);

// describe("testing for domain is present", function() {
//     it('uri is present', function(done) {
//         request
//             .get('/user/jothi/Tiles')
//             .expect(200)
//                 done();
//             });
//     it('uri is present', function(done) {
//         request
//             .get('/user/jothi/Tiles.120A/hai')
//             .expect(200)
//                 done();
//             });
//     it('uri is present', function(done) {
//         request
//             .get('/user/jothi/Layout')
//             .expect(200)
//                 done();
//             });

// });
// describe("testing for domain is not present", function() {
//     it('uri is not present', function(done) {
//         request
//             .get('/user/jothi/Tiles/important/starred')
//             .expect(404)
//             done();
//             });
// });



// describe("post testing",function(){
//     var name= "jothi"
//     function(res) {
//   res.body.should.have.property("username", "jothi");


// it("should create a new user", function() {
//   request
//     .post("/user/jothi/Layout")
//     .send({ name: "jothi"})
//     .expect(Layout)
//     done();
// });


       
//     //});

// describe("Deletion", function() {
//     it('deleting the url', function(done) {
//         request
//             .delete('/user/Jothi/Tiles/important/5')
//             .end(function(err, result) {
                
//             });
//             done();
//     });

//     it('deletion done ',function(done){
//         done();
//     });
// });
let mongoose = require("mongoose");
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('./../server/server');
let should = chai.should();
//var Users = require('./../server/model/userinfo.schema.js');
var Tiles= require('./../server/model/tile.schema.js');
chai.use(chaiHttp);

// describe('/PUT/:tileid Tiles', () => {
//       it('it should UPDATE a Tiles given the tileid', (done) => {
//         let Tiles = new Tile({channels : ["bob#genral"],
//                                 colors: {channel:"#ffffc00",project:"#02b875",tag:"#123ee"},
//                                         tags: ["#123ee"],
//                                 lastCleared: "a min ago"})
//         Tiles.save((err, Tiles) => {
//                 chai.request(server)
//                 .put('/Tiles/' + Tiles.tileid)
//                 .send({channels : ["bob#genral"],
//                         colors: {
//                                 channel:"#ffffc00",
//                                 project:"#02b875",
//                                 tag:"#123ee"
//                                 },
//                         tags: ["#123ee"],
//                         lastCleared: "a sec ago"})
//                 .end((err, res) => {
//                     res.should.have.status(200);
//                     res.body.should.be.a('object');
//                     res.body.should.have.property('message').eql('Tiles updated!');
//                     done();
//                 });
//           });
//       });
//   });

describe('/DELETE/:tileid Tiles', () => {
      it('it should DELETE a Tiles given the tileid', (done) => {
        
        
                chai.request(server)
                .delete('/user/qwert/Tiles/58afb16f0d18c51634b563dc')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('Tiles successfully deleted!');
                    res.body.result.should.have.property('ok').eql(1);
                    res.body.result.should.have.property('n').eql(1);
                  done();
                });
          });
      });
 

// describe('/POST Tiles', () => {
//       it('it should not POST a Tile without tags', (done) => {
//         let Tiles = {channels : ["bob#genral"],
//                         colors: {
//                                         channel:"#ffffc00",
//                                         project:"#02b875",
//                                         tag:"#123ee"
//                                         },
//                         lastCleared: "a min ago"}
//             chai.request(server)
//             .post('/Tiles')
//             .send(Tiles)
//             .end((err, res) => {
//                 res.should.have.status(200);
//                 res.body.should.be.a('object');
//                 res.body.should.have.property('errors');
//                 res.body.errors.should.have.property('tags');
//                 res.body.errors.pages.should.have.property('kind').eql('required');
//               done();
//             });

//             it('it should POST a Tile ', (done) => {
//         let Tiles = {channels : ["bob#genral"],
//                         colors: {
//                                         channel:"#ffffc00",
//                                         project:"#02b875",
//                                         tag:"#123ee"
//                                         },
//                         tags: ["#123ee"],
//                         lastCleared: "a min ago"}
//             chai.request(server)
//             .post('/Tiles')
//             .send(Tiles)
//             .end((err, res) => {
//                 res.should.have.status(200);
//                 res.body.should.be.a('object');
//                 res.body.should.have.property('message').eql('Tiles successfully added!');
//                 res.body.book.should.have.property('channels');
//                 res.body.book.should.have.property('colors');
//                 res.body.book.should.have.property('tags');
//                 res.body.book.should.have.property('lastCleared');
//               done();
//             });
//       });
//   });
//        });





