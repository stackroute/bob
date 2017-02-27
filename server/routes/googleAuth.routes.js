const express = require('express')
    , router = express.Router();

//Google Auth ---------->
let google = require('googleapis')
  , calendar = google.calendar('v3')
  , OAuth2Google = google.auth.OAuth2
  , clientId = '616007233163-g0rk4o8g107upgrmcuji5a8jpnbkd228.apps.googleusercontent.com'
  , clientSecret = 'h0DIE4B8pncOEtgMfK2t9rcr'
  , redirect = 'http://bob.blr.stackroute.in/oauth2callback'
  , oauth2Client = new OAuth2Google(clientId, clientSecret, redirect)
  , GoogleAToken = require('./../model/googleatoken.schema.js');

//google auth and reminder set routes ---------->
router.get('/oauth2callback', function(req, res) {
  var code = req.query.code;
  console.log('code : ',code);
  oauth2Client.getToken(code, function(err, gtoken){
    let gToken = gtoken;
    let AccessToken = gtoken.access_token;
    let RefreshToken = gtoken.refresh_token;
    console.log('Token : ',gToken);
    console.log('AccessToken : ', AccessToken);
    console.log('RefreshToken : ', RefreshToken);
    let state= req.query.state
      , obj=JSON.parse(state);
    storeToken(obj.username, gtoken);
    gfunction(oauth2Client, obj.username, obj.summary, obj.location, obj.startDate, obj.endDate);
  });
    res.redirect('http://bob.blr.stackroute.in/#/bob');
});

//function to storeToken in DB ---------->
function storeToken(username, token) {
  GoogleAToken.update({username: username},{$set:{token: token}},{upsert: true}, function(err, reply){
    console.log('reply from storeToken : ',reply);
  });
};


//g-Function ---------->
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
        "reminders": {
          "useDefault": "useDefault",
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
        //console.log('eventCreated', event.htmlLink);
      });
    }

    // function listEvents(auth) {
    //   var calendar = google.calendar('v3');
    //   calendar.events.list({
    //     auth: auth,
    //     calendarId: 'primary',
    //     timeMin: (new Date()).toISOString(),
    //     maxResults: 10,
    //     singleEvents: true,
    //     orderBy: 'startTime'
    //   }, function(err, response) {
    //     if (err) {
    //       console.log('The API returned an error: ' + err);
    //       return;
    //     }
    //     var events = response.items;
    //     if (events.length == 0) {
    //       console.log('No upcoming events found.');
    //     } else {
    //       console.log('Upcoming 10 events:');
    //       for (var i = 0; i < events.length; i++) {
    //         var event = events[i];
    //         var start = event.start.dateTime || event.start.date;
    //         console.log('%s - %s', start, event.summary);
    //       }
    //     }
    //   });
    // }
  }
module.exports = router;
