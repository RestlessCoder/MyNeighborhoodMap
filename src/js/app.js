/* ========= Model ========= */ 

// The Venue model that initialize and store venue information of the place 
// Constructor uses ko.observable so view is automatically updated
// https://discussions.udacity.com/t/having-trouble-accessing-data-outside-an-ajax-request/39072/10
var VenueModel = function(data) {
  this.id = data.venue.id;
  this.name = data.venue.name;
  this.formattedAddress = data.venue.location.formattedAddress;
  this.categories = data.venue.categories[0].name;
  this.lat = data.venue.location.lat;
  this.lng = data.venue.location.lng;
  this.marker = new google.maps.Marker({});
  // Get image for fourSquare
  this.imgPrefix = data.venue.categories[0].icon.prefix;
    this.imgSuffix = data.venue.categories[0].icon.suffix;
  
  // Handle undefined data and reformating the text
  this.url = this.getUrl(data);
  this.rating = this.getRating(data);
  this.formattedPhone = this.getFormattedPhone(data);
  this.imgSrc = this.getImgSrc(data);

};

// Credit by lei-clearsky github
VenueModel.prototype = {

  getUrl: function(data) {
    if(!data.venue.url) {
      return 'Website Not Available';
    } else {
      return data.venue.url;
    }
  },

  getImgSrc: function(data) {
    return this.imgPrefix + 'bg_64' + this.imgSuffix;
  },

  getFormattedPhone: function(data) {
    if(!data.venue.contact.formattedPhone) {
      return 'Phone Not Available';
    } else {
      return data.venue.contact.formattedPhone;
    }
  },

  getRating: function(data) {
    if(!data.venue.rating) {
      return '0.0';
    } else {
      return data.venue.rating;
    }
  }

};

/* ========= ViewModel ========= */

// This AppViewModel function expression is used inside to bind the HTML
var AppViewModel = function() {
  var self = this;

  var marker;

  // Create a new blank for all the listing markers 
  var markers = [];

  var infoWindow = new google.maps.InfoWindow();

  // Creates an observable array to find various locations.
    self.locationList = ko.observableArray([]); 

    // Boolean value for displaying venues list of location
    self.displayVenuesList = ko.observable('true');

    // Initially blank input
    self.filter = ko.observable('');

    // Style the markers a bit. This will be our listing marker icon.
    var defaultIcon = makeMarkerIcon('F62217');

    // Create a "highlighted location" marker color for when the user
    // mouses over the marker.
    var highlightedIcon = makeMarkerIcon('0091ff');

  // Initially blank input
  self.exploreInputSearch = ko.observable(''); 

  /* This will perform the search queries of a venue location and
  *  also create Venue markers on map with all the necessary data
    *  when this venue marker click, it will open the infowindow, set the marker
    *  bounce and move to the center of the venue marker that have been clicked
    */
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

    // Removes all values and returns them as an empty array.
    self.locationList.removeAll();

    // Retrieves JSON data from the FourSquare API.
    $.getJSON(fullUrl, function(data) {
      // Can be find after ajax successfully called the URL in the GoogleDevTol in Network section (FourSquare API)
      var fourSquareData = data.response.groups[0].items;

      for (var i = 0; i < fourSquareData.length; i++) {
        var id = fourSquareData[i].venue.id;
        var name = fourSquareData[i].venue.name;
        var formattedAddress = fourSquareData[i].venue.location.formattedAddress;
        var formattedPhone = fourSquareData[i].venue.contact.formattedPhone;
        var url = fourSquareData[i].venue.url;
        var rating = fourSquareData[i].venue.rating;
        var categories = fourSquareData[i].venue.categories[0].name;
        // Get the lat position from the FourSquare API
        var lat = fourSquareData[i].venue.location.lat;
        // Get the lng position from the FourSquare SPI
        var lng = fourSquareData[i].venue.location.lng;
        
        var placeMarker =  new google.maps.LatLng(lat, lng);

        // Marker with name, address, phone, rating, url & categories
        marker = new google.maps.Marker({
          icon: defaultIcon,
          id: id,
          position: placeMarker,
          name: name,
          categories : categories,
          phone: formattedPhone,
          address: formattedAddress,
          rating: rating,
          url: url,
          map: map,
          animation: google.maps.Animation.DROP
        });

        // Loop through the fourSquareData[i] & add the venue model value in an array & also add fourSquareID and notifies observers
        self.locationList.push(new VenueModel(fourSquareData[i]));

        self.locationList()[i].marker = marker;

        // Push the marker to our array of markers
          markers.push(marker);

            // Create an onclick event to open an infowindow at each marker.
            marker.addListener('click', openInfoWindow);

          // Two event listeners - one for mouseover, one for mouseout,
          // to change the colors back and forth.
            marker.addListener('mouseover', setHighlightedIcon);
            marker.addListener('mouseout', setDefaultIcon);

          // set bounds according to suggestedBounds from foursquare data response
        var suggestedBounds = data.response.suggestedBounds;
        if (suggestedBounds !== undefined) {
          bounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(suggestedBounds.sw.lat, suggestedBounds.sw.lng),
            new google.maps.LatLng(suggestedBounds.ne.lat, suggestedBounds.ne.lng));
          map.fitBounds(bounds);
        }   

      } // End for loop

    }).fail(function(e) {
      infoWindow.setContent('<div class="error-infowindow">FourSquare Data Not Available. Please try to refresh the page</div>');
      $('.fourSquareData-Error').text("Failed to load FourSquareData. Please try to refresh the page");
    });
  };

  // Will perform the search when visiting the page
    self.searchVenueLocations();

  // This function creates the infowindow when the individual marker is clicked. 
  function setVenueInfoWindow(marker, infowindow) {

    var contentString = '<div class="venue-infowindow">' + '<div class="venueName">' + marker.name + '<span class="venueRating right"><i class="icon-star" aria-hidden="true"> ' + marker.rating + '</i></span></div>' +
                '<div class="venueCategories"><i class="icon-tags" aria-hidden="true"></i> ' + marker.categories + '</div>' + '<div class="venueAddress"><i class="icon-map-marker" aria-hidden="true"></i> ' + marker.address + '</div>' +
                '<div class="venuePhone"><i class="icon-phone" aria-hidden="true"></i> ' + marker.phone + '</div>' + '<div class="venueUrl"><i class="icon-globe" aria-hidden="true"></i> ' + '<a href=' + marker.url + ' target="_blank">' + marker.url + '</a></div>' + '<br><div id="pano"></div></div>';  

    // Check to make sure the infowindow is not already opened on this marker.                               
    if(infowindow.marker != marker) {
      infowindow.marker = marker;
      // Clear the infowindow content to give the streetview time to load.
      infowindow.setContent('');
      infowindow.marker = marker;
      // Make sure the marker property is cleared if the infowindow is closed
      infowindow.addListener('closeclick', function() {
        infowindow.setMarker = null;
      });

      var streetViewService = new google.maps.StreetViewService();
          var radius = 50;
          // In case the status is OK, which means the pano was found, compute the
          // position of the streetview image, then calculate the heading, then get a
          // panorama from that and set the options
          var getStreetView = function(data, status) {
              if (status == google.maps.StreetViewStatus.OK) {
                  var nearStreetViewLocation = data.location.latLng;
                  var heading = google.maps.geometry.spherical.computeHeading(nearStreetViewLocation, marker.position);
                  infowindow.setContent(contentString);
                  // Will handle all the marker data errors
          handleVenueDataError(marker);
                  var panoramaOptions = {
                    position: nearStreetViewLocation,
                    pov: {
                      heading: heading,
                      pitch: 0
                    }
                  };
                  var panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'), panoramaOptions);
              } else {
                infowindow.setContent(contentString + '<div>No Street View Found</div>');
                // Will handle all the marker data errors
          handleVenueDataError(marker);
              }
            };
            // Use streetview service to get the closest streetview image within
            // 50 meters of the markers position
            streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
            // Open the infowindow on the correct marker.
            infowindow.open(map, marker);
    }
    
  }

  // This will filter the location list of venue with text input of the name's location
  self.filterResults = ko.computed(function() {

    var filter = self.filter().toLowerCase();

    if (filter === null) {
      
      return self.locationList();

    } else {
      return ko.utils.arrayFilter(self.locationList(), function(place) {
        // Hide the marker when the text input doesn't match the place name and show the marker 
        // with the closest place name
        if (place.name.toLowerCase().indexOf(filter) !== -1) {  
          place.marker.setVisible(true);
        } else {
          place.marker.setVisible(false);
        }

        // if there is a marker window open, close it
            infoWindow.close();

        return place.name.toLowerCase().indexOf(filter) !== -1; 

      });
    }

  });

  // When item is clicked in venues listing, panTo the venue marker on map, display infowindow & togglebounce
    self.panToMarker = function(venue) {
      google.maps.event.trigger(venue.marker,'click');
  };

  // Update function for venues list display
  self.toggleList = function() {
        self.displayVenuesList(!self.displayVenuesList());
    };

  // This function will handle undefined data and reformatting the htmlString
  function handleVenueDataError(marker) {

    if(!marker.url) {
      $('.venueUrl').replaceWith('<div class="venueUrl"><i class="icon-globe" aria-hidden="true"></i> Website Not Available</div>');
    }

    if(!marker.phone) {
      $('.venuePhone').replaceWith('<div class="venuePhone"><i class="icon-phone" aria-hidden="true"></i> Phone Not Available</div>');
    }

    if(!marker.rating) {
      $('.venueRating').replaceWith('<span class="venueRating right"><i class="icon-star" aria-hidden="true"></i> 0.0</span>');
    }
  }

  // This function will make the marker bounce when you click on them
  function toggleBounce(marker) {
        if (marker.getAnimation() !== null) {
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

  function openInfoWindow() {
    setVenueInfoWindow(this, infoWindow);
    toggleBounce(this);
  }

  function setDefaultIcon() {
    this.setIcon(defaultIcon);
  }

  function setHighlightedIcon() {
    this.setIcon(highlightedIcon);
  }

};  // End of AppViewModel

// Initialize the map
function initMap() {
  var mapOptions = {
    zoom: 14,
    center: {lat: 54.596724, lng: -5.930082},
    disableDefaultUI: true
  };

  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions); 

  ko.applyBindings(new AppViewModel());

}

//Alerts user of an error with google.
function googleMapError() {
    alert("Google Has Encountered An Error.  Please Try Again Later");
}



