var mongoose = require('mongoose');

var ChatHistorymodel = require('./../model/chathistory.schema.js');
var db = require('./../connections/dbconnect.js'); //creating a connection to mongodb
let client = require('./../connections/redisclient.js');
var pushToRedis = require('./../PushToRedis');

let async = require('async');
let UserInfo = require('./../model/userinfo.schema.js');
let LatList = require('./../model/lat.schema.js'),
    Feedback = require('./../model/feedback.schema.js');
userinfo = new UserInfo();
const ChannelInfo = require('./../model/channelinfo.schema.js');
// client = require('./../redisclient.js');
let unreadCount = {};
let currentChannelName = "";
let currentUser = "";

module.exports = function(io, socket) {

    const sub = client.duplicate(); //subscriber for will subscribe to all channels he is member of
    const pub = client.duplicate(); //only one publisher is enough

    //Below are the redis events that are catched.
    sub.on('message', handleMessage);
    sub.on('subscribe', handleSubscribe);
    sub.on('unsubscribe', handleUnsubscribe);

    //Below are the event handlers for socket events
    socket.on('send message', handleSendMessage); //handling message sent from user.
    socket.on('typing', handleTyping); //handling typing event from user.
    socket.on('disconnect', handleDisconnect); //handling disconnecting event from user.
    socket.on('getUnreadNotification', handlegetUnreadNotification); //request for unreadnotifications for a user.
    socket.on('receiveChatHistory', handleReceiveChatHistory); //request for sending chat history by user. FIXME:put new function from 6th sprint
    socket.on('getResetNotification', handleResetNotification); //request for resetting chat history. FIXMEput new function from 6th sprint.
    socket.on('feedback', feedbackManager);
    socket.on('newChannel', newChannel);

    function newChannel(username, projectName, channelName) {
        console.log("newChannelEvent parameters : ", username, projectName, channelName);
        let channel = projectName + '#' + channelName;
        UserInfo.update({ username: username }, { $push: { channelList: channel } }, function(err, reply) {
            ChannelInfo.findOne({ channelName: channel }, function(err, reply) {
                if (reply == null) {
                    let c = new ChannelInfo({
                        channelName: channel,
                        members: [username]
                    });

                    c.save(function(err, reply) {
                        console.log('',reply);
                        let pn = projectName + "#" + channelName;
                        let a = "lat." + pn;
                        var obj = {};
                        obj[a] = new Date();

                        LatList.update({ username: username }, { $set: obj }, function(err, reply) {
                            console.log(reply)
                        });
                    })

                } else {
                    ChannelInfo.update({ channelName: channel }, { $push: { members: username } }, function(err, reply) { //after channel saved, save the lat.
                        let pn = projectName + "#" + channelName;
                        let a = "lat." + pn;
                        var obj = {};
                        obj[a] = new Date();

                        LatList.update({ username: username }, { $set: obj }, function(err, reply) {
                            console.log(reply)
                        });

                    });
                }
            })

        });
        UserInfo.findOne({ username: username }, function(err, reply) {
            console.log(reply);
            reply.channelList = reply.channelList.filter((item, i) => {
                if ((item.split('#'))[0] === projectName) {
                    return item;
                }
            });
            console.log('channelList : ', reply.channelList);
            socket.emit('updatedChannelList', reply.channelList);
        });
        sub.subscribe(channel);
    }

    function feedbackManager(obj) {
        let feedback = new Feedback({
            name: obj["name"],
            comment: obj['comment']
        });
        feedback.save(function(err, reply) {
            console.log('feedback saved : ', reply);
        });
    }

    function handleMessage(channel, message) { //message is text version of the message object.
        message = JSON.parse(message);
        console.log(message, "in handlemessage\n\n\n\n\n\n\n\n\n\n\n\n");
        socket.emit('takeMessage', channel, message);
    }

    function handleSubscribe(channel, count) { //count is the total number channels user is subscribed to.
        //currently this is empty.
    }

    function handleUnsubscribe(channel, count) { //count is the number of remaining subscriptions.
        console.log('User ' + socket.id + " has unsubscribed");
        pub.publish('channel1', `User with socket id: ${socket.id} has unsubscribed`);
    }
    // FIXME: rewrite without using io
    function handleSendMessage(sender, channelID, msg) { //it will publish to the given channel and put it in database.FIXME:see 50 limit has reached
        let date = new Date();
        obj = { 'sender': sender, 'msg': msg, 'TimeStamp': date } //-and if reached put it to mongoDB. Better write this function again.
        console.log("Message sent", obj);
        pub.publish(channelID, JSON.stringify(obj));
        pushToRedis(channelID, obj);
        // UserChannelList.findOne({ username: sender }, function(err, res) {
        //     let cList = res.channelList;
        //     if (cList.indexOf(channelID) != -1) {
        //         console.log(unreadCount);
        //         unreadCount[channelID]++;
        //         console.log(channelID, unreadCount[channelID]);
        //         console.log(cList);
        //         socket.emit('listenToMessage', cList, channelID);
        //     }
        // })
        //client.hincrby(sender + "/unreadNotifications", channelID, 1);
    }

    function handleTyping(name, channelId) { //emit the typing event to all connected users.
        // io.emit('typing', name,channelId);
        pub.publish(channelId, JSON.stringify({ "typer": name }));
    }

    function handleDisconnect(socket) {
        let obj = {};
        let prev = 'lat.' + currentChannelName;
        obj[prev] = new Date();
        LatList.findOneAndUpdate({ username: currentUser }, { $set: obj }, function(err, reply) {
            console.log('lat updated ', reply);
        });
        console.log('a user disconnected');
    }

    function handlegetUnreadNotification(msg) { //FIXME: Write again.
        console.log('inside unreadNotifications', msg.user);
        client.hgetall(msg.user + "/unreadNotifications", function(err, reply) {
            socket.emit('unreadNotification', reply);
            console.log(reply);
        });
    }

    function handleReceiveChatHistory(msg) {
        console.log(msg.channelName, "this is before reids gets the requersr");
        if (msg.pageNo === "initial_primary") {
            getRedisHistory(msg);

        } else if (msg.pageNo === "initial_secondary") {
            getMongoHistory(msg);
        } else {
            getMongoHistory(msg);
        }

    }

    function handlegetUnreadNotification(msg) {
        client.hgetall(`${msg.user}/unreadNotifications`, function(err, value) {
            console.log(`unreadNotifications for manoj is: `, value);
            socket.emit('unreadNotification', value);
        });
    }

    function handleResetNotification(msg) {
        console.log("inside reset Notification", msg.user, msg.key);
        client.hset(msg.user + "/unreadNotifications", msg.key, "0");
        client.hgetall(msg.user + "/unreadNotifications", function(err, reply) {
            socket.emit('resetNotification', reply);
            //console.log(reply);
        });
    }

    // 

    function getMongoHistory(msg) {

        if (msg.pageNo === "initial_secondary") {
            ChatHistorymodel.find({}).sort({ _id: -1 }).limit(1).exec((err, reply) => {
                if (reply.length === 0) {
                    socket.emit('historyEmpty');
                } else {
                    socket.emit('chatHistory', reply[0].msgs, reply[0]._id);
                }
            });

        } else {
            ChatHistorymodel.find({ _id: msg.pageNo }, function(err, reply) {
                if (reply[0].p_page === null) {
                    socket.emit('historyEmpty');
                } else {
                    ChatHistorymodel.find({ _id: reply[0].p_page }, function(err, reply) {
                        socket.emit('chatHistory', reply[0].msgs, reply[0]._id);
                    });
                }
            });
        }
    }

    function getRedisHistory(msg) {
        console.log(msg, "helfglhofgjyujtyhrt this is redis");
        client.lrange(msg.channelName, 0, -1, function(err, reply) {
            if (reply == "") {

                socket.emit('pempty', "initial_secondary");

            } else {
                console.log(reply);
                let messages = reply.map((element, i) => {
                    return JSON.parse(element);
                });
                console.log(messages);
                socket.emit('chatHistory', messages, "initial_secondary");
            }
        });
    }

    socket.on('login', function(usrname, projectName) {
        console.log("first line onlt", usrname,projectName);
        let lat = null;
        let loginTime = new Date().getTime();
        console.log("currentTime", loginTime);
        console.log('========', usrname, '========', projectName, '========', "Current User");
        LatList.findOne({ username: usrname }, function(err, res) {
                // console.log(res.lat, "lat defined or not");
                if (res != null) {
                    lat = res.lat;
                }
            })
            //search the DB for username
        UserInfo.findOne({ username: usrname }, function(err, reply) {
            console.log("This is reply", reply);
            console.log("This is error on fetching channels", err);
            reply.channelList = reply.channelList.filter((item, i) => {
                if ((item.split('#'))[0] === projectName) {
                    return item;
                }
            });
            console.log("This is reply.channelList", reply.channelList);
            async.each(reply.channelList, function(item, callback) {
                console.log(item);
                sub.subscribe(item);
                let a = item;
                client.lrange(item, 0, -1, function(err, res) {
                    let count = 0;
                    console.log(res);
                    res.forEach(function(item, i) {
                        item = JSON.parse(item);
                        if (new Date(item.TimeStamp).getTime() > new Date(lat[a]).getTime()) {
                            count++;
                        }
                    });

                    unreadCount[a] = count;
                    callback();

                });
            }, function(err) {
                console.log(" hugoboss ", reply.channelList, unreadCount, lat);
                socket.emit('channelList', reply.channelList, unreadCount, lat);
            });

        });
    });

    socket.on('currentChannel', function(currentChannel, prevChannel, userName) {
        currentChannelName = currentChannel;
        CurrentUser: userName;
        let d = new Date();
        console.log(prevChannel, currentChannel, unreadCount);
        unreadCount[prevChannel] = 0;
        unreadCount[currentChannel] = 0;
        //prevChannelLAT=new Date();
        let prev = 'lat.' + prevChannel;
        let current = 'lat.' + currentChannel;
        let obj = {};
        obj[prev] = new Date();
        obj[current] = new Date();
        LatList.findOneAndUpdate({ username: userName }, { $set: obj }, function(err, reply) {
            console.log('lat updated ', reply);
        });
        console.log(unreadCount);
        socket.emit("updateUnread", currentChannel, prevChannel, d);
    });
}
var mongoose = require('mongoose');
