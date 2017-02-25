var express = require('express')
var router = express.Router()
var client = require('./../connections/redisclient.js');
var mongoose = require('mongoose');
const db = require('./../connections/dbconnect.js');
const Tiles = require('./../model/tile.schema.js');
const Users = require('./../model/userinfo.schema.js');
const Channels = require('./../model/channelinfo.schema.js');
const bodyParser = require('body-parser');
const Lats = require('./../model/lat.schema.js');



router.use(bodyParser.urlencoded({ extended: false }))

router.use(bodyParser.json())


router.get('/user/:userId/channels', function(req, res) {

    console.log("User id is : ", req.params.userId);
    let userId = req.params.userId;
    Users.find({ username: userId }, function(err, reply) {
        if (reply === undefined || reply.length == 0) {
            console.log("User : " + userId + " not found.");
            return res.send({ result: false, status: "User : " + userId + " not found." });
        } else {
            if(reply[0].channelList.length==0)
              return res.send({ result: true, data:[]});
            return res.send({ result: true, data:reply[0].channelList});

        }
    });


});

router.get("/add/:projectName/channel/:channelName", function(req, res) {
    let a = req.params.projectName + "#" + req.params.channelName;
    let b = req.params.projectName + "#general";
    let allUsers = [];
    let channelUsers = [];
    Channels.findOne({ channelName: b }, function(err, reply) {
        allUsers = reply.members;
        Channels.findOne({ channelName: a }, function(err, reply) {
            channelUsers = reply.members;
            channelUsers.map((item, i) => {
                if (allUsers.indexOf(item) != -1) {
                    allUsers.splice(allUsers.indexOf(item), 1)
                }
            })
            res.send({ result: true, data: allUsers })
        })

    })


})

router.patch('/channels/:channelName/user/:userName', function(req, res) {
    console.log("Channel Name is :", req.params.channelName, "userName is :", req.params.userName);
    let a = req.params.channelName + "#general";
    Channels.find({ channelName: a }, function(err, rep) {
        console.log(rep);
        if (rep[0].members.indexOf(req.params.userName) != -1) {
            return res.send({ result: false, status: "You are already part of this team" })
        } else if (rep[0].requests.indexOf(req.params.userName) == -1) {
            Channels.findOneAndUpdate({ channelName: a }, { $push: { requests: req.params.userName } }, function(err, reply) {
                return res.send({ result: true, status: "Your request has been sent to Admin" });
            })
        } else {
            return res.send({ result: false, status: "You have already requested " });
        }
    })


})






router.post('/users/:userId/channels', function(req, res) { //give userId, toId, projectname,it will create the channel.
    console.log("this is params", req.params);
    let userId = req.body.userId; //username got from url
    let toId = req.body.toId;
    let project = req.body.project;
    console.log("this is userid: ", userId, "this is toId: ", toId, "this is project: ", project);

    let arr = [];
    arr[0] = userId;
    arr[1] = toId;
    console.log("channel before sort ", arr);
    arr.sort();
    console.log("channel after sort ", arr);

    let channel = project + "#" + arr[0] + "#" + arr[1];
    console.log("complete channel: ", channel);



    Channels.find({ channelName: channel }, function(err, reply) {
        if (!(reply === undefined || reply.length === 0)) {
            return res.send({ result: false, status: "Direct chat already present." });
        } else {
            let new_channel = new Channels({
                channelName: channel, //bob#A#B
                members: [arr[0], arr[1]],
                Admin: userId,
                requests: [],
                type: ""
            });

            new_channel.save((err, reply) => {

                Users.find({ username: arr[0] }, function(err, reply) {
                    if (reply === undefined || reply.length === 0)
                        return res.send({ result: false, status: "User not present" });
                    console.log(reply);

                    reply[0].channelList.push(channel);
                    reply[0].save();
                });
                Users.find({ username: arr[1] }, function(err, reply) {
                    if (reply === undefined || reply.length === 0)
                        return res.send({ result: false, status: "User not present" });
                    console.log(reply);
                    reply[0].channelList.push(channel);
                    reply[0].save((err, reply) => {

                        console.log("sending added via channel ", project + "#general");
                        let ob = {
                            newDM: project + "#" + arr[0] + "#" + arr[1],
                            toId: toId,
                            lat: new Date()
                        }
                        console.log("pushing this object via redis :", ob);
                        client.publish(project + "#general", JSON.stringify(ob)); //published chaaneel name via redis topic.

                        return res.send({ result: true, status: "Added " + toId + " to chat", channelName: channel });

                    });
                });
                let obj = {};
                let prev = 'lat.' + project + "#" + arr[0] + "#" + arr[1];
                obj[prev] = new Date();
                Lats.findOneAndUpdate({ username: arr[0] }, { $set: obj }, function(err, reply) {});
                Lats.findOneAndUpdate({ username: arr[1] }, { $set: obj }, function(err, reply) {});
            });
        }
    });



});

router.post('/user/:userId/project/', function(req, res) {

    let userName = req.body.userName;
    let projectName = req.body.projectName;
    let avatar = req.body.avatar;
    console.log(userName, projectName, avatar, "start of joining channel");

    Channels.find({ channelName: projectName + "#general" }, function(error, rep) {
      console.log("this is inside project join",rep);
        if (rep === undefined || rep.length === 0) {
            return res.send({ result: false, status: "Project Not present" });

        } else {

            Users.findOne({ username: userName }, function(err, reply) { //see if user there in system or not
                if (reply == null) { //if user not present create userinfo and update the general of project.
                    let a = [];
                    a.push(projectName + "#general");
                    let user = new Users({
                        username: userName,
                        channelList: a,
                        currentChannel: projectName + "#general",
                        avatar: avatar
                    });
                    user.save(function(err, reply) {
                        let pn = projectName + "#general";
                        let latob = {};
                        latob[pn] = new Date();
                        let lat = new Lats({
                            username: userName,
                            lat: latob
                        });
                        lat.save(function(err, reply) {
                            Channels.findOneAndUpdate({ channelName: projectName + "#general" }, { $push: { members: userName } }, function(err, reply) {
                                //socket.emit("Joined");

                                console.log("Saved");
                                return res.send({ result: true, status: "Welcome to " + projectName });
                            })
                        })
                    })
                } else { //if present add general to user and user to general.
                    Users.find({ username: userName }, function(err, reply) {
                        if (reply[0].channelList.includes(projectName + "#general"))
                            return res.send({ result: false, status: "Enter a project you are not part of" });

                        reply[0].channelList.push(projectName + "#general");
                        reply[0].save((err, rep) => {
                            Users.findOneAndUpdate({ username: userName }, { $set: { currentChannel: projectName + "#general" } }, function(err, reply) {
                                let pn = projectName + "#general";
                                let a = "lat." + pn;
                                var obj = {};
                                obj[a] = new Date();
                                Lats.update({ username: userName }, { $set: obj }, function(err, reply) {
                                    Channels.findOneAndUpdate({ channelName: projectName + "#general" }, { $push: { members: userName } }, function(err, reply) {
                                        //socket.emit("Joined");
                                        console.log("Saved");

                                        return res.send({ result: true, status: "Welcome to " + projectName });

                                    })
                                })
                            })
                        })


                    })

                }
            })
        }


    });




});

module.exports = router;
