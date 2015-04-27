console.log("== server.js ")


var MBTA_API_KEY = "d_PLQUlAl0yu6cgQ_ITCMA";
var MBTA_API_ROOT_URL = "http://realtime.mbta.com/developer/api/v2/";

function sendRequests() {
  getVehiclesByRoute('Green-B');
  getVehiclesByRoute('Green-C');
  getVehiclesByRoute('Green-D');
  getVehiclesByRoute('Green-E');
  getVehiclesByRoute('Red');
  getVehiclesByRoute('Orange');
  getVehiclesByRoute('Blue');  
}

Meteor.startup(function () {
  console.log("Meteor.startup")

  Trips.remove({});

  sendRequests();
  var useTimer = false;
  if(useTimer) {
    Meteor.setInterval(sendRequests(), 10000);
  }
});

function getVehiclesByRoute(routeId) {
  var url = MBTA_API_ROOT_URL + "vehiclesbyroute" + "?api_key=" + MBTA_API_KEY + "&route=" + routeId + "&format=json";
  
  HTTP.get(url,
    function (error, result) {
      if (!error) {
        var content = JSON.parse(result.content);
        //console.log('Got it: ' + JSON.stringify(content, null, 2));

        var oldTripIds = Trips.find({route_id: content.route_id}).map(function(trip) {
          return trip.trip_id;
        });
        var newTripIds = [];

        content.direction.forEach(function(direction) {
          direction.trip.forEach(function(trip) {
            trip.route_id = content.route_id;
            //console.log('            ' + trip.trip_id + ' vehicle= ' + trip.vehicle.vehicle_id + ' ' + content.route_id)

            Trips.upsert({ trip_id: trip.trip_id }, trip, { upsert: true });
            newTripIds.push(trip.trip_id);
          })
        });

        //console.log('oldTripIds: ' + JSON.stringify(oldTripIds))
        //console.log('newTripIds: ' + JSON.stringify(newTripIds))

        // Remove trips that were not included in this update.  Assume they've either gone
        // underground or have been taken out of service etc...
        oldTripIds.forEach(function(trip_id) {
          if(newTripIds.indexOf(trip_id) === -1) {
            //console.log('--Removing: ' + trip_id)
            Trips.remove({trip_id: trip_id})
          }
        })
      }
      else {
        console.log("API request error: " + error)
      }
    });
}


