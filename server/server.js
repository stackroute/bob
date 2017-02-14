const express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io').listen(server),
    client = require('./connections/redisclient.js'),
    mongoose = require('mongoose'),
    socket = require('./sockets/socket.js');
const db = require('./connections/dbconnect.js');
let LatList = require('./model/lat.schema.js');
let UserInfo = require('./model/userinfo.schema.js');
var path = require('path');
const bodyParser = require('body-parser');
const ChannelInfo = require('./model/channelinfo.schema.js');



app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    console.log(req.body, "this si the body of request");

    next();
});

app.get('/', function(req, res) {
    console.log("got a request");
    //res.send("Got");
    res.sendFile(path.resolve(__dirname + "/../index.html"));
});
app.get('/index.js', function(req, res) {
    console.log("got a request");
    res.sendFile(path.resolve(__dirname + "/../index.js"));
});
// parse application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json 
app.use(bodyParser.json())

app.post('/UserLogin', function(req, res) {


    console.log('REQ.BODY', req.body);

    UserInfo.find({ username: req.body.UserName }).exec((err, reply) => {
        if (reply.length === 0) { //user is not there in the db.
            console.log("user not present");


            let user = new UserInfo({
                username: req.body.UserName,
                channelList: req.body.projectName + "#general"
            });
            user.save((err, reply) => { //after user is saved , save the channel
               console.log("Result of saving user:",err);

                let channel = new ChannelInfo({
                    channelName: req.body.projectName + "#general",
                    members: [req.body.UserName]
                });
                channel.save((err, reply) => { //after channel saved, save the lat.

                    let pn = req.body.projectName + "#general";

                    let latob = {};
                    latob[pn] = new Date();
                    let lat = new LatList({
                        username: req.body.UserName,
                        lat: latob
                    });
                    console.log("this is lat before save ", lat, " lat end.")
                    lat.save((err, reply) => {
                        console.log("this is replt of lat save: ", reply, " reply end");
                        res.send({ result: true }); //send true as result. succesfful login
                    });

                });
            });
        } else { //user is present in db.
            console.log("user present");

            if (reply[0].channelList.includes(req.body.projectName + "#general")) { //project also present in db.
                console.log("project present");

                res.send({ result: true }); //send true as result. succesfful login
            } else {
                console.log("project not present");

                UserInfo.update({ username: req.body.UserName }, { $push: { channelList: req.body.projectName + "#general" } }, function(err, reply) {
                    console.log("this is err: " + err, "this is reply ", reply);

                    let channel = new ChannelInfo({ //create the channel in db once the new project is created.
                        channelName: req.body.projectName + "#general",
                        members: [req.body.UserName]
                    });

                    channel.save((err, reply) => { //once the channel is saved, update the lat.
                        let pn = req.body.projectName + "#general";
                        let latob = {};
                        latob[pn] = new Date();
                        LatList.update({ username: req.body.UserName }, { $push: { lat: latob } }, function(err, reply) {
                            res.send({ result: true }); //send true as result. succesfful login
                        });
                    });
                });
            }
        }
    });
});

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    // we're connected!
});



//Redis connection ---------->
client.on('connect', function() {
    console.log('Connected');
});

//Socket Server ---------->
server.listen(8000, function() {
    console.log('server started on  8000');
});

//Socket.io connection ---------->
io.on('connection', socket.bind(null, io));
