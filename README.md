# view-at-home
A Tampermonkey script that allows you to view a Mastodon account through your own instance so you can favourite or comment on it

## How to install
1. Install the Tampermonkey extension for your browser
2. Right click on the extension icon and select "Create new script" or go to the Dashboard and click the + to create a new script.
3. Load the [RAW version of view_at_home.js](https://raw.githubusercontent.com/donnchawp/view-at-home/main/view_at_home.js) and copy that code into the Tampermonkey editor.
4. Examine the script to understand what it does as it requires some extra capabilities to operate.
5. The first time you use it, the script will ask for your home instance. Enter the hostname, without protocol. If it's in a sub-directory, include that too.
5. Load a Mastodon account where you're not logged in. Try my Mastodon account at [@donncha@mastodon.ie](https://mastodon.ie/@donncha) and say hi!

## Extra Capabilities Required
1. GM_xmlhttpRequest - required to send a search request to your home instance for the Mastodon account you're looking at.
2. GM_setValue and GM_getValue - required to save the name of your home instance to Local Storage.

I would be interested to hear if this works with other Fediverse servers.

[Donncha](https://odd.blog/)
