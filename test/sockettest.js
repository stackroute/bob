var socket =require('./../server/sockets/socket.js');
var io = require('socket.io-client')
, assert = require('assert');
//, expect = require('expect.js');
var expect = require('chai').expect;
var assert = require('chai').assert;
describe('Socket tests for connection', function() {
it("socket testing",function(){
beforeEach(function(done) {
        socket = io.connect('http://bob.blr.stackroute.in', {
            'reconnection delay' : 0
            , 'reopen delay' : 0
            , 'force new connection' : true
        });
        socket.on('connect', function() {
            console.log('connected');
            //done();//connection establishment
        });
        socket.on('disconnect',function(){
            console.log('disconnected...');
        });
       done(); 
        });
        
    });
});
    
// describe("socket",function()
// {
//     this.timeout(15000);
//     it("socket connection",function(){


//     afterEach(function(done) {
        
//         if(socket.connected) {
//             console.log('disconnecting...');
//             socket.disconnect();
//         } 
//         done();
//         this.timeout(15000);
//     setTimeout(done, 15000);
//     });

// });
// });
    


   

