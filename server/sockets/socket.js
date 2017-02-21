var mongoose = require('mongoose');
var ChatHistorymodel = require('./../model/chathistory.schema.js');
var db = require('./../connections/dbconnect.js'); //creating a connection to mongodb
let client = require('./../connections/redisclient.js');
var pushToRedis = require('./../PushToRedis');
let async = require('async');
let ajax = require('superagent');
let UserInfo = require('./../model/userinfo.schema.js');
let LatList = require('./../model/lat.schema.js'),
    Feedback = require('./../model/feedback.schema.js');
const ChannelInfo = require('./../model/channelinfo.schema.js');
let GoogleAToken = require('./../model/googleatoken.schema.js');
let unreadCount = {};
let currentChannelName = "";
let currentUser = "";


//Google Auth related variables ---------->
let google = require('googleapis')
  , calendar = google.calendar('v3')
  , OAuth2 = google.auth.OAuth2
  , clientId = '616007233163-g0rk4o8g107upgrmcuji5a8jpnbkd228.apps.googleusercontent.com'
  , clientSecret = 'h0DIE4B8pncOEtgMfK2t9rcr'
  , redirect = 'http://bob.blr.stackroute.in/oauth2callback'
  , oauth2Client = new OAuth2(clientId, clientSecret, redirect);


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
    socket.on('remainderAccepted', tokenSearch);

    function tokenSearch(username, summary, location, sd, ed){
      console.log('token search : ', username, summary, location, sd, ed);
      GoogleAToken.findOne({username: username}, function(err, reply){
        console.log('inside finduser :' , reply);
        if (reply==null) {
          socket.emit('noToken', username, summary, location, sd, ed);
          console.log('inside find if');
        }
        else {
          //console.log('else ', reply.token);
          gfunction(oauth2Client, username, summary, location, sd, ed);
          console.log('inside find else');
        }
      });
    }

    function gfunction(oauth2Client, username, summary, location, sd ,ed){
        GoogleAToken.findOne({username: username}, function(err, reply){
          if (reply==null) {
            refreshToken(oauth2Client);
          } else {
            oauth2Client.credentials = reply.token;
            createEvent(oauth2Client, summary, location, sd, ed);
          }
        });



        function refreshToken(oauth2Client) {
          oauth2Client.refreshAccessToken(function(err, token) {
            if (err) {
              console.log('Error while trying to retrieve access token', err);
              return;
            }
            oauth2Client.credentials = token;
            storeToken(token);
            createEvent(oauth2Client, summary, location, sd, ed);

          });
        }

        function storeToken(username, token) {
          GoogleAToken.update({username: username},{$set:{token: token}},{upsert: true}, function(err, reply){
            console.log('reply from storeToken : ',reply);
          });
        };

        function createEvent(auth, summary, location, sd, ed) {
          console.log('sd : ',sd);
          console.log('ed : ',ed);
          var event = {
            'summary': summary,
            'location': location,
            'description': 'Remainder created by BoB !!!',
            'start': {
              'dateTime': sd,
              'timeZone': 'America/Los_Angeles',
            },
            'end': {
              'dateTime': ed,
              'timeZone': 'America/Los_Angeles',
            },
            // 'recurrence': [
            //   'RRULE:FREQ=DAILY;COUNT=2'
            // ],
            // 'attendees': [
            //   {'email': 'lpage@example.com'},
            //   {'email': 'sbrin@example.com'},
            // ],
            "reminders": {
              "useDefault": "useDefault",
              // # Overrides can be set if and only if useDefault is false.
              // "overrides": [
              //     {
              //       "method": "reminderMethod",
              //       "minutes": "reminderMinutes"
              //     },
              //     # ...
              // ]
            }
          };

          calendar.events.insert({
            auth: auth,
            calendarId: 'primary',
            resource: event,
          }, function(err, event) {
            if (err) {
              console.log('There was an error contacting the Calendar service: ' + err);
              return;
            }
            console.log('Event created: %s', event.htmlLink);
            socket.emit('eventCreated', event.htmlLink);
          });
        }

        function listEvents(auth) {
          var calendar = google.calendar('v3');
          calendar.events.list({
            auth: auth,
            calendarId: 'primary',
            timeMin: (new Date()).toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime'
          }, function(err, response) {
            if (err) {
              console.log('The API returned an error: ' + err);
              return;
            }
            var events = response.items;
            if (events.length == 0) {
              console.log('No upcoming events found.');
            } else {
              console.log('Upcoming 10 events:');
              for (var i = 0; i < events.length; i++) {
                var event = events[i];
                var start = event.start.dateTime || event.start.date;
                console.log('%s - %s', start, event.summary);
              }
            }
          });
        }
      }

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
        let url = "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/976f7fd6-6a76-46c0-9857-6fcc99a99d8b?subscription-key=efd01e4bf7dc443180fcf9145ec03a0b"+"&q="+msg+"&verbose=true"
          , summary=''
          , location='';
        ajax.get(url).end((error,response)=>{
          console.log('inside ajaxCall');
          if(response){
            //console.log(response.body);
            console.log('entities length : ', response.body.entities.length);
            if(response.body.entities.length>=2){
              console.log("entities[0] : ",response.body.entities[0].type,'entities[1] : ',response.body.entities[1].type);
              if(response.body.entities[0].type==="meeting::summary"){
                summary = response.body.entities[0].entity;
              }
              if(response.body.entities[1].type==="meeting::location"){
                location = response.body.entities[1].entity;
              }
              console.log('status : ',response.body.dialog.status);
              socket.emit('confirmSetRemainder', response.body.dialog.status.toUpperCase(), summary, location);
            }
            else {
              console.log("Normal Message");
            }
          }
        });
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
            console.log('lat updated ');

            UserInfo.findOneAndUpdate({username:currentUser},{$set: {currentChannel:currentChannelName}},function(err,reply){
                console.log("CurrentChannel Updated");
          });
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

    socket.on('login', function(usrname) {
        //console.log("first line onlt", usrname,projectName);
        currentUser=usrname;
        let lat = null;
        let loginTime = new Date().getTime();
        console.log("currentTime", loginTime);
        //currentChannel=projectName+"#general";
        console.log('========', usrname, '========', "Current User");
        LatList.findOne({ username: usrname }, function(err, res) {
            console.log(res.lat,err, "lat defined or not");
                if (res != null) {
                    lat = res.lat;
                    //console.log(lat,"This is lat")
                }

            //search the DB for username
        UserInfo.findOne({ username: usrname }, function(err, reply) {
            //console.log(reply.currentChannel,reply.channelList,"Login Event");
            currentChannelName=reply.currentChannel;
            var channelList = reply.channelList;
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
                console.log(" hugoboss ", channelList, unreadCount, lat,currentChannelName);
                socket.emit('channelList', channelList, unreadCount, lat,currentChannelName);
            });

        });
         })
    });

    socket.on('currentChannel', function(currentChannel, prevChannel, userName) {
        currentChannelName = currentChannel;
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

    socket.on("getProjectName",function(){
        ChannelInfo.find({},function(err,reply){
            //console.log(reply);
            var projectList=reply;
            var projects=[];
            var users=[];
            //console.log(reply);
            reply.map(function(item){
                if(projects.indexOf(item.channelName.split('#')[0])==-1){
                    projects.push(item.channelName.split('#')[0]);
                }
            })
            console.log(projects,"List of Projects");
            UserInfo.find({},function(err,reply){
                //console.log("Users",reply);
                reply.map(function(item){
                    users.push(item.username);
                })
                socket.emit("takeProjectList",projects,users);
            })

        })
    })

    socket.on("addNewUser",function(userName,projectName,membersList){
        console.log(userName,projectName,membersList);
        UserInfo.findOne({username:userName},function(err,reply){
            if(reply==null){
                let pn = projectName + "#general";
                let latob = {};
                latob[pn] = new Date();
                console.log(latob);
                 let lat = new LatList({
                        username: userName,
                        lat: latob
                    });
                 lat.save(function(err,reply){
                    console.log(err,reply,"ChannelDetailsSave details");
                    let user = new UserInfo({
                username: userName,
                channelList: projectName+"#general",
                currentChannel:projectName+"#general"
            });
       user.save(function(err,reply){
        console.log(err,reply,"UserDetailsSave details");
        let channel = new ChannelInfo({
                    channelName: projectName+"#general",
                    members: membersList
                });
            channel.save(function(err,reply){
                console.log(err,"If null,Thn Saved All Details");
            })
       })
                 })
            }
            else{
                console.log("Inside Already Existing User");
                let obj = {};
                let name = 'lat.' + projectName+"general";
                obj[name] = new Date();
                LatList.findOneAndUpdate({ username: userName }, { $set: obj }, function(err, reply) {
                console.log('lat updated ');
                UserInfo.findOneAndUpdate({username: userName},{$push:{channelList: projectName+"#general"}}, function(err, reply){
                    console.log(err,reply);
                     let channel = new ChannelInfo({
                     channelName: projectName+"#general",
                     members: membersList
                     });
                     channel.save(function(err,reply){
                console.log(err,"If null,Thn Saved All Details");
            })
                });
            });
            }
        })


    })

    socket.on("getMembersList",function(channelName){
        ChannelInfo.find({channelName:channelName},function(err,reply){
            socket.emit("takeMembersList",reply[0].members);
        })
    })
}
