# superagent-relative
Make server-side requests to relative URLs with superagent

### [superagent docs](https://visionmedia.github.io/superagent/)

When working with superagent on the server, it sometimes can be necessary to make requests to your own server. However, unlike when working on the client, you must specify an absolute path since superagent does not have context about where it is requesting from. This library aims to make it simpler to make requests to your own server from routes inside your server.

Note that while this will likely work with any server using the `http` or `https` core node modules, it has only been tested using express routes.

## functionality:

Requiring `superagent-relative` returns a standard superagent instance, which can be used normally. In addition, it adds a method called `base`, which will return a curried method so you can "base" your requests on an incoming `req` object.

## usage:

`npm install --save superagent-relative`

```javascript
var request = require('superagent-relative')
var app = require('express')()

// this is the URL that we'll request from our other route.
app.get('/some-url', (req, res) => res.json({ success: true }))

app.get('/alias', (req, res, next) => {
  // we can add the context of our req object to superagent by calling request.base
  var r = request.base(req)
  // now, our `r` object acts like a superagent instance on the client - you can use absolute URLs here without specifying a full path:
  r.get('/some-url')
    .end((err, response) => {
      if (err) return next(err)
      res.json({
        // the response body will be the above response ({ success: true })
        response: response.body,
        // the url will be the full path to our server, in this case defined by what we pass to app.listen()
        url: response.request.url
      })
    })
})

app.listen(3000, '0.0.0.0')
```

Of course, you can skip the `.base` method with the same instance if you want to request a full url:

```javascript
var request = require('superagent-relative')

request
  .get('http://google.com')
  .end((err, res) => {
    console.log(err, res && res.body)
  })
```

## tests:

This lib comes with a suite of tests that may help clarify functionality. You can see them in the /test folder, and run them by running `npm test`.
