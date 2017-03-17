
var options = {
  host: 'github.wdf.sap.corp',
  port: 443,
  path: '/api/v3/search/issues?q=author%3Ai820195+repo%3ANorman%2Fbuild-prototype-editors+is%3Aopen',
  method: 'GET'
};

http.request(options, function(res) {
  console.log('STATUS: ' + res.statusCode);
  console.log('HEADERS: ' + JSON.stringify(res.headers));
  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    console.log('BODY: ' + chunk);
  });
}).end();
