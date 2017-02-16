var express = require('express')
var router = express.Router()
var client = require('./../connections/redisclient.js');
var mongoose = require('mongoose');
const db = require('./../connections/dbconnect.js');
const Tiles = require('./../model/tile.schema.js');
const Users = require('./../model/userinfo.schema.js');
const bodyParser = require('body-parser');
var waterfall = require('async/waterfall');
var async = require('async');
var timers = require('timers');
var each = require('async/each');

function getMessages(channelId, count, lastCleared, callback) { //get messages from this channel
    client.lrange(channelId, 0, 50, callback);

}



router.use(bodyParser.urlencoded({ extended: false }))

router.use(bodyParser.json())

router.post('/user/:userId/Tiles', function(req, res) { //add a new tile 

    console.log("this is params", req.params);
    let userId = req.params.userId; //username got from url
    console.log("this is userid ", userId);
    let tile = new Tiles({ //default values for a new tile
        projects: { "Bob": "all", "Oxygen": "all" },
        colors: {
            tag: "#0084ff",
            project: "#02b875",
            channel: "#fffc00"
        },
        tags: [],
        bookmarks: [],
        lastCleared: new Date(99, 0) //set last cleared to jan 1 1999. workaround 
    });
    tile.save((err, reply) => {
        console.log("this is the save id ", reply._id); //use some random values for position 
        let ob = {

            "w": 2,
            "h": 2,
            "x": 5,
            "y": 5,
            "i": reply._id,
            "moved": false,
            "static": false

        };
        client.lpush("#Layout#" + userId, JSON.stringify(ob), function(err, reply) { //
            if (err) {
                console.log("Error in pushing newly created tile into redis");
                res.send({ result: false,status:"Error in pushing newly created tile into redis" });

            } else {
                console.log("The new tile is successfully pushed in redis");
                res.send({ result: true, data: tile });
            }
        });
    });

})

router.put('/user/:userId/Tiles/:TileId', function(req, res) {
    console.log("this is params", req.params);
    let userId = req.params.userId;
    let tileId = req.params.TileId;
    let ob = req.body;
    console.log("this is userId and tileId " + userId + " : " + tileId);
    console.log("This is body of patch: ", ob);

    Tiles.findById(tileId, function(err, tile) { //fetch the tile and update all the fields and save.
        tile.projects = ob.projects;
        tile.colors = ob.colors;
        tile.tags = ob.tags;
        tile.bookmarks = ob.bookmarks;
        tile.lastCleared = ob.lastCleared;

        tile.save(function(err, tile) {
            res.send(tile);
        });
    });
});

router.get('/user/:userId/Tiles', function(req, res) {
    console.log("this is params", req.params);
    let userId = req.params.userId;
    console.log("this is userId: " + userId);
    let db_tiles = [];

    let tasks = [
        function(callback) { //send the parsed layout
            client.lrange("#Layout#" + userId, 0, -1, function(err, reply) { //get layout from redis and put to state.
                if (err) {
                    console.log("error in fetching layout from redis:", err);
                } else {
                    console.log("got the reply", reply);
                    if (reply === undefined || reply.length === 0)
                        res.send({ result: false, status: "Layout for user:" + userId + " not found" });

                    reply = reply.map((item, i) => {
                        return JSON.parse(item);
                    });
                    callback(null, reply);
                }
            });

        },
        function(layout, callback) { //add tiles data from mongodb
            async.each(layout, function(item, callback) {

                Tiles.find({ _id: item.i }, function(err, reply) {
                    console.log("Tile not found,", reply);
                    if (reply === undefined || reply.length == 0) {
                        console.log("Tile : ", item.i, " not found.");
                        res.send({ result: false, status: "Tile : " + item.i + " not found." });
                        callback();
                    } else {
                        db_tiles.push(reply[0]);
                        callback();
                    }
                });
            }, function(err) {
                if (err) {
                    console.log("error in async each.");
                } else {
                    console.log(db_tiles, "inside each callback");
                    callback(null, { layout: layout, db_tiles: db_tiles });
                }
            });
        }
    ];

    async.waterfall(tasks, function(err, result) {

        console.log(result.layout, "=====", result.db_tiles);
        res.send({ result: true, data: result.db_tiles });

    });
});

router.get('/user/:userId/Tiles/:tileId/Messages', function(req, res) {

    console.log("this is params", req.params);
    let tileId = req.params.tileId;
    let userId = req.params.userId;
    console.log("this is userId and tileId " + userId + " : " + tileId);

    let tasks = [];

    tasks = [
        function(callback) { //get the tile details
            Tiles.find({ _id: tileId }, function(err, reply) {
                if (reply === undefined || reply.length === 0) {
                    console.log("Tile : ", tileId, " not found.");
                    res.send({ result: false, status: "Tile : " + tileId + " not found." });
                } else {
                    if (reply[0].projects === undefined || (Object.keys(reply[0].projects).length === 0 && reply[0].projects.constructor === Object))
                        res.send({ result: false, status: "no filters for the tile" });
                    callback(null, reply[0]);
                }
            });
        },
        function(tile_info, callback) { //get the projects,channels

            console.log("this is tile _info 1 ", tile_info);

            let projects = tile_info.projects;
            let channels = [];

            Users.find({ username: userId }, function(err, reply) {
                if (reply === undefined || reply.length === 0) {
                    console.log("user not found in getMessages");
                    res.send({ result: false, status: "user " + userId + " not found in getMessages" });

                } else {
                    channels = reply[0].channelList;
                    callback(null, tile_info, projects, channels);
                }
            });
        },
        function(tile_info, projects, channels, callback) { //get the filtered channels

            console.log("this is tile _info: ", tile_info, " projects: ", projects, " channels: 2 ", channels);


            let filterChannel = [];
            async.each(Object.keys(projects), function(project, callback) {
                console.log("doing this project: ", project);
                if (projects[project] === "all") {
                    console.log("this project is all: ", project);

                    filterChannel = filterChannel.concat(channels.filter((item) => {
                        if (item.split('#')[0] === project)
                            return item;
                    }));
                    callback();

                } else {
                    console.log("this project is not all: ", project);
                    let channelList = projects[project].map((element, index) => {
                        return project + "#" + element;
                    });

                    filterChannel = filterChannel.concat(channelList);
                    callback();
                }
            }, function(err) {
                callback(null, tile_info, projects, filterChannel);
            });

        },
        function(tile_info, projects, filterChannel, callback) { //get approx 50 messages from filtered channels.

            console.log("this is tile _info: ", tile_info, " projects: ", projects, " filtered channels: 3 ", filterChannel);

            let messages = [];
            let count = Math.ceil(50 / filterChannel.length);
            async.each(filterChannel, function(channel, callback) {


                    getMessages(channel, count, tile_info.lastCleared, function(err, reply) {
                        if (reply.length !== 0) {

                            reply = reply.map((element, index) => {
                                element = JSON.parse(element);
                                element.channelId = channel;
                                element = handleTime(element);
                                return element;
                            });
                            reply = reply.filter((item,ind)=>{
                                if(item.sender===userId)
                                    return false;
                                else
                                    return true;
                            });

                            messages = messages.concat(reply);
                        }
                        callback();
                    });
                },
                function(err) {
                    if (err)
                        console.log("error in getting messages in getMessages ", err);
                    else {

                        callback(null, messages);
                    }

                });

        }
    ];
    async.waterfall(tasks, function(err, results) {
        res.send({ result: true, data: results });
    })


});

router.delete('/user/:userId/Tiles/:tileId', function(req, res) { //delete the tile

    console.log("this is params", req.params);
    let tileId = req.params.tileId;
    let userId = req.params.userId;
    console.log("this is userId and tileId " + userId + " : " + tileId);

    Tiles.findByIdAndRemove(tileId, function(err, tile) { //delete the tile in mongodb
        if (err) {
            console.log("error in deleting tile: ", tileId);
        } else {
            client.lrange("#Layout#" + userId, 0, -1, function(err, reply) { //get the layout of user from redis


                reply = reply.map((item) => {
                    return JSON.parse(item);
                });



                reply = reply.filter((item) => {
                    if (item.i === tileId)
                        return false;
                    else
                        return true;
                });



                reply = reply.map((item) => {
                    return JSON.stringify(item);
                });

                client.del("#Layout#" + userId, function(err, integ) { //delete the current list and push a new one
                    client.lpush("#Layout#" + userId, reply);
                    res.send("Deleted the tile " + tileId);

                });

            });
        }
    });
});


router.put('/user/:userId/Layout', function(req, res) { //putting a new set of layout data 
    console.log("this is params", req.params);
    let userId = req.params.userId;
    console.log("this is userId " + userId);
    console.log("This is layout: ", req.body);
    var layout = req.body.layout;
    client.del("#Layout#" + userId, function(err, integ) { //delete the old value
        if (integ === 0) {
            console.log("the tile was not present to delete in redis.");
        } else {
            async.each(layout, function(item, callback) {

                client.lpush("#Layout#" + userId, JSON.stringify(item), function(err, reply) {
                    if (err) {
                        console.log("Error in pushing to strings to Layout");
                    } else {
                        callback(); //callback after pushed to list.
                    }
                });
            }, function(err) {
                if (!err) {
                    console.log("successfully pushed to redis");
                    res.send({ result: true, layout: layout });
                }
            });
        }
    });

});


router.delete('/user/:userId/Layout', function(req, res) {
    console.log("this is params", req.params);
    let userId = req.params.userId;
    console.log("this is userId " + userId);
    console.log("This is layout: ", req.body);
    client.del("#Layout#" + userId, function(err, reply) {
        if (err) {
            console.log("error in deleting the layout in deleteLayout.");
            res.send({ result: false, status: "Error" });

        } else if (reply === 0) {
            console.log("Nothing layout to delete in redis.");
            res.send({ result: true, status: "Nothing layout to delete in redis." });

        } else {
            console.log("successfully Deleted layout in redis");
            res.send({ result: true, status: "successfully Deleted layout in redis" });
        }

    });
});


router.get('/user/:userId/Layout', function(req, res) {
    console.log("this is params", req.params);
    let userId = req.params.userId;
    console.log("this is userId " + userId);

    client.lrange("#Layout#" + userId, 0, -1, function(err, reply) {
        if (reply === undefined || reply.length === 0) {
            console.log("Nothing layout to get in redis.");
            res.send({ result: false, status: "Nothing layout to get in redis." });
        } else {
            reply = reply.map((item) => {
                return JSON.parse(item);
            });
            console.log("successfully got layout in redis");
            res.send({ result: true, data: reply });
        }
    });


});

router.post('/user/:userId/Layout', function(req, res) {
    console.log("this is params", req.params);
    let userId = req.params.userId;
    console.log("this is userId " + userId);

    let ob = {

        "w": 4,
        "h": 4,
        "x": 0,
        "y": 0,
        "i": "add_tile",
        "moved": false,
        "static": false

    }
    client.lrange("#Layout#" + userId, 0, -1, function(err, reply) {
        if (reply === undefined || reply.length === 0) {
            client.lpush("#Layout#" + userId, JSON.stringify(ob), function(err, reply) { //
                if (err) {
                    console.log("Error in pushing newly created layout into redis");
                    res.send({ result: false ,status:"Error in pushing newly created layout into redis"});

                } else {
                    console.log("The new layout is successfully pushed in redis");
                    res.send({ result: true, data: reply });
                }
            });
        } else {

            res.send({ result: false, status: "user already there in db" });
        }
    });



});



router.post('/user/:userId/Tiles/:projectId', function(req, res) { //add a new tile 

    console.log("this is params", req.params);
    let userId = req.params.userId; //username got from url
    console.log("this is userid ", userId);
    let projectName = req.params.projectId;
    let projects = {};
    projects[projectName] = ["general"];
    let tile = new Tiles({ //default values for a new tile
        projects: projects,
        colors: {
            tag: "#0084ff",
            project: "#02b875",
            channel: "#fffc00"
        },
        tags: [],
        bookmarks: [],
        lastCleared: new Date(99, 0) //set last cleared to jan 1 1999. workaround 
    });
    tile.save((err, reply) => {
        console.log("this is the save id ", reply._id); //use some random values for position 
        let ob = {

            "w": 3,
            "h": 3,
            "x": 5,
            "y": 5,
            "i": reply._id,
            "moved": false,
            "static": false

        };
        client.lpush("#Layout#" + userId, JSON.stringify(ob), function(err, reply) { //
            if (err) {
                console.log("Error in pushing newly created tile into redis");
                res.send({ result: false,status:"Error in pushing newly created tile into redis" });

            } else {
                console.log("The new tile is successfully pushed in redis");
                res.send({ result: true, data: tile });
            }
        });
    });

})

function handleTime(msg){
        let date=[];
         date[0]= new Date(msg.TimeStamp).getHours();
         date[1]= new Date(msg.TimeStamp).getMinutes();
         if(date[0]>12){
             date[2] = "PM";
             date[0] = date[0] -12;
         }
         else{
             date[2] = "AM";
         }
         date = date[0]+":"+date[1]+" "+date[2];
    console.log(new Date().getHours(),date,"=======================");
         msg.TimeStamp = date;
        return msg;
    }


module.exports = router;
