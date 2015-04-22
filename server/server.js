console.log("== server.js ")


var MBTA_API_KEY = "d_PLQUlAl0yu6cgQ_ITCMA";
var MBTA_API_ROOT_URL = "http://realtime.mbta.com/developer/api/v2/";


Meteor.startup(function () {
  console.log("Meteor.startup")

  var useTimer = false;
  if(useTimer) {
    Meteor.setInterval(function() {
      var vehicles = getVehiclesByRoute('Green-B');

    }, 3000);
  }
  else {
    Vehicles.remove({});
    var results = getVehiclesByRoute('Green-B');
  }
});


function getVehiclesByRoute(routeId) {
  var url = MBTA_API_ROOT_URL + "vehiclesbyroute" + "?api_key=" + MBTA_API_KEY + "&route=" + routeId + "&format=json";
  
  HTTP.get(url,
    function (error, result) {
      if (!error) {
        var content = JSON.parse(result.content);
        console.log('Got it: ' + JSON.stringify(content, null, 2));

        var routeName = content.route_name;
        console.log('==routeName = ' + routeName);

        content.direction.forEach(function(direction) {
          console.log('  ' + direction.direction_name);

          direction.trip.forEach(function(trip) {
            console.log('            vehicle= ' + trip.vehicle.vehicle_id + '  ' + trip.vehicle.vehicle_lat + '  ' + trip.vehicle.vehicle_lon)

            Vehicles.upsert({ vehicle_id: trip.vehicle.vehicle_id }, trip.vehicle, { upsert: true });
          })
        });
      }
    });
}


