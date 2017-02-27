const express = require('express')
    , router = express.Router()
    , request = require('superagent')
    , JWT = require('jsonwebtoken');

var oauth = require("oauth").OAuth2
  , OAuth2 = new oauth("ad2adcbfe26251810f6f", "77630257cf7be6a969458b5dc305789946f62af6", "https://github.com/", "login/oauth/authorize", "login/oauth/access_token");

//models
var LatList = require('./../model/lat.schema.js')
  , UserInfo = require('./../model/userinfo.schema.js')
  , ChannelInfo = require('./../model/channelinfo.schema.js');
//global variables
var token
  , accessToken;

router.get('/dashboard', function(req, res) {
    var code = req.query.code;
    OAuth2.getOAuthAccessToken(code, {}, function(err, access_token, refresh_token) {
        if (err) {
            console.log(err);
        }
        accessToken = access_token;
        console.log("AccessToken: " + accessToken + "\n");
        request.get("https://api.github.com/user?access_token=" + accessToken).end((err, response) => {

            var payload = response.body.login;
            var avatar = response.body.avatar_url;
            //console.log(avatar);
            var secretkey = "ourbobapplication";
            token = JWT.sign(payload, secretkey);
            res.cookie("Token", token+"#"+avatar);
            //res.cookie("Image",avatar);
            console.log(token);
            UserInfo.find({ username: payload }).exec((err, reply) => {
                if (reply.length === 0) {
                    request.post('http://localhost:8000/user/' + payload + "/Layout")
                        .end(function(err, res) {

                            if (JSON.parse(res.text).result)
                                console.log("new layout created in redis");
                            else
                                console.log("user already present in redis layout");
                        });
                    res.redirect("http://localhost:8000/#/project");
                } else {
                    var currentChannel = reply[0].currentChannel;
                    res.redirect("http://localhost:8000/#/bob");
                }
            })

        })

    })
})
module.exports = router;
