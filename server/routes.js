
Meteor.startup(function () {
  console.log("Routes:Meteor.startup")

  Routes.remove({});

  getRoutes();
});

function getRoutes() {
  var url = MBTA_API_ROOT_URL + "routes" + "?api_key=" + MBTA_API_KEY + "&format=json";

  console.log('== getRoutes');
  HTTP.get(url,
    function (error, result) {
      if (!error) {

        var content = JSON.parse(result.content);
        //console.log('getRoutes: ' + JSON.stringify(content, null, 2));


        // Update/create Trips collection.
        content.mode.forEach(function(mode) {
          mode.route.forEach(function(route) {
            route.route_type = mode.route_type;
            route.mode_name = mode.mode_name;

            if(route.mode_name === 'Subway') {
              newRoute = Routes.insert(route);
              //console.log('== getRoutes: is subway route_id: ' + route.route_id + ' count:' + Routes.find().count());
              getStops(route.route_id);
            }
          })
        });
      }
      else {
        console.log("== Routes:getRoutes API request error: " + error)
      }
    });
}

function getStops(routeId) {
  var url = MBTA_API_ROOT_URL + "stopsbyroute" + "?api_key=" + MBTA_API_KEY + "&route=" + routeId + "&format=json";

  HTTP.get(url,
    function (error, result) {
      if (!error) {

        var content = JSON.parse(result.content);
        Routes.update({route_id: routeId}, {$set: {stops: content}})
        console.log('== getStops: routeId=' + routeId); // + ' ' + JSON.stringify(Routes.find({route_id: routeId}).fetch(), null, 2))
      }
      else {
        console.log("== Routes:getStops API request error: " + error)
      }
    }.bind(routeId));  
}

