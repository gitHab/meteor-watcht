// Global
routesOnMapReady = function() {
  console.log('==routes-server:routesOnMapReady')
  Routes.find({mode_name: 'Subway'}).forEach(function(route) {
    console.log('route: ' + route.route_id)
    route.stops.direction.forEach(function(direction) {
      direction.stop.forEach(function(stop) {

        createStopMarker(stop);
      })
    })
  })
}

function createStopMarker(stop) {
  console.log('createStopMarker: ' + stop.stop_name)
    var map = GoogleMaps.maps.vehicleMap.instance;
    var latLng = new google.maps.LatLng(parseFloat(stop.stop_lat), parseFloat(stop.stop_lon));
    var marker = new google.maps.Marker({
      position: latLng,
      title: stop.stop_name,
      map: map
//      icon: getVehicleIcon(fields.vehicle.vehicle_bearing, fields.route_id),
    });

    var infowindow = new google.maps.InfoWindow({
      content: "<b>" + stop.stop_name + " </b>"
    });

    google.maps.event.addListener(marker, 'click', function() {
      infowindow.open(map, marker);
    });
}