var express = require('express');
var app = express();
var fs = require("fs");


app.get('/listUsers', function (req, res) {
   fs.readFile("./" + "users.json", 'utf8', function (err, data) {
       console.log( data );
       res.end( data );
   });
})

app.get('/:id', function (req, res) {
   // First read existing users.
   fs.readFile("./" + "users.json", 'utf8', function (err, data) {
       users = JSON.parse( data );
       var user = users["user" + req.params.id] 
       console.log( user );
       res.end( JSON.stringify(user));
   });
})

var server = app.listen(8081, function () {

  var host =  "35.154.43.52"//server.address().address
  var port =  "8081"//server.address().port
  console.log("Test app listening at http://%s:%s", host, port)

})