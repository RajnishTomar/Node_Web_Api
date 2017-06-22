var http      = require('http');
var express = require('express');
var bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
var app = express();
var fs = require("fs");
var lodash = require('lodash');
var AWS = require('aws-sdk');

require('./app/routes')(app, {});
//var utility = require('./app/routes/utility');

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

app.get('/forgotPassword/:emailId/:isMerchant/', function (req, res) {
   // First read existing users.
   var emailId =  req.params.emailId
   var isMerchant = req.params.isMerchant;
   
   console.log(emailId);
   console.log(isMerchant);
   
   var fileName = "users.json";
   if(isMerchant == "true"){
      fileName = "merchant.json";
   }
   fs.readFile("./" + fileName, 'utf8', function (err, data) {
   
       users = JSON.parse( data );
       var keys = Object.keys(users);
       var isExist = false;
       for (var i = 0; i < keys.length; i++) {
       
         if(keys[i] == "customers") {
            continue;
         }
         var user = users[keys[i]];
         if(user["email_id"] == emailId){
            isExist = true;
            break;
         }
       }
       if (isExist){
       var responsedata = {};
          sendEmailTo(emailId,user["password"], res);
       }else{
          var dict = {"status": "false", "message":"Email Id doesn't found."};
          res.end(JSON.stringify(dict));
       } 
   });
})

app.get('/login/:emailId/:password/:isMerchant/', function (req, res) {
   // First read existing users.
   var emailId =  req.params.emailId
   var password =  req.params.password;
   var isMerchant = req.params.isMerchant;
   console.log(emailId);
   console.log(password);
   console.log(isMerchant);
   
   var fileName = "users.json";
   if(isMerchant == "true"){
      fileName = "merchant.json";
   }
   
   fs.readFile("./" + fileName, 'utf8', function (err, data) {
       users = JSON.parse( data );
       var key = encrypt(emailId+password);
       var user = users[key];
       if (user){
           console.log( user );
           user["token"] = key;
           user["status"] = "true";
          res.end( JSON.stringify(user));
       }else{
          var dict = {"status": "false", "message":"Invalid login credentials"};
          res.end(JSON.stringify(dict));
       } 
   });
})


app.post('/addUser', function (req, res) {

   var isMerchant = false;
   var data = {};
   reqJson =  req.body;

   for (var i = 0; i < reqJson.length; i++) { //this array will always has single element
           var dataDict =  reqJson[i];
           if(dataDict["is_merchant"] == "true"){
               isMerchant = true
           }
   }

   if(isMerchant){
     
     // First read existing merchants.
       fs.readFile("./" + "merchant.json", 'utf8', function (err, data) {
              data = JSON.parse( data );
              console.log( reqJson );
    
              //var keys = Object.keys(reqJson);
              for (var i = 0; i < reqJson.length; i++) {
                  var dataDict =  reqJson[i];
                  var key = encrypt(dataDict["email_id"]+dataDict["password"]);
                  data[key] = reqJson[i];
                  var merchantDict = data[key];
                  merchantDict["customers"] = {};//on merchant sign up  there blank dictionary for customers
                  data[key] = merchantDict;
              }
       
              json = JSON.stringify(data);
              fs.writeFile("./" + "merchant.json", json, 'utf8',function(err){
                     if(err) throw err;
              });

       });

   }else{

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

       });
   }
   
   var result = [];
       var dict = {"status": "true", "message":"signup success"};
       result.push(dict)
       res.end( JSON.stringify(result));
   
})

//*********************************User Action methods end******************************//

//*********************************Home View Methods***********************************//

app.get('/productCategoryItems/:fileName/', function (req, res) {//will be fruits, vegetables,plants,patanjali,grocery

   var fileName =  req.params.fileName
   fs.readFile("./" + fileName+".json", 'utf8', function (err, data) {
       console.log( data );
       res.end( data );
       
   });
})

app.post('/addProductCategoryItems', function (req, res) { //to add/edit more items under different product category-fruits,vegetables,plants,patanjali
   
   reqJson =  req.body;
   console.log( reqJson );
   const fileName= reqJson["file_name"];
   console.log( fileName );
   // First read existing users.
   fs.readFile("./" + fileName+".json", 'utf8', function (err, data) {
       var dataArray = JSON.parse( data );
       var newItem =  reqJson["item"];
       newItem["cart_status"] = "false";
       
       var position =  checkIfExist(dataArray,newItem["name"]);
       if(position != -1){//might be merchant editing the already present item
          dataArray[position] = newItem;
       }else{
         dataArray.push(newItem);
       }
       
    
        json = JSON.stringify(dataArray);
       
       fs.writeFile("./" + fileName+".json", json, 'utf8',function(err){
          if(err){ 
          throw err;
          return;
          }
       });
       var dict = {"status": "true", "message":"Added successfully"};
       res.end( JSON.stringify(dict));
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
        
       var position =  checkIfExist(userCartArray,newItem["name"]);
       if(position != -1){
          console.log("position" + position);
          var item = userCartArray[position];
          item["quantity"] = newItem["quantity"];
          item["unit_count"] = newItem["unit_count"];
          item["is_selected_for_checkout"] = "true"
          userCartArray[position] = item;
       }else{
          newItem["is_selected_for_checkout"] = "true"
          userCartArray.push(newItem);
       }
       
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

app.post('/editCartItem', function (req, res) {

    reqJson =  req.body;
   console.log( reqJson );
   // First read existing users.
   fs.readFile("./" + "cart.json", 'utf8', function (err, data) {
       data = JSON.parse( data );
       
       var key = reqJson["token"];
       
       var userCartArray = data[key];
        if(userCartArray == null){
            userCartArray = [];
        }
        var itemName =  reqJson["name"];
       var updateType =  reqJson["type"];
       var userAction = ""
       if(updateType == "edit"){
         userAction = reqJson["item_checkbox_status"]; //either true or false
       }
       console.log(key);
       console.log(updateType);
       console.log(userAction);
       
       var position =  checkIfExist(userCartArray,itemName);
       if(position != -1){ //it will never be -1 as item exist in cart, we are just editing that
          console.log("position" + position);
          if(updateType == "delete"){//delete item
              userCartArray.splice(position, 1);
          }else{
             var item = userCartArray[position];
             item["is_selected_for_checkout"] = userAction;
             userCartArray[position] = item;
          }
       }
       
       //then replace previous cart to newly build card
         data[key] =  userCartArray;
       
       json = JSON.stringify(data);
       fs.writeFile("./" + "cart.json", json, 'utf8',function(err){
          if(err){ 
          throw err;
          return;
          }
       });
       
       
       
       var dict = {"status": "true", "message":"Cart Edited successfully"};
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
       
       
       if (userCartItemsArray != null){
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


//**********************************Payu sUrl and fUrl post methods*********************************//

// Path to success :D, YAY!
app.post('/success', function (req, res) {
   // First read existing users.
   res.send("Success!")
    
});

// :P My payment failed!
app.post('/failure', function (req, res) {
    res.send("OOPS payment failed!")
});

//*******************************Payu methods end****************************************//

//*********************************Helper Methods***************************************//
function checkIfExist(userCartArray, itemName){

   console.log("and item name is : ");
   console.log(itemName);
   
   for (var i = 0; i < userCartArray.length; i++) {
           var dataDict =  userCartArray[i];
           console.log(dataDict["name"])
            if(itemName == dataDict["name"]){
                console.log("Done");
                return i;
            }
    }
   

   return -1;

}
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

function modifyFile(categoryName, itemName){

   console.log("selected category is ");
   console.log(categoryName);
   console.log("and item name is : ");
   console.log(itemName);
   
   if(categoryName == "Fruits"){

     fs.readFile("./" + "fruits.json", 'utf8', function (err, data) {
          var json = JSON.parse( data ); 
         return writeJsonToFile(json,itemName,"fruits.json");
          
     });

   }else if(categoryName == "Vegetables"){

      fs.readFile("./" + "vegetables.json", 'utf8', function (err, data) {
          var json = JSON.parse( data );
         return  writeJsonToFile(json,itemName,"vegetables.json");
       
       });

   }else if(categoryName=="Plants"){

        fs.readFile("./" + "plants-category.json", 'utf8', function (err, data) {
        var json = JSON.parse( data );
             console.log( data );
        
        });

   }

}

function writeJsonToFile(jsonArray,itemName,fileName){

   for (var i = 0; i < jsonArray.length; i++) {
           var dataDict =  jsonArray[i];
           console.log(dataDict["name"])
            if(itemName == dataDict["name"]){
              dataDict["cart_status"] = "true";
              console.log(dataDict["cart_status"]);
              json[i] = dataDict;
              
             fs.writeFile("./" + fileName, json, 'utf8',function(err){
               if(err){ 
                 throw err;
                 return;
               }
             });
             console.log("Done");
           return true;;
       }
            
  }
  
  return false;

}

function sendEmailTo(email, password, res){
   // create reusable transporter object using the default SMTP transport
   let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // secure:true for port 465, secure:false for port 587
        auth: {
             user: 'sabzi.bazaar2017@gmail.com',
             pass: 'Raju5669543#'
        }
    });
    
    // setup email data with unicode symbols
    let mailOptions = {
        from: 'sabzi.bazaar2017@gmail.com', // sender address
        to: email, // list of receivers
        subject: 'Sabji bazaar login password', // Subject line
        text: 'your password : ' + password, // plain text body
        html: '' // html body
    };
    
    // send mail with defined transport object
   transporter.sendMail(mailOptions, (error, info) => {
        var  responsedata = {};
        
        if (error) {
             console.log(error);
             responsedata["status"] = "false";
             responsedata["message"] = "Right now we are unable to sent your password, please try after sometime."
             res.end( JSON.stringify(responsedata));
        }

        responsedata["status"] = "true";
        responsedata["message"] = "we have send you a mail with your login password, please check your mail."
        res.end( JSON.stringify(responsedata));
        console.log('Message %s sent: %s', info.messageId, info.response);
   });
}

var server = app.listen('3000', function () {

  var host =  server.address().address
  var port =  server.address().port
  console.log("Sabji Bazar App listening at http://%s:%s", host, port)

})