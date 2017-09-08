import config from './config';
import express from 'express';
import locationRoutes from './routes/location';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import WebSocket from 'ws';
import nmea from 'nmea-0183';
import socket from 'socket.io';
import socketHandler from './socket/socket';
import ioClient from 'socket.io-client';

const app = express();


// Use bodyparser to handle the parsing of JSON (for all routes)
app.use(bodyParser.json());


// Allow requests from the front end server
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Authorization, Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
  res.header("Access-Control-Allow-Methods", "GET, PUT, OPTIONS, POST, DELETE");
  next();
});


// Set up mongoDB
mongoose.Promise = global.Promise;
mongoose.connect(config.mongodbUri, (error) => {
  if (error) {
    throw error;
  }
});




app.use('/location', locationRoutes);

const server = app.listen(config.port, () => {
  console.info('Express listening on port', config.port);
});

const io = socket(server);


// set up socket.io
io.on('connection', socketHandler);




const ws = new WebSocket('wss://api.oxyfi.com/trainpos/listen?v=1&key=7f2aeb563f024f778c5d27f7e1003f08');

ws.on('message', (data) => {

  var GPGGAObject = nmea.parse(data)
  var trainInfo = data.split(',');
  GPGGAObject.trainID = trainInfo[14];
  GPGGAObject.publicTrainID = trainInfo[16];
  io.emit('hej', JSON.stringify(GPGGAObject, null, 2));
})