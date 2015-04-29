### WatchT

WatchT is a [Meteor](https://www.meteor.com/) app that displays a live view of Boston's MBTA trains on a Google Map.  It's 
not much to look at yet, I hope to make improvements real soon now.

**Note:** you'll need to insert your own MBTA API key in server/server.js (look for YOUR_MBTA_API_KEY) or pass
it in from the command line like this:

```
$ MBTA_API_KEY="your api key" meteor
```

Keys can be obtained here: [http://realtime.mbta.com/portal](http://realtime.mbta.com/portal).  The API has a default
limit of 10,000 requests per day.

Packages used:
- dburles:google-maps
- http
- less
- mquandalle:jade
- nemo64:bootstrap


My deployment can be found here: [watcht.meteor.com](http://watcht.meteor.com).
