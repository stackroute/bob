const request = require('superagent')

const baseURL = req => u => `${req.protocol}://${req.app.get('host') + ':' + req.app.get('port')}${u}`
function localRequest(req) {
  var base = baseURL(req)
  var doRequest = (method, u) => request(method, base(u)).set('Cookie', req.headers.cookie)
  return ['options', 'head', 'get', 'post', 'put', 'patch', 'delete'].reduce((r, m) => {
    r[m] = r.bind(r, m)
    return r
  }, doRequest)
}

request.base = localRequest

module.exports = request
