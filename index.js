var express = require('express');
var bodyParser=require('body-parser');
var WebSocket=require('ws');
var nmea =require('nmea-0183');
var socket=require('socket.io');
var path=require('path');
var getstations = require('./routes/getstations');


const app = express();


// Use bodyparser to handle the parsing of JSON (for all routes)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// Allow requests from the front end server


app.use(express.static('public'));




app.get('/',function(req,res){

  res.sendFile(path.join(__dirname+'/index.html'));

});

app.use('/getstations', getstations);



const server = app.listen(process.env.PORT || 8080, () => {
  console.info('Express listening on port', process.env.PORT || 8080);
});

const io = socket(server);





var testObject = [];
const ws = new WebSocket('wss://api.oxyfi.com/trainpos/listen?v=1&key=7f2aeb563f024f778c5d27f7e1003f08');

ws.on('message', (data) => {

  var GPGGAObject = nmea.parse(data)
  var trainInfo = data.split(',');

  GPGGAObject.trainID = trainInfo[16].split('.')[0];
  GPGGAObject.publicTrainID = trainInfo[16];
  if (trainInfo[16]) {
    io.emit('hej', JSON.stringify(GPGGAObject, null, 2));
  }
})