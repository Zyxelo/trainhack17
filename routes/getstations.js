var express = require('express');

var router = express.Router();

var request = require('request');




router.get('/', function(req,res,next) {
  var Stations = {}
  var xmlRequest = "<REQUEST>" +
    // Use your valid authenticationkey
    "<LOGIN authenticationkey='6255f4ebaa394cce9cbdfcb2c58c6859' />" +
    "<QUERY objecttype='TrainStation'>" +
    "<FILTER/>" +
    "<INCLUDE>Geometry.WGS84</INCLUDE>" +
    "<INCLUDE>AdvertisedLocationName</INCLUDE>" +
    "<INCLUDE>LocationSignature</INCLUDE>" +
    "</QUERY>" +
    "</REQUEST>";
  request.post({
      url: "http://api.trafikinfo.trafikverket.se/v1/data.json",
      headers: {"Content-Type": "text/xml"}, body: xmlRequest},
    function (error, response, body) {
      if (response == null) return;
      try {

        var resp = JSON.parse(response.body).RESPONSE.RESULT[0];
        for (i = 0; i < resp.TrainStation.length; i++) {
          item = resp.TrainStation[i];
          // console.log(item);
          // Save a key/value list of stations
          var latLongArray = item.Geometry.WGS84.split('(')[1].split(')')[0].split(' ');

          Stations[item.LocationSignature] = {name: item.AdvertisedLocationName, lng: latLongArray[0], lat: latLongArray[1] };
          // Create an array to fill the search field autocomplete.

        }

      }
      catch (ex) { }
      res.json(Stations)
  })
});


router.post('/postid', function(req, res, next) {
  console.log(req.body, "req");

  var id = req.body.id;

  console.log(id);
  console.log(id);
  var uniqueList = {};
  var destinations = [];
  console.log("teeest");

  var xmlRequest = "<REQUEST version='1.0'>" +
    "<LOGIN authenticationkey='6255f4ebaa394cce9cbdfcb2c58c6859' />" +
    "<QUERY objecttype='TrainAnnouncement' " +
    "orderby='AdvertisedTimeAtLocation' >" +
    "<FILTER>" +

    "<EQ name='AdvertisedTrainIdent' value='"+id+"' />" +

    "</FILTER>" +
    "<INCLUDE>TechnicalTrainIdent</INCLUDE>" +
    "<INCLUDE>AdvertisedTimeAtLocation</INCLUDE>" +
    "<INCLUDE>LocationSignature</INCLUDE>" +
    "<INCLUDE>FromLocation</INCLUDE>" +
    "<INCLUDE>ToLocation</INCLUDE>" +
    "<INCLUDE>ScheduledDepartureDateTime</INCLUDE>" +
    "</QUERY>" +
    "</REQUEST>";
  console.log(xmlRequest)

  request.post({ url: 'http://api.trafikinfo.trafikverket.se/v1/data.json', headers: {"Content-Type": "text/xml"}, body: xmlRequest }, function (error, response, body) {
    //console.log(response);
    console.log();
      if (response == null) return;
      var resp = JSON.parse(response.body).RESPONSE.RESULT[0]
    console.log(resp.TrainAnnouncement.length);
      try {


        for (i = 0; i < resp.TrainAnnouncement.length; i++) {
          console.log('hej')
          item = resp.TrainAnnouncement[i]

          if (uniqueList[item.LocationSignature] == null) {
            destinations.push(item);
          }

          uniqueList[item.LocationSignature] = item.ScheduledDepartureDateTime;

        }
        console.log(destinations);
        res.status(200).send(destinations);
      } catch (ex) {
      }
    });



});

module.exports = router;
