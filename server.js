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
//**********************************User Action methods********************************//


app.get('/listUsers', function (req, res) {

//res.end("Hello");
   fs.readFile("./" + "users.json", 'utf8', function (err, data) {
       console.log( data );
       res.end( data );
   });
})

app.get('/login/:emailId', function (req, res) {
   // First read existing users.
   var emailId =  req.params.emailId

   console.log(emailId);
   
   fs.readFile("./" + "users.json", 'utf8', function (err, data) {
   
       users = JSON.parse( data );
       var keys = Object.keys(users);
       var isExist = false;
       for (var i = 0; i < keys.length; i++) {
         user = users[keys[i]];
         if(user["email_id"] == emailId){
            isExist = true;
            break;
         }
       }
       if (isExist){
          user["status"] = "true";
          res.end( JSON.stringify(user));
       }else{
          var dict = {"status": "false", "message":"Email Id doesn't found."};
          res.end(JSON.stringify(dict));
       } 
   });
})

app.get('/login/:emailId/:password', function (req, res) {
   // First read existing users.
   var emailId =  req.params.emailId
   var password =  req.params.password;
   console.log(emailId);
   console.log(password);
   
   fs.readFile("./" + "users.json", 'utf8', function (err, data) {
       users = JSON.parse( data );
       var key = encrypt(emailId+password);
       var user = users[key];
       user["token"] = key;
       
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
       console.log( reqJson );
    
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
       
       var result = [];
       var dict = {"status": "true", "message":"signup success"};
       result.push(dict)
       res.end( JSON.stringify(result));
   });
})

//*********************************User Action methods end******************************//

//*********************************Home View Methods***********************************//

app.get('/homeProducts', function (req, res) {

//res.end("Hello");
   fs.readFile("./" + "home.json", 'utf8', function (err, data) {
       console.log( data );
       res.end( data );
       
   });
})

app.get('/fruits', function (req, res) {

//res.end("Hello");
   fs.readFile("./" + "fruits.json", 'utf8', function (err, data) {
       console.log( data );
       res.end( data );
       
   });
})

app.get('/vegetables', function (req, res) {

//res.end("Hello");
   fs.readFile("./" + "vegetables.json", 'utf8', function (err, data) {
       console.log( data );
       res.end( data );
       
   });
})

app.get('/plants', function (req, res) {

//res.end("Hello");
   fs.readFile("./" + "plants-category.json", 'utf8', function (err, data) {
       console.log( data );
       res.end( data );
       
   });
})

//*********************************Home View Method Ends***********************************//


//***********************************Cart Methods*****************************************//

app.post('/addToCart', function (req, res) {

   reqJson =  req.body;
   console.log( reqJson );
   // First read existing users.
   fs.readFile("./" + "cart.json", 'utf8', function (err, data) {
       data = JSON.parse( data );
       
       var key = reqJson["token"];
       console.log(key);
       
        var userCartArray = data[key];
        if(userCartArray == null){
            userCartArray = [];
        }
        var newItem =  reqJson[key];
        userCartArray.push(newItem);
            
        //then replace previous cart to newly build card
         data[key] =  userCartArray;
       
       
       json = JSON.stringify(data);
       fs.writeFile("./" + "cart.json", json, 'utf8',function(err){
          if(err){ 
          throw err;
          return;
          }
       });
       
       var dict = {"status": "true", "message":"Added to cart successfully"};
       res.end( JSON.stringify(dict));
   });
})

app.get('/getUserCart/:token', function (req, res) {
   // First read existing users.
   var token =  req.params.token
   console.log(token);
   
   fs.readFile("./" + "cart.json", 'utf8', function (err, data) {
       var cart = JSON.parse( data );
       var userCartItemsArray = cart[token];
       if(userCartItemsArray == null || userCartItemsArray.length == 0){
         var dict = {"status": "false", "message":"No item found"};
          res.end(JSON.stringify(dict));
       }
    
       var responseCart = {};
       console.log( userCartItemsArray );
       
       
       if (userCartItemsArray){
          responseCart["status"] = "true";
          responseCart["item"] = userCartItemsArray
          res.end( JSON.stringify(responseCart));
       }else{
          var dict = {"status": "false", "message":"No item found"};
          res.end(JSON.stringify(dict));
       } 
   });
})

//**********************************Cart Methods End**************************************//

//*********************************Helper Methods***************************************//
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