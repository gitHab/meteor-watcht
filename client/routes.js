// Global
routesOnMapReady = function() {
  console.log('==routes-server:routesOnMapReady')
  Routes.find({mode_name: 'Subway'}).forEach(function(route) {
    route.stops.direction.forEach(function(direction) {
      direction.stop.forEach(function(stop) {
        createStopMarker(stop, route.route_id);
      })
    })
  })
}

// Returns an SVG path for a circle.
//
function circlePath(cx, cy, r){
    return 'M '+cx+' '+cy+' m -'+r+', 0 a '+r+','+r+' 0 1,0 '+(r*2)+',0 a '+r+','+r+' 0 1,0 -'+(r*2)+',0';
}

// Return icon options for a Google marker for a subway stop.
//
function getStopIcon(routeId) {
  var routeColors = getRouteColors(routeId);

  return {
    path: circlePath(11, 11, 3),
    fillColor: routeColors.fill,
    strokeColor: routeColors.fill,
    fillOpacity: 1,
    anchor: new google.maps.Point(11, 11)
  }
}

function createStopMarker(stop, routeId) {
  //console.log('createStopMarker: ' + stop.stop_name + ' routeId: ' + routeId)
  var map = GoogleMaps.maps.vehicleMap;
  var latLng = new google.maps.LatLng(parseFloat(stop.stop_lat), parseFloat(stop.stop_lon));
  var marker = new google.maps.Marker({
    position: latLng,
    title: stop.stop_name,
    map: map.instance
    //icon: getStopIcon(routeId)
  });

  marker.infoWindowContent = "Station:<br/><b>" + stop.stop_name + " </b>";

  google.maps.event.addListener(marker, 'click', function() {
    map.infoWindow.close();
    map.infoWindow.setContent(marker.infoWindowContent);
    map.infoWindow.open(map.instance, marker);
  });
}
