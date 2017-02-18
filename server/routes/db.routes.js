var express = require('express')
var router = express.Router()
var client = require('./../connections/redisclient.js');
var mongoose = require('mongoose');
const db = require('./../connections/dbconnect.js');
const Tiles = require('./../model/tile.schema.js');
const Users = require('./../model/userinfo.schema.js');
const bodyParser = require('body-parser');



router.use(bodyParser.urlencoded({ extended: false }))

router.use(bodyParser.json())


router.get('/user/:userId/channels',function(req,res){

	console.log("User id is : ",req.params.userId);
	let userId = req.params.userId;
	Users.find({username:userId},function(err,reply){
		 if (reply === undefined || reply.length == 0) {
                        console.log("User : " + userId + " not found.");
                        res.send({ result: false, status: "User : " + userId + " not found." });
                    } else {
                    	res.send({result:true,data:reply[0].channelList});
                    }
	});


});


module.exports = router;




/*


req =>
http://172.23.238.164:8000/user/manojadd
reply->
{
  "result": true,
  "data": [
    "bob#general"
  ]
}

*/