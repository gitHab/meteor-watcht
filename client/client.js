console.log("== client.js " )

Template.vehiclesTemplate.helpers({
  vehicles: function() { return Vehicles.find({}) }
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
        zoom: 14
      };
    }
  }
});

var vehicleMarkerMap = {};

function createVehicleMarker(id, fields) {
  console.log("=== createVehicleMarker: ")
  console.log("   fields=" + JSON.stringify(fields));


  if(vehicleMarkerMap[id] === undefined) {
    console.log("=== createVehicleMarker: not found")

    // We haven't seen this vehicle yet, create a marker for it.
    var latLng = new google.maps.LatLng(parseFloat(fields.vehicle_lat), parseFloat(fields.vehicle_lon));
    var marker = new google.maps.Marker({
      position: latLng,
      map: GoogleMaps.maps.vehicleMap.instance
    });

    vehicleMarkerMap[id] = marker;
  }
  else {
    // Update the marker.
    console.log("=== createVehicleMarker: found")

    var marker = vehicleMarkerMap[id];
    if(fields.vehicle_lat !== undefined && fields.vehicle_lon !== undefined) {
      var latLng = new google.maps.LatLng(parseFloat(fields.vehicle_lat), parseFloat(fields.vehicle_lon));
      marker.setPosition(latLng);
    }
  }
}

function observeVehicles() {
  Vehicles.find({}).observeChanges({
    added: function (id, fields) {
      console.log("== observe: Vehicle added " + id)
      createVehicleMarker(id, fields);
    },
    changed: function (id, fields) {
      console.log("== observe: Vehicle updated")
      createVehicleMarker(id, fields);
    },
    removed: function (id) {
      console.log("== observe: Vehicle removed")
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
    //   createVehicleMarker(vehicle);
    // });
    observeVehicles();
  });
});
