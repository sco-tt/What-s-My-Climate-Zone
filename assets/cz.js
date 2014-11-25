/* Google Address to coordinates code from:
http://krasimirtsonev.com/blog/article/GoogleMaps-JS-API-address-to-coordinates-transformation-text-to-LatLng
*/
(function() { // Begin scoping function
	
	var map = null;
	var returnedLocation;
	var altLocationsList;
	var isAlt = false;

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

	    // Add event listeners

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

	function changeMapLocation(locations) {
	console.log('changeMapLocation  says isAlt: ' + isAlt);
		clearResultsLaunchSpinner();
		// isAlt determine if this is inputed through the search field or clicked on in the list of alternates and called from buildAltLocationsList()
		
		if(locations && locations.length && isAlt == false) {
			
			//Set up a marker and pan map to our best location
			var marker = new google.maps.Marker({
		        map: map,
		        position: locations[0].location
	        });
			returnedLocation = locations[0].text /**+ " " + locations[0].location.toString()**/;
			map.panTo(locations[0].location);
	        map.setZoom(8);
			rounder([locations[0].location.k, locations[0].location.B]);  
			//Redfine global var so it can be used at the end of Climate Zone query to to call buildAltLocationsList()
			altLocationsList = locations;
			
		} 
		
		else if (isAlt == true) {
			var marker = new google.maps.Marker({
		        map: map,
		        position: locations.location
	        });
			returnedLocation = locations.text + " " + locations.location.toString();
			map.panTo(locations);
	        map.setZoom(8);
			rounder([locations.location.k, locations.location.B]); 
		}
		
		else {
			describeClimatezone (null);
		}
	}

	function buildAltLocationsList (locations) {
		console.log('buildAltLocationsList Location says isAlt: ' + isAlt);
		console.log(locations);
		
		//Determine whether or not to include the 'best result' in altLocationsList or not

		var arrIndex;
		if (isAlt == false ) {
			arrIndex = 1;
		}
		else {
			arrIndex = 0;
		}

		document.getElementById("altIds").innerHTML = "";

		if (locations.length > 1) {
			log( (locations.length-arrIndex) + " alternate locations found. Click to search:");
				
			for(var i=arrIndex; i<locations.length; i++) {	
				var altLocation = locations[arrIndex].location;
				console.log(altLocation);
				document.getElementById("altIds").innerHTML += "<li id = alt" + i + "><a>" + locations[i].text + "</a></li>";
			}
			//Separate for loop to build the click handler for each li
			for(var i=arrIndex; i<locations.length; i++) {	
				(function (i) {
				    document.getElementById('alt' + i).onclick = function () {
				        if (window.console.firebug !== undefined) {
				            console.log(locations[i]);
				        }
				        else {
		        			isAlt = true;
				            changeMapLocation(locations[i]);
				        }
				    };
				})(i);
			} //End 2nd for loop
		}			
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

	   determineClimateZone(x[0], x[1]);
	}

	//YQL query
	function determineClimateZone(lat, lng) {
	    var query = 'select zone from csv where url="https://sco-tt.github.io/What-s-My-Climate-Zone/assets/Koeppen-Geiger-ASCII-trimmed.csv" and columns="lat,lng,zone" and lat="'+ lat + '" and lng="' + lng + '"';
	    YUI().use("yql", function (Y) {
	           Y.YQL(query, function(results) {
	                describeClimatezone (results.query.results.row.zone);
				});
			});
		}

	function describeClimatezone (climateZone) {
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

		document.getElementById('locationName').innerHTML = "Showing Results for: " + returnedLocation;
		document.getElementById('zoneOutput').innerHTML = document.getElementById('zoneOutput').innerHTML + climateZone;
	    document.getElementById('zoneDescription').innerHTML = document.getElementById('zoneDescription').innerHTML + zoneDescriptionText;	
	    
	    //Change classes in DOM to hide spinner
	    Apollo.removeClass(document.body, 'active');	
	    Apollo.addClass(document.body, 'showing-results');	
	    

	    //Now that the climate zone has been returned, call function to build a list of alternate locations returned by Google's Geocode
		buildAltLocationsList(altLocationsList);

	}
				
	// converting the address's string to a google.maps.LatLng object
	function addressToLocation(address, callback) {
		var isAlt = false;
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode(
			{
				address: address
			}, 
			function(results, status) {
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
					callback(resultLocations, false);
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
