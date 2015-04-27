console.log("== client.js " )

Template.tripsTemplate.helpers({
  trips: function() { return Trips.find({}) },
  tripCount: function() { return Trips.find({}).count() }
});


Meteor.startup(function() {
  GoogleMaps.load();
});

// Trip id to marker associative map.
var tripMarkerMap = {};

function getVehicleIcon(bearing) {
  return {
    path: 'M 11 0 L 16 11 L 16 22 L 5 22 L 5 11 z',
    scale: 0.7,
    fillColor: '#668866',
    strokeColor: '#000000',
    fillOpacity: 1,
    rotation: parseFloat(bearing),
    anchor: new google.maps.Point(11, 11)
  }
}

function updateVehicleMarker(id, fields) {
  //console.log("=== updateVehicleMarker: ")
  //console.log("   vehicle=" + JSON.stringify(fields));


  if(tripMarkerMap[id] === undefined) {
    //console.log("=== updateVehicleMarker: not found")

    var map = GoogleMaps.maps.vehicleMap.instance;

    // We haven't seen this trip yet, create a marker for the vehicle.
    var latLng = new google.maps.LatLng(parseFloat(fields.vehicle.vehicle_lat), parseFloat(fields.vehicle.vehicle_lon));
    var marker = new google.maps.Marker({
      position: latLng,
      title: fields.trip_headsign,
      map: map,
      icon: getVehicleIcon(fields.vehicle.vehicle_bearing),
      // icon: {
      //   path: google.maps.SymbolPath.CIRCLE,
      //   scale: 3
      // },
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
    // Update the marker.
    //console.log("=== updateVehicleMarker: found")

    if(fields.vehicle.vehicle_lat !== undefined && fields.vehicle.vehicle_lon !== undefined) {
      var latLng = new google.maps.LatLng(parseFloat(fields.vehicle.vehicle_lat), parseFloat(fields.vehicle.vehicle_lon));
      tripMarkerMap[id].setPosition(latLng);
    }
    if(fields.vehicle.vehicle_bearing !== undefined) {
      tripMarkerMap[id].setIcon(getVehicleIcon(fields.vehicle.vehicle_bearing));
    }
  }
}

function observeTrips() {
  Trips.find({}).observeChanges({
    added: function (id, fields) {
      console.log("== observe: Trip added   " + fields.vehicle.vehicle_id + " id:" + id)
      if(fields.vehicle !== undefined)
        updateVehicleMarker(id, fields);
    },
    changed: function (id, fields) {
      console.log("== observe: Trip updated " + fields.vehicle.vehicle_id + " id:" + id)
      if(fields.vehicle !== undefined)
        updateVehicleMarker(id, fields);
    },
    removed: function (id) {
      console.log("== observe: Trip REMOVED " + id)
      if(tripMarkerMap[id] !== undefined) {
        tripMarkerMap[id].setMap(null);
        delete tripMarkerMap[id];
      }
    }
  });
}

Template.body.helpers({
  mapOptions: function() {
    // Make sure the maps API has loaded
    if (GoogleMaps.loaded()) {
      console.log("==mapOptions loaded")

      // Map initialization options
      return {
        center: new google.maps.LatLng(42.34004, -71.16006),
        zoom: 12,
        styles: [
        {
          stylers: [
//          { hue: "#00ffee" },
          { saturation: -90 }
          ]
        },
        {
          featureType: "transit.line",
          stylers: [
            { saturation: 36 },
            { weight: 1.7 }
          ]
        },        
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [
          { lightness: 100 },
          { visibility: "simplified" }
          ]
        },
        {
          featureType: "road",
          elementType: "labels",
          stylers: [
          { visibility: "off" }
          ]
        }
        ]
      }
    }
  }
});

Template.body.onCreated(function() {
  console.log("==onCreated ")
  // We can use the `ready` callback to interact with the map API once the map is ready.
  GoogleMaps.ready('vehicleMap', function(map) {
    var transitLayer = new google.maps.TransitLayer();
    transitLayer.setMap(map.instance);

    observeTrips();
  });
});

