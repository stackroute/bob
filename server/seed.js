const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
});

let User = require('./model/userchannellist.schema.js');
let Lat = require('./model/lat.schema.js');

for (var i = 1; i <= 10; i++) {
if(i<5){  
   user = new User({
    username : 'user'+i ,
    channelList : ['bob#general', 'bob#dev', 'itzfriday#UI']
  });
  user.save(function(err, reply){

  });}
  else if(i<8){

   user = new User({
    username : 'user'+i ,
    channelList : ['bob#general', 'itzfriday#UI']
  });
  user.save(function(err, reply){

  });
  }
  else{


   user = new User({
    username : 'user'+i ,
    channelList : ['bob#general']
  });
  user.save(function(err, reply){

  });
  }
}

for(var i =1 ; i <= 10 ;i++){

lat = new Lat({
	username: "user"+i,
    lat: { "bob#general" : new Date(),
	   "bob#dev" : new Date(),
	"itzfriday#UI": new Date()
	}
		
});
lat.save(function(err,reply){
});
}
