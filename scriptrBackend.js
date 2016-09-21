var http = require('http');

var pitneyBowesAuthorizationToken = "";  // insert pitney bowes authorization token
var uberAuthorizationToken = ""; // insert uber authorization token

if (pitneyBowesAuthorizationToken == "" || uberAuthorizationToken == "" ) {
  return "missing API tokens";
}

var lat = request.parameters.lat || 41.053430;
var lng = request.parameters.lng || -73.538734; 

pb_url = "https://api.pitneybowes.com/location-intelligence/geoenhance/v1/poi/bylocation?latitude="+lat+"&longitude="+lng+"&category=1011"

var pbRequestObject = {
  "url": pb_url,
  "headers": { "Authorization": "Bearer " + pitneyBowesAuthorizationToken },
  "method": "GET"
};

function getUberCost(lat1,lng1, lat2, lng2) {
  var uberUrl = "https://api.uber.com/v1/estimates/price?start_latitude=" + lat1 +
    "&start_longitude=" + lng1 + "&end_latitude=" + lat2 + "&end_longitude=" + lng2;
  
  var uberRequestObject = {
    "url": uberUrl,
    "headers": { "Authorization": "Token " + uberAuthorizationToken },
    "method": "GET"
  };

  uberResponse = http.request(uberRequestObject);
  uberXPriceEstimate = JSON.parse(uberResponse.body).prices[1].estimate;  
  return uberXPriceEstimate;
};

var makeUberLink = function(lat, lng, newLat, newLng) {
  var clientID = "puZyAyhffS72bGFBvSQiFHY6TXfgrBCa";
  var pickupName = 'Stamford Innovation center';
  
  // TODO: format this properly
  link = "https://m.uber.com/ul?client_id="+clientID+"&action=setPickup&pickup[latitude]="+lat+"&pickup[longitude]="+lng+"&pickup[nickname]="+pickupName+"&pickup[formatted_address]=175%20Atlantic%20Ave&dropoff[latitude]="+ newLat+"&dropoff[longitude]="+newLng+"&dropoff[nickname]=Stamford%20Tour&dropoff[formatted_address]=1%20Telegraph%20Hill%20Blvd%2C%20San%20Francisco%2C%20CA%2094133&product_id=a1111c8c-c720-46c3-8534-2fcdd730040d&link_text=View%20team%20roster&partner_deeplink=partner%3A%2F%2Fteam%2F9383"
  return link;
};

var result = [];

pb_response = http.request(pbRequestObject);

// Pick top 3
for(var i = 0; i < 3; i++) {
  console.log('-------------------- for loop ---------------');
  console.log(JSON.parse(pb_response.body).location);
  console.log(lat);
  data = JSON.parse(pb_response.body);  
  
  var info = data.location[i];
  var name = info.poi.name,
	  newLat = info.geometry.coordinates[1],
	  newLng = info.geometry.coordinates[0];
  console.log(newLat);
  var uberCost = getUberCost(lat,lng, newLat, newLng);
  var uberLink = makeUberLink(lat,lng, newLat, newLng);

  result.push(
    { 'name': name,
      'uberCost': uberCost,
      'uberLink': uberLink 
    });
};

return result;
