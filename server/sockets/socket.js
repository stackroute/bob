var mongoose = require('mongoose');
var ChatHistorymodel = require('./../model/chathistory.schema.js');
var db = require('./../connections/dbconnect.js'); //creating a connection to mongodb
let client = require('./../connections/redisclient.js');
var pushToRedis = require('./../PushToRedis');
let async = require('async');
let ajax = require('superagent');
let UserInfo = require('./../model/userinfo.schema.js');
let LatList = require('./../model/lat.schema.js'),
    Feedback = require('./../model/feedback.schema.js'),
    Tasks = require('./../model/tasks.schema.js');
const ChannelInfo = require('./../model/channelinfo.schema.js');
let GoogleAToken = require('./../model/googleatoken.schema.js');
let bookmarkData = require('./../model/bookmarkSchema.js');
let unreadCount = {};
let currentChannelName = "";
let currentUser = "";


//Google Auth related variables ---------->
let google = require('googleapis'),
    calendar = google.calendar('v3'),
    OAuth2 = google.auth.OAuth2,
    clientId = '616007233163-g0rk4o8g107upgrmcuji5a8jpnbkd228.apps.googleusercontent.com',
    clientSecret = 'h0DIE4B8pncOEtgMfK2t9rcr',
    redirect = 'http://bob.blr.stackroute.in/oauth2callback',
    oauth2Client = new OAuth2(clientId, clientSecret, redirect);


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
    socket.on('saveBookmarks', saveBookmarks);
    socket.on('deleteBookmarks', deleteBookmarks);
    socket.on('taskArray', saveTaskArray);

    function saveTaskArray(channelName, tasks){
      Tasks.update({channelName:channelName},{$set:{tasks: tasks}}, {upsert: true}, function(err, reply){
        console.log('Task saved : ', reply);
      });
    }


    function deleteBookmarks(booklist, userName, channelID) {
        console.log(booklist);
        let a = {
            channelid: channelID,
            sender: booklist.sender,
            timestamp: booklist.TimeStamp,
            msg: booklist.msg
        };
        bookmarkData.update({ userName: userName }, { $pull: { bookmark: a } }, function(err, reply) {
            console.log("deleted");
        })
    }

    function saveBookmarks(booklist, userName, channelID) {
        bookmarkData.findOne({ userName: userName }, function(err, reply) {
            console.log("reply", reply, booklist);
            if (reply == null) {
                let a = {
                    channelid: channelID,
                    sender: booklist.sender,
                    timestamp: booklist.TimeStamp,
                    msg: booklist.msg
                };
                let bm = new bookmarkData({
                    userName: userName,
                    bookmark: a
                });
                bm.save(function(err, rply) {
                    if (err) {
                        console.log("error in saving bookmark");
                    } else {
                        console.log("Successfully data saved in bookmark");
                    }
                    socket.emit("receiveBoomarkHistory", rply);
                })
            } else {
                let a = {
                    channelid: channelID,
                    sender: booklist.sender,
                    timestamp: booklist.TimeStamp,
                    msg: booklist.msg
                };
                bookmarkData.update({ userName: userName }, { $push: { bookmark: a } }, function(err, reply) {
                    console.log("Updated");
                })
            }
        });
    }
    socket.on("bookmarkHistory",function(userName,channelName){
      bookmarkData.find({userName:userName},function(err,reply){
        socket.emit("receiveBoomarkHistory",reply);
      })
    })


    function tokenSearch(username, summary, location, sd, ed) {
        GoogleAToken.findOne({ username: username }, function(err, reply) {
            if (reply == null) {
                socket.emit('noToken', username, summary, location, sd, ed);
            } else {
                //console.log('else ', reply.token);
                gfunction(oauth2Client, username, summary, location, sd, ed);
            }
        });
    }

    function gfunction(oauth2Client, username, summary, location, sd, ed) {
        GoogleAToken.findOne({ username: username }, function(err, reply) {
            if (reply == null) {
                refreshToken(oauth2Client);
            } else {
                oauth2Client.credentials = reply.token;
                createEvent(oauth2Client, summary, location, sd, ed);
            }
        });
    }



    function refreshToken(oauth2Client) {
        oauth2Client.refreshAccessToken(function(err, token) {
            if (err) {
                return;
            }
            oauth2Client.credentials = token;
            storeToken(token);
            createEvent(oauth2Client, summary, location, sd, ed);

        });
    }

    function storeToken(username, token) {
        GoogleAToken.update({ username: username }, { $set: { token: token } }, { upsert: true }, function(err, reply) {});
    };

    function createEvent(auth, summary, location, sd, ed) {
        console.log('sd : ', sd);
        console.log('ed : ', ed);
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
            "reminders": {
                "useDefault": "useDefault"
            }
        };

        calendar.events.insert({
            auth: auth,
            calendarId: 'primary',
            resource: event,
        }, function(err, event) {
            if (err) {
                return;
            }
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
                return;
            }
            var events = response.items;
            if (events.length == 0) {} else {
                for (var i = 0; i < events.length; i++) {
                    var event = events[i];
                    var start = event.start.dateTime || event.start.date;
                }
            }
        });
    }

    function newChannel(username, projectName, channelName, type) {
        //console.log("newChannelEvent parameters : ", username, projectName, channelName);
        let channel = projectName + '#' + channelName;
        let project = projectName + "#general";
        if (type == "public") {

            ChannelInfo.find({ channelName: project }, function(err, reply) {
                addMembers(username, channel, reply[0].members, type);
                UserInfo.findOne({ username: username }, function(err, reply) {
                    socket.emit('updatedChannelList', reply.channelList);
                })
            })

        } else if (type == 'private') {
            UserInfo.findOneAndUpdate({ username: username }, { $push: { channelList: channel } }, function(err, reply) {
                let pn = channel;
                let a = "lat." + pn;
                var obj = {};
                obj[a] = new Date();
                LatList.update({ username: username }, { $set: obj }, function(err, reply) {
                    let a = [];
                    a.push(username);
                    let channelinfo = new ChannelInfo({
                        channelName: channel,
                        members: a,
                        admin: username,
                        requests: [],
                        type: type
                    });
                    channelinfo.save(function(err, reply) {
                        UserInfo.findOne({ username: username }, function(err, reply) {
                            socket.emit('updatedChannelList', reply.channelList);
                        })
                    })
                })
            })
            sub.subscribe(channel);
        }
    }

    function feedbackManager(obj) {
        let feedback = new Feedback({
            name: obj["name"],
            comment: obj['comment']
        });
        feedback.save(function(err, reply) {});
    }

    function handleMessage(channel, message) { //message is text version of the message object.
        message = JSON.parse(message);
        console.log("received in redis topic: ", message);

        if (message.hasOwnProperty('newDM'))
            socket.emit('joinedNewChannel', message);
        else
            socket.emit('takeMessage', channel, message);
    }

    function handleSubscribe(channel, count) { //count is the total number channels user is subscribed to.
        //currently this is empty.
    }

    function handleUnsubscribe(channel, count) { //count is the number of remaining subscriptions.
        pub.publish('channel1', `User with socket id: ${socket.id} has unsubscribed`);
    }
    // FIXME: rewrite without using io
    function handleSendMessage(sender, channelID, msg) { //it will publish to the given channel and put it in database.FIXME:see 50 limit has reached
        let date = new Date();
        let obj = {};
        obj = { 'sender': sender, 'msg': msg, 'TimeStamp': date } //-and if reached put it to mongoDB. Better write this function again.
        pub.publish(channelID, JSON.stringify(obj));
        pushToRedis(channelID, obj);
        let url = "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/976f7fd6-6a76-46c0-9857-6fcc99a99d8b?subscription-key=efd01e4bf7dc443180fcf9145ec03a0b" + "&q=" + msg + "&verbose=true",
            summary = '',
            location = '';
           ajax.get(url).end((error,response)=>{
          if(response){
            //Add Reminder START ---------->
            if(response.body.topScoringIntent.intent === "Add Reminder"){
              if(response.body.entities.length>=1){
                if (response.body.entities[0].type==="builtin.datetime.date") {
                  summary='',location='';
                }
                else if(response.body.entities[0].type==="meeting::summary"){
                  summary = response.body.entities[0].entity;
                }
                else if (response.body.entities[0].type==="meeting::location") {
                  location = response.body.entities[0].entity;
                }
                else if (response.body.entities[1].type==="meeting::summary") {
                  summary = response.body.entities[1].entity;
                }
                else if(response.body.entities[1].type==="meeting::location"){
                  location = response.body.entities[1].entity;
                }
                socket.emit('confirmSetRemainder', response.body.dialog.status.toUpperCase(), summary, location);
              }
            }
            //Add Reminder END ---------->

            //Tasks START ---------->
            else if(response.body.topScoringIntent.intent === "show task"){
              Tasks.findOne({channelName: channelID}, function(err, reply){
                let task=[];
                if (reply!==null) {
                  console.log('tasks : ',reply.tasks);
                  socket.emit('confirmStickyTasks', reply.tasks);
                }
                else {
                  console.log('empty task array');
                  socket.emit('confirmStickyTasks', task);
                }
              });
            }
            //Tasks END ---------->
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

            UserInfo.findOneAndUpdate({ username: currentUser }, { $set: { currentChannel: currentChannelName } }, function(err, reply) {});
        });

    }

    function handlegetUnreadNotification(msg) { //FIXME: Write again.
        client.hgetall(msg.user + "/unreadNotifications", function(err, reply) {
            socket.emit('unreadNotification', reply);
        });
    }

    function handleReceiveChatHistory(msg) {
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
            socket.emit('unreadNotification', value);
        });
    }

    function handleResetNotification(msg) {
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
        client.lrange(msg.channelName, 0, -1, function(err, reply) {
            if (reply == "") {

                socket.emit('pempty', "initial_secondary");

            } else {
                let messages = reply.map((element, i) => {
                    return JSON.parse(element);
                });
                socket.emit('chatHistory', messages, "initial_secondary");
            }
        });
    }

    socket.on('login', function(usrname) {
        //console.log("first line onlt", usrname,projectName);
        currentUser = usrname;
        let lat = null;
        let loginTime = new Date().getTime();
        //currentChannel=projectName+"#general";
        LatList.findOne({ username: usrname }, function(err, res) {
            if (res != null) {
                lat = res.lat;
                //console.log(lat,"This is lat")
            }

            //search the DB for username
            UserInfo.findOne({ username: usrname }, function(err, reply) {
                //console.log(reply.currentChannel,reply.channelList,"Login Event");
                currentChannelName = reply.currentChannel;
                let avatars = {};
                ChannelInfo.findOne({ channelName: currentChannelName }, function(err, rep) {
                    console.log(usrname, currentChannelName, rep.members, "UsserNammeeee");
                    var channelList = reply.channelList;
                    async.each(reply.channelList, function(item, callback) {
                        sub.subscribe(item);
                        let a = item;
                        client.lrange(item, 0, -1, function(err, res) {
                            let count = 0;
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
                        async.each(rep.members, function(member, callback) {
                            UserInfo.findOne({ username: member }, function(err, response) {
                                //console.log(response.avatar);
                                avatars[member] = response.avatar;
                                //console.log(avatars);
                                callback();
                            })

                        }, function(err) {
                            //console.log(channelList,unreadCount,lat,currentChannelName,avatars);
                            socket.emit('channelList', channelList, unreadCount, lat, currentChannelName, avatars);
                        })
                    })

                    // function getAvatars(callback){

                    //}
                    // async.waterfall([getAvatars],function(err,reply){
                    //   console.log(avatars,"Login");

                    // })
                    //client.lpush("###"+usrname,socket);
                    //console.log("Login",avatars);

                });

            });

        })
    })

    socket.on('currentChannel', function(currentChannel, prevChannel, userName) {

        let avatars = {}
        currentChannelName = currentChannel;
        let d = new Date();
        unreadCount[prevChannel] = 0;
        unreadCount[currentChannel] = 0;
        //prevChannelLAT=new Date();
        let prev = 'lat.' + prevChannel;
        let current = 'lat.' + currentChannel;
        let obj = {};
        obj[prev] = new Date();
        obj[current] = new Date();
        LatList.findOneAndUpdate({ username: userName }, { $set: obj }, function(err, reply) {});
        //console.log(currentChannel,"-----")
        ChannelInfo.findOne({ channelName: currentChannel }, function(err, reply) {
            async.each(reply.members, function(member, callback) {
                //console.log(member,"0000");
                UserInfo.findOne({ username: member }, function(err, res) {
                    //console.log(res.avatar);
                    avatars[member] = res.avatar;
                    //console.log(avatars);
                    callback();
                })
            }, function(err) {
                //console.log(currentChannel,prevChannel,prevChannel,d,avatars,"Update");
                socket.emit("updateUnread", currentChannel, prevChannel, d, avatars);

            })
        })

        //console.log(avatars);

    });

    socket.on("getProjectName", function(userName) {
        ChannelInfo.find({}, function(err, reply) {
            var projectList = reply;
            var users = [];
            var projects = [];
            // var usersProjects=[];
            reply.map(function(item) {
                    if (projects.indexOf(item.channelName.split('#')[0]) == -1) {
                        projects.push(item.channelName.split('#')[0]);
                    }
                })
                //usersProjects=projects;

            // UserInfo.findOne({username:userName},function(err,res){
            //    res.channelList.map(function(item){
            //     if(usersProjects.indexOf(item.split('#')[0])==-1){
            //         usersProjects.push(item.split('#')[0]);
            //     }
            // })
            UserInfo.find({}, function(err, reply) {
                //console.log("Users",reply);
                reply.map(function(item) {
                        users.push(item.username);
                    })
                    //console.log(projects,"projects",usersProjects,"List of Projects");
                socket.emit("takeProjectList", projects, users);
            })

        })





    })

    function addMembers(userName, projectName, membersList, type) {
        let project = projectName;
        let obj = {};
        obj[project] = new Date();
        async.each(membersList, function(member, callback) {
            UserInfo.findOneAndUpdate({ username: member }, { $push: { channelList: project } }, function(err, reply) {
                let pn = project;
                let a = "lat." + pn;
                var obj = {};
                obj[a] = new Date();
                LatList.update({ username: member }, { $set: obj }, function(err, reply) {})
                callback();
            });
        }, function(err) {
            let channel = new ChannelInfo({
                channelName: project,
                members: membersList,
                admin: userName,
                requests: [],
                type: type
            });
            channel.save(function(err, reply) {})
        })
    }

    socket.on("addNewUser", function(userName, projectName, membersList, avatar) {
        console.log("Avatar");



        UserInfo.findOne({ username: userName }, function(err, reply) {
            if (reply == null) {
                console.log(avatar, "AAA");
                let a = [];
                a.push(projectName + "#general");
                let user = new UserInfo({
                    username: userName,
                    channelList: a,
                    currentChannel: projectName + "#general",
                    avatar: avatar
                });
                user.save(function(err, reply) {
                    let pn = projectName + "#general";
                    let latob = {};
                    latob[pn] = new Date();
                    let lat = new LatList({
                        username: userName,
                        lat: latob
                    });
                    console.log("Channel Saving");
                    let channel = new ChannelInfo({
                        channelName: projectName + "#general",
                        members: membersList,
                        admin: userName,
                        requests: [],
                        type: "private"
                    });
                    channel.save(function(err, reply) {
                        lat.save(function(err, reply) {
                            let members = membersList;
                            let a = members.indexOf(userName);
                            members = members.splice(a, 1);
                            async.each(membersList, function(member, callback) {
                                UserInfo.findOneAndUpdate({ username: member }, { $push: { channelList: projectName + "#general" } }, function(err, reply) {
                                    let pn = projectName + "#general";
                                    let a = "lat." + pn;
                                    var obj = {};
                                    obj[a] = new Date();
                                    LatList.update({ username: member }, { $set: obj }, function(err, reply) {})
                                });
                            })
                            console.log("Channel Saved");
                        })

                    })
                })
            } else {
                addMembers(userName, projectName + "#general", membersList, "private");
            }
        })

    })

    socket.on("getMembersList", function(channelName) {
        ChannelInfo.find({ channelName: channelName }, function(err, reply) {
            socket.emit("takeMembersList", reply[0].members);
        })
    })

    socket.on("addMembers", function(channelName, membersList) {
        async.each(membersList, function(member, callback) {
            UserInfo.findOneAndUpdate({ username: member }, { $push: { channelList: channelName } }, function(err, reply) {
                let pn = channelName;
                let a = "lat." + pn;
                var obj = {};
                obj[a] = new Date();
                LatList.update({ username: member }, { $set: obj }, function(err, reply) {
                    ChannelInfo.findOneAndUpdate({ channelName: channelName }, { $push: { members: member } }, function(err, reply) {})
                })

            })
        })
    })

    socket.on("leaveGroup", function(projectName, userName) {
        //console.log(projectName,userName,"Inside Leave Group");
        UserInfo.findOne({ username: userName }, function(err, reply) {
            let a = reply.channelList;
            let b = a.indexOf(projectName);
            a.splice(b, 1);
            UserInfo.findOneAndUpdate({ username: userName }, { $set: { channelList: a } }, function(err, reply) {
                ChannelInfo.findOne({ channelName: projectName }, function(err, res) {
                    let c = res.members;
                    let d = c.indexOf(userName);
                    c.splice(d, 1);
                    ChannelInfo.findOneAndUpdate({ channelName: projectName }, { $set: { members: c } }, function(err, reply) {
                        UserInfo.findOne({ username: userName }, function(err, reply) {
                            //console.log(reply,"Emitting Channel List");
                            // reply.channelList = reply.channelList.filter((item, i) => {
                            // if ((item.split('#'))[0] === projectName.split("#")[0]) {
                            // return item;
                            //    }
                            //   });
                            socket.emit('updatedChannelList', reply.channelList);
                        });
                    })
                })
            })
        })

    })

    // socket.on("JoinTeam", function(userName, projectName, avatar) {
    //     console.log(userName, projectName,avatar);
    //     UserInfo.findOne({ username: userName }, function(err, reply) { //see if user there in system or not
    //         if (reply == null) {   //if user not present create userinfo and update the general of project.
    //             let a = [];
    //             a.push(projectName + "#general");
    //             let user = new UserInfo({
    //                 username: userName,
    //                 channelList: a,
    //                 currentChannel: projectName + "#general",
    //                 avatar: avatar
    //             });
    //             user.save(function(err, reply) {
    //                 let pn = projectName + "#general";
    //                 let latob = {};
    //                 latob[pn] = new Date();
    //                 let lat = new LatList({
    //                     username: userName,
    //                     lat: latob
    //                 });
    //                 lat.save(function(err, reply) {
    //                     ChannelInfo.findOneAndUpdate({ channelName: projectName + "#general" }, { $push: { members: userName } }, function(err, reply) {
    //                         socket.emit("Joined");
    //                         console.log("Saved");
    //                     })
    //                 })
    //             })
    //         } else { //if present add general to user and user to general.
    //             UserInfo.findOneAndUpdate({ username: userName }, { $push: { channelList: projectName + "#general" } }, function(err, reply) {
    //                 UserInfo.findOneAndUpdate({ username: userName }, { $set: { currentChannel: projectName + "#general" } }, function(err, reply) {
    //                     let pn = projectName + "#general";
    //                     let a = "lat." + pn;
    //                     var obj = {};
    //                     obj[a] = new Date();
    //                     LatList.update({ username: userName }, { $set: obj }, function(err, reply) {
    //                         ChannelInfo.findOneAndUpdate({ channelName: projectName + "#general" }, { $push: { members: userName } }, function(err, reply) {
    //                             socket.emit("Joined");
    //                         })
    //                     })
    //                 })
    //             })

    //         }
    //     })
    // })
}
