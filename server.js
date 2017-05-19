var http      = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var fs = require("fs");
var lodash = require('lodash');

var user = {
   "user4" : {
      "name" : "mohit",
      "password" : "password4",
      "profession" : "teacher",
      "id": 4
   }
}

// parse application/json
    app.use(bodyParser.json()); 

app.get('/listUsers', function (req, res) {

//res.end("Hello");
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


app.post('/addUser', function (req, res) {

   reqJson =  req.body;
   
   // First read existing users.
   fs.readFile("./" + "users.json", 'utf8', function (err, data) {
       data = JSON.parse( data );
    
       var keys = Object.keys(reqJson);
       for (var i = 0; i < keys.length; i++) {
            data[keys[i]] = reqJson[keys[i]]
       }
       
       console.log( data );
       json = JSON.stringify(data);
       fs.writeFile("./" + "users.json", json, 'utf8',function(err){
          if(err) throw err;
       });
       
       res.end( JSON.stringify(data));
   });
})

var server = app.listen(3000, function () {

  var host =  server.address().address
  var port =  server.address().port
  console.log("Test app listening at http://%s:%s", host, port)

})