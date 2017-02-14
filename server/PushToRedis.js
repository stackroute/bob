var mongoose = require('mongoose');
var ChatHistorymodel = require('./model/chathistory.schema.js');
var db = require('./connections/dbconnect.js'); //creating a connection to mongodb
var client = require('./connections/redisclient.js');



module.exports = function(channelID,ob){




client.lpush(channelID, JSON.stringify(ob),
    function(err, reply) { 
        console.log(reply);
        if (reply > 50) {

            client.lrange(channelID, 0, -1, function(err, reply) {
                let messages = reply.map((element, i) => {
                    return JSON.parse(element);
                });
                let channel = channelID;
                let previousid;

                ChatHistorymodel.find({}).sort({ _id: -1 }).limit(1).exec((err, reply) => {
                    //  console.log(reply);

                    if (reply.length === 0) {

                        page1 = new ChatHistorymodel({
                            channelname: channel,
                            msgs: messages,
                            p_page: null,
                            n_page: null
                        });
                        page1.save(function(err, reply) {
                            console.log('reply from save db : ', reply);
                            ChatHistorymodel.find({}, function(err, reply) {
                                console.log("reply from findall", reply);
                            });

                            client.del(channelID);
                        });

                    } else {
                        previousid = reply[0]._id;
                        page1 = new ChatHistorymodel({
                            channelname: channel,
                            msgs: messages,
                            p_page: previousid,
                            n_page: null
                        });
                        page1.save(function(err, reply) {
                            console.log('reply from save db : ', reply);
                            ChatHistorymodel.find({}, function(err, reply) {
                                console.log("reply from findall", reply);
                            });
                            client.del(channelID);
                        });
                    }
                });
            });
        }
    });



}
