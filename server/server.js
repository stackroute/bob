const express = require('express')
    , app = express()
    , bodyParser = require('body-parser')
    , cookieParser = require('cookie-parser')
    , path = require('path')
    , server = require('http').Server(app)
    , io = require('socket.io').listen(server)
    , client = require('./connections/redisclient.js')
    , mongoose = require('mongoose')
    , socket = require('./sockets/socket.js')
    , db = require('./connections/dbconnect.js');
    var static=require('express-static');

//Routers
const TilesRouter = require('./routes/tiles.routes.js')
    , DbRouter = require('./routes/db.routes.js')
    , githubRouter = require('./routes/githubAuth.routes.js')
    , googleRouter = require('./routes/googleAuth.routes.js');

//app
console.log(path.resolve(__dirname+'/../'));
app.use('/static',express.static(path.resolve(__dirname+'/../')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  console.log(req.body, "this si the body of request");

  next();
});
app.use('/', TilesRouter);
app.use('/', DbRouter);
app.use('/', githubRouter);
app.use('/', googleRouter);
app.get('/', function(req, res) {
    console.log("got a request");
    //res.send("Got");
    res.sendFile(path.resolve(__dirname + "/../index.html"));
});
app.get('/index.js', function(req, res) {
    console.log("got a request");
    res.sendFile(path.resolve(__dirname + "/../index.js"));
});

//MongoDB connection ---------->
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
