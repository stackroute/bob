const express = require('express')
    , router = express.Router()
    , request = require('superagent')
    , JWT = require('jsonwebtoken')
    , bodyParser = require('body-parser');

var oauth = require("oauth").OAuth2
  , OAuth2 = new oauth("1b4daad08bbe4298d833", "77c98e8f0cd39fb6524ca4b8a720e8bb52a2afa7", "https://github.com/", "login/oauth/authorize", "login/oauth/access_token");

//models
var LatList = require('./../model/lat.schema.js')
  , UserInfo = require('./../model/userinfo.schema.js')
  , ChannelInfo = require('./../model/channelinfo.schema.js')
  , GitChannel = require('./../model/gitchannel.schema.js')
  , GitAToken = require('./../model/githubatoken.schema.js');

//global variables
var token
  , accessToken
  , userName;

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.post('/hooks',function(req,res){
 // console.log("Hooks",req.body);
 console.log(req.body.head_commit.message,req.body.head_commit.timestamp,req.body.head_commit.url,req.body.head_commit.author.username,req.body.repository.name);
  let message={};
      message["author_name"]=req.body.head_commit.author.username;
      message["repo_name"]=req.body.repository.name;
      message["message"]=req.body.head_commit.message;
      message["timestamp"]=req.body.head_commit.timestamp;
      message["url"]=req.body.head_commit.url;
  GitChannel.update({userName:req.body.repository.owner.name},{$push:{message:message}},{upsert:true},function(err,res){

  })
  res.send("Received");
})

router.get('/dashboard', function(req, res) {
    var code = req.query.code;
    OAuth2.getOAuthAccessToken(code, {}, function(err, access_token, refresh_token) {
        if (err) {
            console.log(err);
        }
        accessToken = access_token;
        console.log("AccessToken: " + accessToken + "\n");
        request.get("https://api.github.com/user?access_token=" + accessToken).end((err, response) => {

            var userName=response.body.login;
            var payload = response.body.login;
            var avatar = response.body.avatar_url;
            //console.log(avatar);
            var secretkey = "ourbobapplication";
            token = JWT.sign(payload, secretkey);
            res.cookie("Token", token+"#"+avatar);
            //res.cookie("Image",avatar);
            console.log(token);
            GitAToken.update({username:userName},{$set:{token:accessToken}},{upsert:true},function(err,res){

            })
            UserInfo.find({ username: payload }).exec((err, reply) => {
                if (reply.length === 0) {
                    request.post('http://bob.blr.stackroute.in/user/' + payload + "/Layout")
                        .end(function(err, res) {

                            if (JSON.parse(res.text).result)
                                console.log("new layout created in redis");
                            else
                                console.log("user already present in redis layout");
                        });
                    res.redirect("http://bob.blr.stackroute.in/#/project");
                } else {
                    var currentChannel = reply[0].currentChannel;
                    res.redirect("http://bob.blr.stackroute.in/#/bob");
                }
            });
        });
    });
});
router.post('/user/:userName/gitChannel/:repos',function(req,res){
 //console.log(req.params.repos,"Got Request");
 var repos_names=req.params.repos.split(",");
 let accesstoken="";
  GitAToken.findOne({username:req.params.userName},function(err,res){
    accesstoken=res.token;
    repos_names.map((repo,i)=>{
    request.post("https://api.github.com/repos/"+req.params.userName+"/"+repo+"/hooks?access_token="+accesstoken).send(
      {
        "name": "web",
        "active": true,
        "events": [
          "push",
          "pull_request"
        ],
        "config": {
          "url": "http://bob.blr.stackroute.in/hooks",
          "content_type": "json"
        }
      }).end((req,res)=>{
        console.log("Success-----Hooks Response");
      });
  });
  })
  //console.log(req.params.userName,accesstoken,repos_names,"--------");
  //console.log(repos_names;
  
});
module.exports = router;
