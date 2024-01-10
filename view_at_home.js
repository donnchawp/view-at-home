// ==UserScript==
// @name         View Mastodon account through your own instance
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Add a "View at home" button when looking at a Mastodon account and it will bring you back to your home instance. It asks for your home instance on first run.
// @author       Donncha O Caoimh & chatGPT4
// @match        https://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    // Check if the home server is already set, otherwise ask the user
    var homeServer = GM_getValue('homeServer');
    if (!homeServer) {
        homeServer = prompt('Please enter your Mastodon home server (e.g., mastodon.ie):');
        GM_setValue('homeServer', homeServer);
    }

    // Regular expression to match the URL pattern
    var urlPattern = /^(https?):\/\/([a-zA-Z0-9.-]+)\/@([a-zA-Z0-9_]+)(\/\d+)?$/;
    var currentUrl = window.location.href;

    var match = currentUrl.match(urlPattern);
    if (match) {
        var protocol = match[1];
        var hostname = match[2];
        var username = match[3];

        // Create and style the loading message element
        var loadingMessage = document.createElement('div');
        loadingMessage.textContent = 'Loading...';
        loadingMessage.style.position = 'fixed';
        loadingMessage.style.top = '50px';
        loadingMessage.style.left = '10px';
        loadingMessage.style.zIndex = '1001';
        loadingMessage.style.display = 'none'; // Hidden initially
        document.body.appendChild(loadingMessage);

        // Create a new button element
        var loginButton = document.createElement('button');
        loginButton.textContent = 'View at Home';
        loginButton.style.position = 'fixed';
        loginButton.style.top = '10px';
        loginButton.style.left = '10px';
        loginButton.style.zIndex = '1000';

        // Add the button to the body
        document.body.appendChild(loginButton);

        // Add click event listener
        loginButton.addEventListener('click', function() {
            loadingMessage.style.display = 'block'; // Show loading message
            // Send request to Mastodon API
            GM_xmlhttpRequest({
                method: "GET",
                url: `${protocol}://${homeServer}/api/v2/search?q=${encodeURIComponent(currentUrl)}&resolve=true`,
                onload: function(response) {
                    loadingMessage.style.display = 'none'; // Hide loading message
                    var data = JSON.parse(response.responseText);
                    var newUrl = '';
                    if (data.statuses && data.statuses.length > 0) {
                        var newPostId = data.statuses[0]['id'];
                        newUrl = `${protocol}://${homeServer}/deck/@${username}@${hostname}/${newPostId}`;
                        window.location.href = newUrl;
                    } else {
                        console.error('No statuses found in API response.');
                        if ( data.accounts[0].acct ) {
                            newUrl = `${protocol}://${homeServer}/deck/@${data.accounts[0].acct}/`;
                            window.location.href = newUrl;
                        }
                    }
                },
                onerror: function(response) {
                    loadingMessage.style.display = 'none'; // Hide loading message
                    console.error('Error fetching API data:', response);
                }
            });
        });
    }
})();
