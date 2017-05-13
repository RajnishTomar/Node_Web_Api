var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer(); 
var app = express();

app.get('/', function(req, res){
   res.render('form');
});

app.set('view engine', 'pug');
app.set('views', './views');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(upload.array()); // for parsing multipart/form-data
app.use(express.static('public'));

app.post('/', function(req, res){
    console.log(req.body);
    res.send("recieved your request!");
});

app.listen(3000);