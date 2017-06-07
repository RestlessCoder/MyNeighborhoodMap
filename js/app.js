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

// Initialize the map
initMap();
