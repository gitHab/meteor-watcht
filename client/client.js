console.log("== client.js " )

Template.tripsTemplate.helpers({
  trips: function() { return Trips.find({}) }
});


Meteor.startup(function() {
  GoogleMaps.load();
});

// Trip id to marker associative map.
var tripMarkerMap = {};

function updateVehicleMarker(id, fields) {
  console.log("=== updateVehicleMarker: ")
  console.log("   vehicle=" + JSON.stringify(fields));


  if(tripMarkerMap[id] === undefined) {
    console.log("=== updateVehicleMarker: not found")

    // We haven't seen this trip yet, create a marker for the vehicle.
    var latLng = new google.maps.LatLng(parseFloat(fields.vehicle.vehicle_lat), parseFloat(fields.vehicle.vehicle_lon));
    var marker = new google.maps.Marker({
      position: latLng,
      title: fields.trip_headsign,
      map: GoogleMaps.maps.vehicleMap.instance
    });

    tripMarkerMap[id] = marker;
  }
  else {
    // Update the marker.
    console.log("=== updateVehicleMarker: found")

    if(fields.vehicle.vehicle_lat !== undefined && fields.vehicle.vehicle_lon !== undefined) {
      var latLng = new google.maps.LatLng(parseFloat(fields.vehicle.vehicle_lat), parseFloat(fields.vehicle.vehicle_lon));
      tripMarkerMap[id].setPosition(latLng);
    }
  }
}

function observeTrips() {
  Trips.find({}).observeChanges({
    added: function (id, fields) {
      console.log("== observe: Trip added " + id)
      if(fields.vehicle !== undefined)
        updateVehicleMarker(id, fields);
    },
    changed: function (id, fields) {
      console.log("== observe: Trip updated")
      if(fields.vehicle !== undefined)
        updateVehicleMarker(id, fields);
    },
    removed: function (id) {
      console.log("== observe: Trip removed")
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
    observeTrips();
  });
});

