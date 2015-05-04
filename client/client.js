
Template.tripsTemplate.helpers({
  trips: function() { return Trips.find({}) },
  tripCount: function() { return Trips.find({}).count() }
});

Template.headerTemplate.events({
  'click .current-loc-btn': function () {
    console.log('-- Button clicked')
    goToCurrentLocation();
  }
});

Meteor.startup(function() {
  GoogleMaps.load();
});

var routeColors = {
  'Green-B': { fill: '#66aa66', stroke: '#003300' },
  'Green-C': { fill: '#66aa66', stroke: '#003300' },
  'Green-D': { fill: '#66aa66', stroke: '#003300' },
  'Green-E': { fill: '#66aa66', stroke: '#003300' },
  'Blue':    { fill: '#6666dd', stroke: '#000033' },
  'Red':     { fill: '#dd4444', stroke: '#330000' },
  'Orange':  { fill: '#FF8000', stroke: '#bb4000' },
}

// Global
getRouteColors = function(routeId) {
  return routeColors[routeId] || { fill: '#666666', stroke: '#000000' }
}

Template.body.helpers({
  mapOptions: function() {
    // Make sure the maps API has loaded
    if (GoogleMaps.loaded()) {
      console.log("==mapOptions loaded")

      // Map initialization options
      return {
        center: new google.maps.LatLng(42.3601, -71.0589),
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

    routesOnMapReady();
    tripsOnMapReady();
  });
});

var currentLocationMarker = null;

function goToCurrentLocation() {
  // Try HTML5 geolocation
  if(navigator.geolocation) {
    console.log('== Calling getCurrentPosition')
    navigator.geolocation.getCurrentPosition(function(position) {
      console.log('== Got current location: ' + JSON.stringify(position));
      var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

      GoogleMaps.maps.vehicleMap.instance.setCenter(pos);
      GoogleMaps.maps.vehicleMap.instance.setZoom(16);
      if(currentLocationMarker) {
        console.log('== Updating marker')
        // Update marker.
        currentLocationMarker.setPosition(pos);
      }
      else {
        console.log('== Creating marker')
        // Create current position marker.
        currentLocationMarker = new google.maps.Marker({
          position: pos,
          title: 'Current Position',
          map: GoogleMaps.maps.vehicleMap.instance,
        });

        navigator.geolocation.watchPosition(function(position) {
          var watchPos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
          currentLocationMarker.setPosition(watchPos);
        })
      }
    }, function() {
      console.log('Error: The Geolocation service failed.');
    });
  }
  else {
    console.log('Error: Your browser doesn\'t support geolocation.');
  }
}

