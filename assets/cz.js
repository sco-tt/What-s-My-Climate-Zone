/* Google Address to coordinates code from:
http://krasimirtsonev.com/blog/article/GoogleMaps-JS-API-address-to-coordinates-transformation-text-to-LatLng
*/
(function() { // Begin scoping function
	
	var map = null;
	var returnedLocation;
	var locationsList;

	/*Initializing the map and input elements*/

	window.onload = function () {
	    // initialize the map
	    var mapHolder = document.getElementById("map-holder");
	    map = new google.maps.Map(
	        mapHolder,
	        {
	            zoom: 3,
	            mapTypeId: google.maps.MapTypeId.ROADMAP, 
	            zoomControl: true,
			    zoomControlOptions: {
				    style: google.maps.ZoomControlStyle.SMALL,
		            position: google.maps.ControlPosition.RIGHT_TOP
			    },
				panControl: true,
				panControlOptions: {
					position: google.maps.ControlPosition.TOP_RIGHT
			    },
	        }
	    );
					
	    // centering the map
	    map.setCenter(new google.maps.LatLng(20.2, 0.1));

	    // adding events
	    document.getElementById("search").onclick = function () {
	        var address = document.getElementById("searchtext").value;
	        addressToLocation(address, changeMapLocation);
	        clearResultsLaunchSpinner();
	    }
	    document.getElementById('searchtext').onkeydown = function (e) {
	        if (e.keyCode === 13) {
	            var address = document.getElementById("searchtext").value;
	            addressToLocation(address, changeMapLocation);
	            clearResultsLaunchSpinner();
	        }
	    };
	}

	function clearResultsLaunchSpinner () {
   	    Apollo.removeClass(document.body, 'showing-results');
		document.getElementById('locationName').innerHTML="";
		document.getElementById('zoneDescription').innerHTML="";
		document.getElementById('zoneOutput').innerHTML="";
		document.getElementById("debug").innerHTML="";
		document.getElementById("altIds").innerHTML="";
		Apollo.addClass(document.body, 'active');
	}

	/*Zooming to location and passing reults to climate zone query*/

	function changeMapLocation(locations, isAlt) {
		clearResultsLaunchSpinner();

	// isAlt determine if this is inputed through the search field or clicked on in the list of alternates
		
		if(locations && locations.length && isAlt == false) {
			//Redfine global var so it can be called at the end of Climate Zone query
			locationsList = locations;
			//Set up a marker and pan map to our best location
			var marker = new google.maps.Marker({
		        map: map,
		        position: locations[0].location
	        });
			returnedLocation = locations[0].text /**+ " " + locations[0].location.toString()**/;
			map.panTo(locations[0].location);
	        map.setZoom(8);
			var latAndLng = [locations[0].location.k, locations[0].location.B];
			rounder(latAndLng);  
		} 
		
		else if (isAlt == true) {
			var marker = new google.maps.Marker({
		        map: map,
		        position: locations.location
	        });
			returnedLocation = locations.text + " " + locations.location.toString();
			map.panTo(locations);
	        map.setZoom(8);
	    	var latAndLng = [locations.location.k, locations.location.B];
			rounder(latAndLng);  
		}
		
		else {
			describeClimatezone (null);
		}
	}

	function buildAltLocationsList (locations) {
			console.log("buildAltLocationsList fired");
			console.log(locations);
			//For loop to set list of alternate locations. location[0] not included -- this is the intial point
			log("Num of results: " + locations.length);
			var numOfLocations = locations.length;
			var listofAlts = document.getElementById("altIds");
			listofAlts.innerHTML = "";

			for(var i=1; i<numOfLocations; i++) {	
				var altLocation = locations[i].location;
				listofAlts.innerHTML += "<li id = alt" + i + ">" + locations[i].text + "</li>";
			} 
			
		//Event LIstening in a separate loops
		
			for(var i=1; i<numOfLocations; i++) {	
				(function (i) {
				    document.getElementById('alt' + i).onclick = function () {
				        if (window.console.firebug !== undefined) {
				            console.log(locations[i]);
				        }
				        else {
				            changeMapLocation(locations[i], true);
				        }
				    };
				})(i);
			} //End 2nd for loop
	}



	//Everything has to be rounded to nearest .25 or .75 to match the data
	function rounder (x) {
	    for (var i = 0; i < x.length; i++) {
	    var xDecimal = (x[i] % 1);
	        if (xDecimal >= 0 && xDecimal <= 0.5) {
	            x[i] += (0.25 - xDecimal);
	        }
	         if (xDecimal > 0.5 && xDecimal < 1) {
	            x[i] += (0.75 - xDecimal);
	        }
	        if (xDecimal >= -0.5 && xDecimal  < 0) {
	             x[i] += (-0.25 - xDecimal);
	         }
	        if (xDecimal > -1.00 && xDecimal < -0.5) {
	            x[i] += (-0.75 - xDecimal);
	       }
	    }
	    var lat = x[0];
	    var lng = x[1];
	   determineClimateZone(lat, lng);
	}

	//YQL query
	function determineClimateZone(lat, lng) {
	    var query = 'select zone from csv where url="https://sco-tt.github.io/What-s-My-Climate-Zone/assets/Koeppen-Geiger-ASCII-trimmed.csv" and columns="lat,lng,zone" and lat="'+ lat + '" and lng="' + lng + '"';
	    YUI().use("yql", function (Y) {
	           Y.YQL(query, function(results) {
		            climateZone = results.query.results.row.zone;
	                describeClimatezone (climateZone);
				});
			});
		}

	function describeClimatezone (climateZone) {
		var zoneOutput = document.getElementById('zoneOutput');
	    var zoneDescriptionDiv = document.getElementById('zoneDescription');
	    var locationName = document.getElementById('locationName');
	    var czArray = [
	        ["Af","Tropical rainforest"],
	        ["Am","Tropical monsoon"],
	        ["Aw","Tropical wet and dry or savanna"],
	        ["As","Tropical wet and dry or savanna ('summer' dry season)"],
	        ["BWh","Subtropical desert"],
	        ["BSh","Subtropical steppe"],
	        ["BWk","Mid-latitude desert"],
	        ["BSk","Mid-latitude steppe"],         
	        ["Csa","Mediterranean, hot summer"], 
	        ["Csb","Mediterranean, warm summer"],             
	        ["Cfa","Humid subtropical, no dry season"],
	        ["Cwa","Humid subtropical, dry winter"],
	        ["Cwb","Temperate highland tropical climate with dry winters"],
	        ["Cwc","Temperate highland tropical climate with dry winters"],
	        ["Cfb","Marine west coast, warm summer"],
	        ["Cfc","Marine west coast, cool summer"],
	        ["Dfa","Humid continental, no dry season, hot summer"],
	        ["Dfb","Humid continental, no dry season, warm summer"],
	        ["Dwa","Humid continental, severe dry winter, hot summer"],
	        ["Dwb","Humid continental, severe dry winter, warm summer"],         
	        ["Dfc","Subartic, severe winter, no dry season, cool summer"], 
	        ["Dfd","Subartic, severe very cold winter, no dry season, cool summer"],             
	        ["Dwc","Subartic, dry winter, cool summer"],
	        ["Dsc","Subartic, subalpine?"],
	        ["Dwd","Subartic, very cold and dry winter, cool summer"],
	        ["ET","Tundra"],
	        ["EF","Ice Cap"]
	];

		var zoneDescriptionText;
		for (var i = 0; i < czArray.length; i++) {
		    if (climateZone == czArray[i][0]) {
		        zoneDescriptionText = czArray[i][1];
		    }
		    else if (climateZone == null) {
		    	zoneDescriptionText = "Location Not Found! Look at an atlas!";
		    }
		}
		locationName.innerHTML = "Showing Results for: " + returnedLocation;
		zoneOutput.innerHTML = zoneOutput.innerHTML + climateZone;
	    zoneDescriptionDiv.innerHTML = zoneDescriptionDiv.innerHTML + zoneDescriptionText;	
	    Apollo.removeClass(document.body, 'active');	
	    Apollo.addClass(document.body, 'showing-results');	
	    buildAltLocationsList(locationsList);

	}
				
	// converting the address's string to a google.maps.LatLng object
	function addressToLocation(address, callback) {

		var geocoder = new google.maps.Geocoder();
		geocoder.geocode(
			{
				address: address
			}, 
			function(results, status) {
				var isAlt = false;
				var resultLocations = [];
				
				if(status == google.maps.GeocoderStatus.OK) {
					if(results) {
						var numOfResults = results.length;
						for(var i=0; i<numOfResults; i++) {
							var result = results[i];
							resultLocations.push(
								{
									text:result.formatted_address,
									addressStr:result.formatted_address,
									location:result.geometry.location,
									lat:result.geometry.location.lat(),
									lng:result.geometry.location.lng(),
								}
							);
						};
					}
				} else if(status == google.maps.GeocoderStatus.ZERO_RESULTS) {
					// address not found
				}
				
				if(resultLocations.length > 0) {
					callback(resultLocations, isAlt);
				} else {
					callback(null);
				}
			}
		);
	}

				//start Layers


	var layer = new google.maps.KmlLayer('https://sco-tt.github.io/What-s-My-Climate-Zone/Koeppen-Geiger-GE.kmz',
	{preserveViewport: true});


	//toggle layers
	function toggleLayer() {
	 if(layer.getMap()==null) {
	 layer.setMap(map);
	 google.maps.event.trigger(map, 'resize');
	 Apollo.addClass(document.getElementById("layer-toggle"), 'pure-button-active');	

	  }
	  else {
	     layer.setMap(null);
	     Apollo.removeClass(document.getElementById("layer-toggle"), 'pure-button-active');				

	  }
	}      
				
				
	function log(str, clear) {
		var debugHolder = document.getElementById("debug");
		if(clear) {
			debugHolder.innerHTML = "";
			zoneDescription.innerHTML = "";
			zoneOutput.innerHTML = "";
		}
		debugHolder.innerHTML = debugHolder.innerHTML + "<br />" + str;
	}

})();         // End scoping function
