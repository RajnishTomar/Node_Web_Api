var http      = require('http');

var express   = require('express');

var app    = express();


app.get('/', function(req, res){
  
    res.send("Hello World!");
  
});

console.log('starting the Express (NodeJS) Web server');
app.listen(3000);
console.log('Webserver is listening on port 3000');