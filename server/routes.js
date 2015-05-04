
Meteor.startup(function () {
  console.log("Routes:Meteor.startup")

  Routes.remove({});

  getRoutes();
});

function getRoutes() {
  var url = MBTA_API_ROOT_URL + "routes" + "?api_key=" + MBTA_API_KEY + "&format=json";

  HTTP.get(url,
    function (error, result) {
      if (!error) {

        //var content = JSON.parse(result.content);
        console.log('getRoutes: ' + JSON.stringify(content, null, 2));

        // Update/create Trips collection.
        content.mode.forEach(function(mode) {
          mode.route.forEach(function(route) {
            route.route_type = mode.route_type;
            route.mode_name = mode.mode_name;
            Routes.insert(route);
          })
        });
        console.log('== routes count: ' + Routes.find().count())
      }
      else {
        console.log("Routes:API request error: " + error)
      }
    });
}

