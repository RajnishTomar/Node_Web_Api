var http      = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var fs = require("fs");
var lodash = require('lodash');
// Nodejs encryption with CTR
var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
password = '5669543';

// parse application/json
    app.use(bodyParser.json()); 

app.get('/listUsers', function (req, res) {

//res.end("Hello");
   fs.readFile("./" + "users.json", 'utf8', function (err, data) {
       console.log( data );
       res.end( data );
   });
})

app.get('/:emailId/:password', function (req, res) {
   // First read existing users.
   var emailId =  req.params.emailId
   var password =  req.params.password;
   console.log(emailId);
   console.log(req.params.password);
   
   fs.readFile("./" + "users.json", 'utf8', function (err, data) {
       users = JSON.parse( data );
       var key = encrypt(emailId+password);
       var user = users[key];
       
       console.log( user );
       if (user){
          user["status"] = "true";
          res.end( JSON.stringify(user));
       }else{
          var dict = {"status": "false", "message":"Invalid login credentials"};
          res.end(JSON.stringify(dict));
       } 
   });
})


app.post('/addUser', function (req, res) {

   reqJson =  req.body;
   
   // First read existing users.
   fs.readFile("./" + "users.json", 'utf8', function (err, data) {
       data = JSON.parse( data );
    
       //var keys = Object.keys(reqJson);
       for (var i = 0; i < reqJson.length; i++) {
           var dataDict =  reqJson[i];
            var key = encrypt(dataDict["email_id"]+dataDict["password"]);
            data[key] = reqJson[i];
       }
       
       json = JSON.stringify(data);
       fs.writeFile("./" + "users.json", json, 'utf8',function(err){
          if(err) throw err;
       });
       
       console.log( data );
       var dict = {"status": "true", "message":"signup success"};
       res.end( JSON.stringify(dict));
   });
})

function encrypt(text){
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}

function decrypt(text){
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

var server = app.listen(3000, function () {

  var host =  server.address().address
  var port =  server.address().port
  console.log("Sabji Bazar App listening at http://%s:%s", host, port)

})