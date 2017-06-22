var bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
var fs = require("fs");
var lodash = require('lodash');
var AWS = require('aws-sdk');
var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    
password = '5669543';

module.exports =  {

// parse application/json
//app.use(bodyParser.json()); 

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

};