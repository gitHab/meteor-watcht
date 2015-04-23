console.log("== client.js " )

Template.tripsTemplate.helpers({
  trips: function() { return Trips.find({}) }
});


Meteor.startup(function() {
  GoogleMaps.load();
});

Template.body.helpers({
  mapOptions: function() {
    // Make sure the maps API has loaded
    if (GoogleMaps.loaded()) {
      console.log("==mapOptions loaded")
      // Map initialization options
      return {
        center: new google.maps.LatLng(42.34004, -71.16006),
        zoom: 12
      };
    }
  }
});

// Vehicle id to marker associative map.
var vehicleMarkerMap = {};

function updateVehicleMarker(id, vehicle) {
  console.log("=== updateVehicleMarker: ")
  console.log("   vehicle=" + JSON.stringify(vehicle));


  if(vehicleMarkerMap[id] === undefined) {
    console.log("=== updateVehicleMarker: not found")

    // We haven't seen this vehicle yet, create a marker for it.
    var latLng = new google.maps.LatLng(parseFloat(vehicle.vehicle_lat), parseFloat(vehicle.vehicle_lon));
    var marker = new google.maps.Marker({
      position: latLng,
      map: GoogleMaps.maps.vehicleMap.instance
    });

    vehicleMarkerMap[id] = marker;
  }
  else {
    // Update the marker.
    console.log("=== updateVehicleMarker: found")

    if(vehicle.vehicle_lat !== undefined && vehicle.vehicle_lon !== undefined) {
      var latLng = new google.maps.LatLng(parseFloat(vehicle.vehicle_lat), parseFloat(vehicle.vehicle_lon));
      vehicleMarkerMap[id].setPosition(latLng);
    }
  }
}

function observeTrips() {
  Trips.find({}).observeChanges({
    added: function (id, fields) {
      console.log("== observe: Trip added " + id)
      if(fields.vehicle !== undefined)
        updateVehicleMarker(id, fields.vehicle);
    },
    changed: function (id, fields) {
      console.log("== observe: Trip updated")
      if(fields.vehicle !== undefined)
        updateVehicleMarker(id, fields.vehicle);
    },
    removed: function (id) {
      console.log("== observe: Trip removed")
      delete vehicleMarkerMap[id];
    }
  });
}


Template.body.onCreated(function() {
  console.log("==onCreated ")
  // We can use the `ready` callback to interact with the map API once the map is ready.
  GoogleMaps.ready('vehicleMap', function(map) {
    // var vehicles = Vehicles.find({});
    // vehicles.forEach(function(vehicle) {
    //   updateVehicleMarker(vehicle);
    // });
    observeTrips();
  });
});
