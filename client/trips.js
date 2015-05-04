
// Trip id to marker associative map.
var tripMarkerMap = {};

// Return options for a Google marker for a vehicle.
function getVehicleIcon(bearing, routeId) {
  var routeColors = getRouteColors(routeId);

  return {
    path: 'M 11 0 L 15 11 L 15 22 L 6 22 L 6 11 z',
    scale: 0.7,
    fillColor: routeColors.fill,
    strokeColor: routeColors.stroke,
    fillOpacity: 1,
    rotation: parseFloat(bearing),
    anchor: new google.maps.Point(11, 11)
  }
}

function updateVehicleMarker(id, fields) {
  //console.log("=== updateVehicleMarker: ")
  //console.log("   vehicle=" + JSON.stringify(fields));

  if(tripMarkerMap[id] === undefined) {
    // We haven't seen this trip yet, create a marker for the vehicle.

    var map = GoogleMaps.maps.vehicleMap.instance;
    var latLng = new google.maps.LatLng(parseFloat(fields.vehicle.vehicle_lat), parseFloat(fields.vehicle.vehicle_lon));
    var marker = new google.maps.Marker({
      position: latLng,
      title: fields.trip_headsign,
      map: map,
      icon: getVehicleIcon(fields.vehicle.vehicle_bearing, fields.route_id),
    });

    var infowindow = new google.maps.InfoWindow({
      content: "<b>" + fields.trip_headsign + " </b>" + fields.vehicle.vehicle_id + "<br/>" + fields.trip_name
    });

    google.maps.event.addListener(marker, 'click', function() {
      infowindow.open(map, marker);
    });    

    tripMarkerMap[id] = marker;
  }
  else {
    // Update existing marker.

    if(fields.vehicle.vehicle_lat !== undefined && fields.vehicle.vehicle_lon !== undefined) {
      var latLng = new google.maps.LatLng(parseFloat(fields.vehicle.vehicle_lat), parseFloat(fields.vehicle.vehicle_lon));
      tripMarkerMap[id].setPosition(latLng);
    }
    if(fields.vehicle.vehicle_bearing !== undefined) {
      tripMarkerMap[id].setIcon(getVehicleIcon(fields.vehicle.vehicle_bearing, fields.route_id));
    }
  }
}

// Global
tripsOnMapReady = function() {
  Trips.find({}).observeChanges({
    added: function (id, fields) {
      // console.log("== observe: Trip added   " + fields.vehicle.vehicle_id + " id:" + id)
      if(fields.vehicle !== undefined)
        updateVehicleMarker(id, fields);
    },
    changed: function (id, fields) {
      // console.log("== observe: Trip changed " + fields.vehicle.vehicle_id + " id:" + id)
      if(fields.vehicle !== undefined)
        updateVehicleMarker(id, Trips.findOne(id));
    },
    removed: function (id) {
      // console.log("== observe: Trip REMOVED " + id)
      if(tripMarkerMap[id] !== undefined) {
        tripMarkerMap[id].setMap(null);
        delete tripMarkerMap[id];
      }
    }
  });
}