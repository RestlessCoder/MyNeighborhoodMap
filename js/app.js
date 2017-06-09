	
// Create a new blank for all the listing markers in global scope
var markers = [];

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

}

function searchVenuesQuery() {

	var venueStr = $('#search-venues').val();

	var fourSquareUrl = "https://api.foursquare.com/v2/venues/search?";
	var fourSquareID = "client_id=4KRRWLQG1VJMY1GNF2CSWXNSPU5XRED3CFUACY4TOHZ53XOA&client_secret=LP11UFHMDQFYNYMYO42S4BD414ZJJQLMVK2OPNIEF0KIXEIJ&v=20170604";
	var limitSearch = 15;
	var fullUrl = fourSquareUrl + fourSquareID + "&near=belfast" + "&limit=" + limitSearch + "&query=" + venueStr;

	// FourSquare AJAX request AJAX by using JSONP allows you to specify a callback function that is passed your JSON object. 
	$.ajax({
		url: fullUrl,
		dataType : 'jsonp',
		success: function(data) {

			// Can be find after ajax successfully called the URL in the GoogleDevTol in Network section (FourSquare API)
			var locationMarkers = data.response.venues;

			clearOverlays();

			for(var i = 0; i < locationMarkers.length; i++) {
				// Get the lat position from the FourSquare API
				var lat = locationMarkers[i].location.lat;
				// Get the lng position from the FourSquare SPI
				var lng = locationMarkers[i].location.lng;
				// Get the place name from the FourSquare API
				var name = locationMarkers[i].name;

				var marker = new google.maps.Marker({
					position: new google.maps.LatLng(lat, lng),
					title: name,
					map: map,
					animation: google.maps.Animation.DROP
				});

				// Push the marker to our array of markers
          		markers.push(marker);
			}

		}

	});

	return false;

	// This will clear all the markers on the map
	function clearOverlays() {
	for (var i = 0; i < markers.length; i++ ) {
	      markers[i].setMap(null);
	    }
	    // Resets the markers array
	    markers = [];
 	} 
}

// Initialize the map
initMap();

