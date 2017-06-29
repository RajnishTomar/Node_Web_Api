var bodyParser = require('body-parser');
var fs = require("fs");
var lodash = require('lodash');
var AWS = require('aws-sdk');

var utility = require('./utility');

module.exports = function(app, db) {

app.use(bodyParser.json());

app.get('/patanjaliProducts', function (req, res) { //list all merchants, testes working fine

   fs.readFile("./" + "patanjali-product.json", 'utf8', function (err, data) {
       const productArray = JSON.parse( data );
       console.log( productArray );
       res.end( JSON.stringify(productArray) );
   });
})

app.post('/updateMerchantPatanjaliProducts', function (req, res) { //update merchant profile data

   reqJson =  req.body;
   console.log( reqJson );
   const key = reqJson["token"];
   console.log(key);
   const updatedDataDict =  reqJson["data"];
   
   fs.readFile("./" + "merchant.json", 'utf8', function (err, data) {
        var data = JSON.parse( data );
        
        merchantDataDict = data[key];
        merchantDataDict["first_name"] = updatedDataDict["first_name"];
        merchantDataDict["last_name"] = updatedDataDict["last_name"];
        merchantDataDict["phone_no"] = updatedDataDict["phone_no"];
        merchantDataDict["location"] = updatedDataDict["location"];
        merchantDataDict["is_phone_verified"] = updatedDataDict["is_phone_verified"];
        merchantDataDict["is_email_verified"] = updatedDataDict["is_email_verified"];
        
        data[key] =  merchantDataDict;
        
        json = JSON.stringify(data);
        fs.writeFile("./" + "merchant.json", json, 'utf8',function(err){
              if(err){ 
                throw err;
                 return;
              }
        }); 
        
        var dict = {"status": "true", "message":"Profile updated successfully"};
        res.end( JSON.stringify(dict));                 
    });
   
   
})


//bottom curly brace is points to module closing
};