
var requestIntervalHandle = null;


Meteor.startup(function () {
  console.log("Vehicles:Meteor.startup")

  Trips.remove({});
});

var serverStatus = {
  errorCode: 0,
  errorMessage: ''
}

function getVehiclesByRoute(routeId) {
  var url = MBTA_API_ROOT_URL + "vehiclesbyroute" + "?api_key=" + MBTA_API_KEY + "&route=" + routeId + "&format=json";

  HTTP.get(url,
    function (error, result) {
      serverStatus.errorCode = result ? result.statusCode : 0;
      if (!error) {

        var content = JSON.parse(result.content);
        //console.log('getVehiclesByRoute: ' + JSON.stringify(content, null, 2));

        // Save a list of existing trips.
        var oldTripIds = Trips.find({route_id: content.route_id}).map(function(trip) {
          return trip.trip_id;
        });
        var newTripIds = [];

        // Update/create Trips collection.
        content.direction.forEach(function(direction) {
          direction.trip.forEach(function(trip) {
            trip.route_id = content.route_id;
            Trips.upsert({ trip_id: trip.trip_id }, trip, { upsert: true });
            newTripIds.push(trip.trip_id);
          })
        });

        // Remove trips that were not included in this update.  Assume they've gone
        // underground or have been taken out of service etc...
        oldTripIds.forEach(function(trip_id) {
          if(newTripIds.indexOf(trip_id) === -1) {
            //console.log('--Removing: ' + trip_id)
            Trips.remove({trip_id: trip_id})
          }
        })
      }
      else {
        console.log("Vehicles:API request error: " + error)
        serverStatus.errorMessage = error;
      }
    });
}

function sendRequests() {
  //console.log('== sendRequests')
  getVehiclesByRoute('Green-B');
  getVehiclesByRoute('Green-C');
  getVehiclesByRoute('Green-D');
  getVehiclesByRoute('Green-E');
  getVehiclesByRoute('Red');
  getVehiclesByRoute('Orange');
  getVehiclesByRoute('Blue');  
}

var openConnectionsCount = 0;

Meteor.onConnection(function(connection) {
  openConnectionsCount++;

  // Start the timer if it's not already running.
  if(requestIntervalHandle === null) {
    //sendRequests();
    requestIntervalHandle = Meteor.setInterval(sendRequests, 10000);    
    console.log('== Vehicles:Requests started');
  }

  connection.onClose(function(arg) {
    console.log("== Vehicles:Connection closed: " + connection.id + " " + connection.clientAddress);

    openConnectionsCount--;

    // Shutdown the request timer if no more connections to avoid unnecessary API calls.
    if(openConnectionsCount == 0 && requestIntervalHandle !== null) {
      Meteor.clearInterval(requestIntervalHandle);
      requestIntervalHandle = null;
      console.log('== Vehicles:Requests stopped');
    }
  }.bind(connection))
})