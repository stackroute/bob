var express = require('express')
var router = express.Router()
var client = require('./../connections/redisclient.js');
var mongoose = require('mongoose');
const db = require('./../connections/dbconnect.js');
const Tiles = require('./../model/tile.schema.js');
const Users = require('./../model/userinfo.schema.js');
const Channels=require('./../model/channelinfo.schema.js');
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

router.get("/add/:projectName/channel/:channelName",function(req,res){
  let a=req.params.projectName+"#"+req.params.channelName;
  let b=req.params.projectName+"#general";
  let allUsers=[];
  let channelUsers=[];
  Channels.findOne({channelName:b},function(err,reply){
   allUsers=reply.members;
       Channels.findOne({channelName:a},function(err,reply){
          channelUsers=reply.members;
          channelUsers.map((item,i)=>{
          if(allUsers.indexOf(item)!=-1){
            allUsers.splice(allUsers.indexOf(item),1)
          }
        })
        res.send({result:true,data:allUsers})
  })

  })
  
  
})

router.patch('/channels/:channelName/user/:userName', function(req, res) {
    console.log("Channel Name is :", req.params.channelName,"userName is :",req.params.userName);
    let a=req.params.channelName+"#general";
    Channels.find({channelName:a},function(err,rep){
      console.log(rep);
      if(rep[0].members.indexOf(req.params.userName)!=-1){
        return res.send({result:false,status:"You are already part of this team"})
      }
      else if(rep[0].requests.indexOf(req.params.userName)==-1){
        Channels.findOneAndUpdate({ channelName: a },{$push:{requests:req.params.userName}}, function(err, reply) {
         return res.send({result:true,status:"Your request has been sent to Admin"});
    })
      }
      else{
        return res.send({result:false,status:"You have already requested "});
      }
    })
    
   
})
module.exports = router;

