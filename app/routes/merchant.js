var express = require('express');
var bodyParser = require('body-parser');
var fs = require("fs");
var lodash = require('lodash');

var url = require('url');
var AWS = require('aws-sdk');

var utility = require('./utility');

module.exports = function(app, db) {

app.use(bodyParser.json());
app.use('/public', express.static(__dirname + '/public'));  //to save image file locally before upload to s3
app.use(express.static(__dirname + '/public')); 

app.get('/listMerchants', function (req, res) { //list all merchants, testes working fine

   fs.readFile("./" + "merchant.json", 'utf8', function (err, data) {
       const merchants = JSON.parse( data );
       
       var responseDict = {};
       responseDict["status"] = "true";
       responseDict["message"] = "merchant fetched";
       responseDict["merchants"] = merchants;
       
       console.log( responseDict );
       res.end( JSON.stringify(responseDict) );
   });
})

app.post('/updateProfile', function (req, res) { //update merchant profile data

   reqJson =  req.body;
   console.log( reqJson );
   const key = reqJson["token"];
   const fileName = reqJson["file_name"];
   console.log(key);
   const updatedDataDict =  reqJson["data"];
   
   fs.readFile("./" + fileName+".json", 'utf8', function (err, data) {
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
        fs.writeFile("./" + fileName+".json", json, 'utf8',function(err){
              if(err){ 
                throw err;
                 return;
              }
        }); 
        
        var dict = {"status": "true", "message":"Profile updated successfully"};
        res.end( JSON.stringify(dict));                 
    });
   
   
})

app.get('/merchantCustomer/:merchantKey/', function (req, res) {

     var merchantKey =  req.params.merchantKey
     console.log(merchantKey);
     
     fs.readFile("./" + "merchant-customers.json", 'utf8', function (err, data) {
        data = JSON.parse( data );
        const customerArray =  data[merchantKey];
        var responseArray = [];
        
        if(customerArray == null){
           dict = {"status": "false", "message":"No Customers","list": []};
           res.end( JSON.stringify(dict)); 
           return;
        }
        
        fs.readFile("./" + "users.json", 'utf8', function (err, data) {
               usersJson = JSON.parse( data );
               for (var i = 0; i < customerArray.length; i++) {
                     const customerKey = customerArray[i];
                     responseArray.push(usersJson[customerKey]);
               }
               
               //json = JSON.stringify(responseArray);
               var dict = {};
               if(responseArray.length>0){
                    dict = {"status": "true", "message":"Customers list","list":responseArray};
               }else{
                    dict = {"status": "false", "message":"No Customers","list": []};
               }
               res.end( JSON.stringify(dict));  
        });               
    });

});

//*********************************Home View Methods***********************************//

app.post('/addHomeProducts', function (req, res) { //add products corresponding to merchant, tested working fine

   reqJson =  req.body;
   console.log( reqJson );
   const key = reqJson["token"];
   console.log(key);
   var productsArray = reqJson[key];
   if(productsArray == null){
       var dict = {"status": "false", "message":"Merchant Invalid"};
       res.end( JSON.stringify(dict));
   }
   
   var merchantProductsArray = [];
   for (var i = 0; i < productsArray.length; i++) {
           var productName =  productsArray[i];
           console.log(productName)
           
           var productDict = {};
                productDict["name"] = productName;
                productDict["url"] = "https://s3.ap-south-1.amazonaws.com/sabjibazzar/" + productName + ".jpg";
                
            merchantProductsArray.push(productDict);
    }
    
    fs.readFile("./" + "home.json", 'utf8', function (err, data) {
        data = JSON.parse( data );
        data[key] =  merchantProductsArray;
                
        json = JSON.stringify(data);
        fs.writeFile("./" + "home.json", json, 'utf8',function(err){
              if(err){ 
                throw err;
                 return;
              }
        }); 
        
        var dict = {"status": "true", "message":"Products Added successfully"};
        res.end( JSON.stringify(dict));                 
    });
   
   
})

app.post('/addPatanjaliProducts', function (req, res) { //add products corresponding to merchant, tested working fine

   reqJson =  req.body;
   console.log( reqJson );
   const key = reqJson["token"];
   console.log(key);
   var productsArray = reqJson["item"];
   
   if(productsArray == null || key == null){
       var dict = {"status": "false", "message":"Merchant Invalid"};
       res.end( JSON.stringify(dict));
   }
   
   fs.readFile("./" + "merchant-patanjali.json", 'utf8', function (err, data) {
        data = JSON.parse( data );
        data[key] =  productsArray;
                
        json = JSON.stringify(data);
        fs.writeFile("./" + "merchant-patanjali.json", json, 'utf8',function(err){
              if(err){ 
                throw err;
                 return;
              }
        }); 
        
        var dict = {"status": "true", "message":"Products Added successfully"};
        res.end( JSON.stringify(dict));                 
   });
   
   
})

app.get('/homeProducts/:merchantKey/', function (req, res) { //merchant products. tested working fine

   var merchantKey =  req.params.merchantKey
   console.log(merchantKey);
//res.end("Hello");
   fs.readFile("./" + "home.json", 'utf8', function (err, data) {
       var data = JSON.parse( data );
       console.log( data );
       const productsArray = data[merchantKey];
       if(productsArray == null){
         res.end( JSON.stringify([]) )
       }
       const responseArrayStr  =  JSON.stringify(productsArray)
       res.end( responseArrayStr );
       
   });
})

app.get('/productCategoryItems/:fileName/:merchantKey/', function (req, res) { //merchant items under selected category, tested working fine

   var merchantKey =  req.params.merchantKey
   var fileName =  req.params.fileName
   console.log( fileName );
   fs.readFile("./" + fileName+".json", 'utf8', function (err, data) {
       var data = JSON.parse( data );
       console.log( data );
       const responseArray = data[merchantKey];
       if(responseArray==null){
          var dict = {"status": "true", "message":"No item yet added."};
          const arr = [];
          arr.push(dict);
          res.end( JSON.stringify(arr))
       }else{
         res.end( JSON.stringify(responseArray))
       }  
   });
})

app.post('/addMerchantProductItems', function (req, res) { //add items under selected category for merchant, 

   reqJson =  req.body;
   console.log( reqJson );
   const fileName= reqJson["file_name"];
   console.log( fileName );
   // First read existing users.
   fs.readFile("./" + fileName+".json", 'utf8', function (err, data) {
       data = JSON.parse( data );
       
       var key = reqJson["token"];
       console.log(key);
       
        var merchantFruitsArray = []//always replace the old one;
        
        var newFruitsArray =  reqJson[key]; 
         for (var i = 0; i < newFruitsArray.length; i++) {
           var dataDict =  newFruitsArray[i];
           merchantFruitsArray.push(dataDict);
        }
        
        data[key] = merchantFruitsArray;
        json = JSON.stringify(data);
       
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


app.post('/deleteMerchantProductItems', function (req, res) { //delete item for merchant for selected category, tested working fine

   reqJson =  req.body;
   console.log( reqJson );
   const fileName= reqJson["file_name"];
   console.log( fileName );
   // First read existing users.
   fs.readFile("./" + fileName+".json", 'utf8', function (err, data) {
       data = JSON.parse( data );
       
       var key = reqJson["token"]; //merchant key
       console.log(key);
       console.log(data);
       
       var merchantItemArray = data[key];
    
        var itemDict =  reqJson[key]; //item to delete
        const itemName =  itemDict["name"];
        var notFoundFlag = true;
         for (var i = 0; i < merchantItemArray.length; i++) {
           var dataDict =  merchantItemArray[i];
           if(itemName == dataDict["name"]){
              merchantItemArray.splice(i, 1);
              notFoundFlag = false;
              break;
           }  
        }
        
        if(notFoundFlag){
            var dict = {"status": "true", "message":"There is some issue in deleting item, please try after some time."};
            res.end( JSON.stringify(dict));
        }
        
        data[key] = merchantItemArray;
        json = JSON.stringify(data);
       
       fs.writeFile("./" + fileName+".json", json, 'utf8',function(err){
          if(err){ 
          throw err;
          return;
          }
       });
       var dict = {"status": "true", "message":"Deleted successfully"};
       res.end( JSON.stringify(dict));
   });
})

app.post('/editMerchantProductCategoryItems', function (req, res) { //to add more items under different product category-fruits,vegetables,plants,patanjali
   
   reqJson =  req.body;
   console.log( reqJson );
   const fileName= reqJson["file_name"];
   const merchantKey = reqJson["token"];
   console.log( fileName );
   // First read existing users.
   fs.readFile("./" + fileName+".json", 'utf8', function (err, data) {
       var dataDict = JSON.parse( data );
       var dataArray = dataDict[merchantKey];
       var newItem =  reqJson["item"];
    
       var position =  utility.checkIfExist(dataArray,newItem["name"]);
       if(position != -1){//might be merchant editing the already present item
          dataArray[position] = newItem;
       }else{
         dataArray.push(newItem);
       }
       
       dataDict[merchantKey] = dataArray;
    
        json = JSON.stringify(dataDict);
       
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

//*********************************UPLOAD IMAGE TO S3***************************************//

app.post('/postImage', function (req, res) {

     var requestHeaders =  req.headers;
     const accessKey = requestHeaders['access-key'];
     const secretKey = requestHeaders['secret-key'];
     console.log(requestHeaders);
     AWS.config.update({
      accessKeyId: accessKey,  
      secretAccessKey: secretKey,  
      "region": "ap-south-1" 
    });
    
    let nm = Date.now();
    filePath = __dirname + '/public/' + nm + '.png';
    
    var wstream = fs.createWriteStream(filePath);
    req.on('data', function(data) {
        console.log('get data.')
        wstream.write(data);
    });
    
    req.on('end', function (){
        wstream.end();
        console.log('File saved.')
        uploadToS3(nm,filePath, res);  
    });

})

function uploadToS3(fileName,sourceUrl, res){

  // Create a bucket and upload something into it
  var bucketName = 'sabjibazzar';
  var keyName = fileName+'.png';
      
  // Create an S3 client
  var s3 = new AWS.S3({params: {Bucket: bucketName, Key: keyName}});
      
  s3.createBucket({Bucket: bucketName}, function() {

  var body = fs.createReadStream(sourceUrl);// fs.createReadStream('/Users/rajnishtomar/Desktop/coconut.png')
               //.pipe(zlib.createGzip());
  s3.upload({Body: body})
    .on('httpUploadProgress', function(evt) { 
         console.log(evt);
     })
     .send(function(err, data) { 
          console.log(err, data) 
          if(err == null){
             
             fs.unlink(sourceUrl, function(status){
             });
             var dict = {"status": "true", "message":"Added successfully", "image_url":data["Location"]};
             res.end( JSON.stringify(dict));
          }else{
             var dict = {"status": "false", "message":"Not added successfully"};
             res.end( JSON.stringify(dict));
          }
     });
  
  });
}

//*********************************UPLOAD IMAGE TO S3 ENDS***************************************//

//bottom curly brace is points to module closing
};
