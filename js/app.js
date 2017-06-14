/* ========= Model ========= */ 

// The Venue model that initialize and store venue information of the place 
var VenueModel = function(data) {

	this.name = ko.observable(data.venue.name);
	this.formattedAddress = ko.observable(data.venue.location.formattedAddress);
	this.url = ko.observable(data.venue.url);
	this.rating = ko.observable(data.venue.rating);
	this.categories = ko.observable(data.venue.categories[0].name);
	this.price = ko.observable(data.venue.price.currency);

}

/* ========= ViewModel ========= */

// This AppViewModel function expression is used inside to bind the HTML
var AppViewModel = function() {
	var self = this;
	// Create a new blank for all the listing markers 
	var markers = [];

	// Initially blank input
	self.exploreInputSearch = ko.observable(); 

	// This will perform the search popular venue location function
	self.searchVenueLocations = function() {

		var fourSquareUrl = "https://api.foursquare.com/v2/venues/explore?";
		var fourSquareID = "client_id=4KRRWLQG1VJMY1GNF2CSWXNSPU5XRED3CFUACY4TOHZ53XOA&client_secret=LP11UFHMDQFYNYMYO42S4BD414ZJJQLMVK2OPNIEF0KIXEIJ&v=20170604";
		var limitSearch = "&limit=" + 15;
		var location = "&near=belfast";
		// This will query the venues from the input 
		var query = "&query=" + self.exploreInputSearch();

		var fullUrl = fourSquareUrl + fourSquareID + location + limitSearch + query;
		//Retrieves JSON data from the FourSqaure API.
		$.getJSON(fullUrl, function(data) {
			// Can be find after ajax successfully called the URL in the GoogleDevTol in Network section (FourSquare API)
			var fourSquareData = data.response.groups[0].items;
 			
			for (var i = 0; i < fourSquareData.length; i++) {
				// Get the lat position from the FourSquare API
				var lat = fourSquareData[i].venue.location.lat;
				// Get the lng position from the FourSquare SPI
				var lng = fourSquareData[i].venue.location.lng;

				var name = fourSquareData[i].venue.name;

				console.log(name);
				var marker = new google.maps.Marker({
					position: new google.maps.LatLng(lat, lng),
					title: name,
					map: map,
					animation: google.maps.Animation.DROP
				});

				// Push the marker to our array of markers
          		markers.push(marker);

			} // End for loop
		});
	}
}	// End of AppViewModel

// Initialize the map
function initMap() {
	// Create a grey star marker
	var greyStar = {
		path: 'M 125,5 155,90 245,90 175,145 200,230 125,180 50,230 75,145 5,90 95,90 z',
		fillColor: 'grey',
		fillOpacity: 1,
		scale: 0.2
	};

	var mapOptions = {
		zoom: 14,
		center: {lat: 54.596724, lng: -5.930082},
		disableDefaultUI: true
	};

	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions); 

	// Create a marker for each place.
    var marker = new google.maps.Marker({
        map: map,
        icon: greyStar,
        position: {lat: 54.596724, lng: -5.930082}
    });

    $('#map-canvas').height($(window).height());

    //If the Google Maps API does not respond, it will load this error.
    if (typeof google == 'undefined') {
        $('#googleMap-Error').html('<h1>There are errors when retrieving map data. Please try again Later!</h1>'); 
    		return;
	}
}

// Initialize the map
initMap();

// This will apply the bindings for AppViewModel().
$(document).ready(function() {

    ko.applyBindings(new AppViewModel());

});

