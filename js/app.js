/* ========= Model ========= */ 

// The Venue model that initialize and store venue information of the place 
// Constructor uses ko.observable so view is automatically updated
// https://discussions.udacity.com/t/having-trouble-accessing-data-outside-an-ajax-request/39072/10
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

	var infoWindow = new google.maps.InfoWindow();

	// Initially blank input
	self.exploreInputSearch = ko.observable('Sushi'); 

	// This will perform the search queries of a venue location 
	self.searchVenueLocations = function() {

		var fourSquareUrl = "https://api.foursquare.com/v2/venues/explore?";
		var fourSquareID = "client_id=4KRRWLQG1VJMY1GNF2CSWXNSPU5XRED3CFUACY4TOHZ53XOA&client_secret=LP11UFHMDQFYNYMYO42S4BD414ZJJQLMVK2OPNIEF0KIXEIJ&v=20170604";
		var limitSearch = "&limit=" + 15;
		var location = "&near=belfast";
		var radius = "&radius=" + 600;
		// This will query the venues from the input 
		var query = "&query=" + self.exploreInputSearch();

		var fullUrl = fourSquareUrl + fourSquareID + location + limitSearch + radius + query;
		
		clearMarkers();

		//Retrieves JSON data from the FourSqaure API.
		$.getJSON(fullUrl, function(data) {

			// Can be find after ajax successfully called the URL in the GoogleDevTol in Network section (FourSquare API)
			var fourSquareData = data.response.groups[0].items;
 		
			for (var i = 0; i < fourSquareData.length; i++) {
				var name = fourSquareData[i].venue.name;
				var formattedAddress = fourSquareData[i].venue.location.formattedAddress;
				var formattedPhone = fourSquareData[i].venue.contact.formattedPhone;
				var url = fourSquareData[i].venue.url;
				var rating = fourSquareData[i].venue.rating;
				var categories = fourSquareData[i].venue.categories[0].name;
				var price = fourSquareData[i].venue.price.currency;
				// Get the lat position from the FourSquare API
				var lat = fourSquareData[i].venue.location.lat;
				// Get the lng position from the FourSquare SPI
				var lng = fourSquareData[i].venue.location.lng;
				
				// Marker with name, address, rating & price
				var marker = new google.maps.Marker({
					position: new google.maps.LatLng(lat, lng),
					name: name,
					categories : categories,
					phone: formattedPhone,
					address: formattedAddress,
					rating: rating,
					price : price,
					url: url,
					map: map,
					animation: google.maps.Animation.DROP
				});

				// Push the marker to our array of markers
          		markers.push(marker);

          		// Create an onclick event to open an infowindow at each marker.
		        marker.addListener('click', function() {
		            setVenueInfoWindow(this, infoWindow);
		        });

				// set bounds according to suggestedBounds from foursquare data response
				var suggestedBounds = data.response.suggestedBounds;
				if (suggestedBounds != undefined) {
					bounds = new google.maps.LatLngBounds(
						new google.maps.LatLng(suggestedBounds.sw.lat, suggestedBounds.sw.lng),
						new google.maps.LatLng(suggestedBounds.ne.lat, suggestedBounds.ne.lng));
					map.fitBounds(bounds);
				}
			} // End for loop

		});
	}


	// This function creates the infowindow when the marker is clicked. We'll only allow
	function setVenueInfoWindow(marker, infowindow) {

		var contentString = '<div class="venue-infowindow">' + '<div class="venueName">' + marker.name 
																   + '<span class="venueRating">' + marker.rating + '</span></div>'
																   + '<div class="venueCategories">' + marker.categories 
																   + '<span class="venuePrice">' + marker.price + '</span></div>'
																   + '<div class="venuePhone">' + marker.phone + '</div>'
																   + '<div class="venueAddress">' + marker.address + '</div>'
																   + '<div class="venueUrl">' + marker.url + '</div>'
																   + '</div>';

		if(infowindow.marker != marker) {
			infowindow.marker = marker;
			infowindow.setContent(contentString);
			infowindow.open(map, marker);
			infowindow.addListener('closeclick', function() {
				infowindow.setMarker = null;
			});
		}

	}

	// This will clear all the markers on the map
	function clearMarkers() {
	for (var i = 0; i < markers.length; i++ ) {
	      markers[i].setMap(null);
	    }
	    // Resets the markers array
	    markers = [];
 	} 

}	// End of AppViewModel

// Initialize the map
function initMap() {

	var mapOptions = {
		zoom: 14,
		center: {lat: 54.596724, lng: -5.930082},
		disableDefaultUI: true
	};

	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions); 

    //If the Google Maps API does not respond, it will load this error.
    if (typeof google == 'undefined') {
        $('#googleMap-Error').html('<h1>There are errors when retrieving map data. Please try again Later!</h1>'); 
    		return;
	}
}


// This will apply the bindings for AppViewModel().
$(document).ready(function() {

	// Initialize the map
	initMap();
	ko.applyBindings(new AppViewModel());

});

