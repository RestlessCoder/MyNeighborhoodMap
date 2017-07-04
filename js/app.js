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
}

/* ========= ViewModel ========= */

// This AppViewModel function expression is used inside to bind the HTML
var AppViewModel = function() {
	var self = this;
	// Create a new blank for all the listing markers 
	var markers = [];

	var infoWindow = new google.maps.InfoWindow();

	// Creates an observable array to find various locations.
    self.locationList = ko.observableArray([]);

    // Boolean value for displaying venues list of location
    self.displayVenuesList = ko.observable('false');

    // Style the markers a bit. This will be our listing marker icon.
    var defaultIcon = makeMarkerIcon('F62217');

    // Create a "highlighted location" marker color for when the user
    // mouses over the marker.
    var highlightedIcon = makeMarkerIcon('0091ff');

	// Initially blank input
	self.exploreInputSearch = ko.observable('Sushi'); 

	// This will perform the search queries of a venue location 
	self.searchVenueLocations = function() {

		var fourSquareUrl = "https://api.foursquare.com/v2/venues/explore?";
		var fourSquareID = "client_id=4KRRWLQG1VJMY1GNF2CSWXNSPU5XRED3CFUACY4TOHZ53XOA&client_secret=LP11UFHMDQFYNYMYO42S4BD414ZJJQLMVK2OPNIEF0KIXEIJ&v=20170604";
		var limitSearch = "&limit=" + 20;
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
				// Get the lat position from the FourSquare API
				var lat = fourSquareData[i].venue.location.lat;
				// Get the lng position from the FourSquare SPI
				var lng = fourSquareData[i].venue.location.lng

				// Loop through the fourSquareData[i] & add the venue model value in an array and notifies observers
				self.locationList.push(new VenueModel(fourSquareData[i]));

				// Marker with name, address, phone, rating, url & categories
				var marker = new google.maps.Marker({
					icon: defaultIcon,
					position: new google.maps.LatLng(lat, lng),
					name: name,
					categories : categories,
					phone: formattedPhone,
					address: formattedAddress,
					rating: rating,
					url: url,
					map: map,
					animation: google.maps.Animation.DROP
				});

				// Push the marker to our array of markers
          		markers.push(marker);

          		// Create an onclick event to open an infowindow at each marker.
		        marker.addListener('click', function() {
		            setVenueInfoWindow(this, infoWindow);
		            toggleBounce(this);
		        });

		        // Two event listeners - one for mouseover, one for mouseout,
         		// to change the colors back and forth.
		        marker.addListener('mouseover', function() {
		        	this.setIcon(highlightedIcon);
		        });

          		marker.addListener('mouseout', function() {
            		this.setIcon(defaultIcon);
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

		}).error(function(e) {
			infoWindow.setContent('<div class="error-infowindow">FourSquare Data Not Available. Please try to refresh the page</div>');
			$('.fourSquareData-Error').text("Failed to load FourSquareData. Please try to refresh the page");
		});
	}


	// This function creates the infowindow when the individual marker is clicked. 
	function setVenueInfoWindow(marker, infowindow) {

		var contentString = '<div class="venue-infowindow">' + '<div class="venueName">' + marker.name 
																   + '<span class="venueRating">' + marker.rating + '</span></div>'
																   + '<div class="venueCategories">' + marker.categories 
																   + '<div class="venuePhone">' + marker.phone + '</div>'
																   + '<div class="venueAddress">' + marker.address + '</div>'
																   + '<div class="venueUrl">' + marker.url + '</div>'
																   + '</div>';
		// Check to make sure the infowindow is not already opened on this marker.														   
		if(infowindow.marker != marker) {
			infowindow.marker = marker;
			infowindow.setContent(contentString);
			infowindow.open(map, marker);
			// Make sure the marker property is cleared if the infowindow is closed
			infowindow.addListener('closeclick', function() {
				infowindow.setMarker = null;
			});
		}

		// Will handle all the marker data errors
		handleVenueDataError(marker);

	}

	// Update function for venues list display
	self.toggleList = function() {
        self.displayVenuesList(!self.displayVenuesList());
    };

	// This function will handle undefined data and reformatting the htmlString
	function handleVenueDataError(marker) {

		if(!marker.url) {
			$('.venueUrl').replaceWith("Website Not Available");
		}

		if(!marker.phone) {
			$('.venuePhone').replaceWith("Phone Not Available");
		}

		if(!marker.rating) {
			$('.venueRating').replaceWith("0.0");
		}
	}

	// This function will make the marker bounce when you click on them
	function toggleBounce(marker) {

       	if (marker.getAnimation() != null) {
            marker.setAnimation(null);
        } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function(){ marker.setAnimation(null); }, 2000);
        }
    }
        
	// This function will clear all the markers on the map
	function clearMarkers() {
		for (var i = 0; i < markers.length; i++ ) {
	     	markers[i].setMap(null);

	    }
	    // Resets the markers array
	    markers = [];
 	} 

 	// This function takes in a COLOR, and then creates a new marker
    // icon of that color. The icon will be 21 px wide by 34 high, have an origin
    // of 0, 0 and be anchored at 10, 34).
    function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
       	  'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
          	'|40|_|%E2%80%A2',
       	  new google.maps.Size(21, 34),
          new google.maps.Point(0, 0),
       	  new google.maps.Point(10, 34),
          new google.maps.Size(21,34));
        
        return markerImage;
    
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

