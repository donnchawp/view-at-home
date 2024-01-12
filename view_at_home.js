// ==UserScript==
// @name         View a Mastodon account or post through your own instance
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Add a "View at home" button when looking at a Mastodon account and it will bring you back to your home instance. It asks for your home instance on first run.
// @author       Donncha O Caoimh & chatGPT4
// @match        https://*/@*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

( function() {
	'use strict';

	// Check if the home server is already set, otherwise ask the user
	var homeServer = GM_getValue('homeServer');
	if ( !homeServer ) {
		homeServer = prompt('Please enter your Mastodon home server (e.g., mastodon.ie):');
		GM_setValue( 'homeServer', homeServer );
	}

	// Regular expression to match the URL pattern
	var urlPattern = /^(https?):\/\/([a-zA-Z0-9.-]+)\/@([a-zA-Z0-9_]+)(\/\d+)?$/;
	var currentUrl = window.location.href;

	var match = currentUrl.match( urlPattern );
	if ( ! match ) {
		// end script if no match
		return;
	}

	var protocol = match[1];
	var hostname = match[2];
	var username = match[3];

	if ( hostname === homeServer ) {
		return;
	}

	// Create and style the loading message element
	var loadingMessage = document.createElement( 'div' );
	loadingMessage.textContent = 'Loading...';
	loadingMessage.style.position = 'fixed';
	loadingMessage.style.top = '50px';
	loadingMessage.style.left = '10px';
	loadingMessage.style.zIndex = '1001';
	loadingMessage.style.display = 'none'; // Hidden initially
	document.body.appendChild( loadingMessage );

	// Create a new button element
	var viewButton = document.createElement( 'button' );
	viewButton.textContent = 'View at Home';
	viewButton.style.position = 'fixed';
	viewButton.style.top = '10px';
	viewButton.style.left = '10px';
	viewButton.style.zIndex = '1000';

	// Create a new button element for resetting config
	var resetButton = document.createElement( 'button' );
	resetButton.textContent = 'Reset Config';
	resetButton.style.position = 'fixed';
	resetButton.style.top = '10px';
	resetButton.style.left = '110px'; // Adjust position so it does not overlap with the view button
	resetButton.style.zIndex = '1000';

	// Add the buttons to the body
	document.body.appendChild( viewButton );
	document.body.appendChild( resetButton );

	// Add click event listener
	viewButton.addEventListener( 'click', function() {
		loadingMessage.style.display = 'block'; // Show loading message
		// Send request to Mastodon API
		GM_xmlhttpRequest({
			method: "GET",
			url: `${protocol}://${homeServer}/api/v2/search?q=${encodeURIComponent(currentUrl)}&resolve=true`,
			onload: function( response ) {
				loadingMessage.style.display = 'none'; // Hide loading message
				var data = JSON.parse( response.responseText );
				var newUrl = '';
				if ( data.statuses && data.statuses.length > 0 ) {
					var newPostId = data.statuses[0]['id'];
					newUrl = `${protocol}://${homeServer}/deck/@${username}@${hostname}/${newPostId}`;
					window.location.href = newUrl;
				} else {
					console.error( 'No statuses found in API response.' );
					if ( data.accounts[0].acct ) {
						newUrl = `${protocol}://${homeServer}/deck/@${data.accounts[0].acct}/`;
						window.location.href = newUrl;
					}
				}
			},
			onerror: function( response ) {
				loadingMessage.style.display = 'none'; // Hide loading message
				console.error( 'Error fetching API data:', response );
			}
		});
	});

	// Add click event listener for resetting config
	resetButton.addEventListener( 'click', function() {
		var newHomeServer = prompt( 'Enter a new Mastodon home server:', homeServer );
		if ( newHomeServer && newHomeServer !== homeServer ) {
			GM_setValue( 'homeServer', newHomeServer );
			homeServer = newHomeServer;
			alert( 'Home server updated! Reload the page to see changes.' );
		}
	});
})();
