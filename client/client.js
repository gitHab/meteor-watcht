console.log("== client.js " )

Template.vehiclesTemplate.helpers({
  vehicles: function() { return Vehicles.find({}) }
});

