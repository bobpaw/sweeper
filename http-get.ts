var http_get = (function () {
    function read (names, link = window.location.search) {
        // names should be an array of strings to search for
        // link is the search field (if you're actually reading HTTP-GET vars, you shouldn't need to change it).
	var gets = {};
	for (var i = 0; i < names.length; i++) {
		if (link.search(names[i]) !== -1) {
			gets[names[i]] = link.substring((link.search(names[i]) + names[i].length + 1), link.indexOf("&", link.search(names[i])) === -1 ? undefined : link.indexOf("&", link.search(names[i])));
		} else {
			gets[names[i]] = undefined;
		}
	}
	return gets;
    }
    return {
        read: read
    }
})();
