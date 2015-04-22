console.log("== client.js " )

//Vehicles = new Meteor.Collection("vehicles");

//Vehicles.find({})

Template.vehiclesTemplate.helpers({
  vehicles: function() { return Vehicles.find({}) }
});

