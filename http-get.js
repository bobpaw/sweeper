function read_http_get (names) {
	var gets = {};
	var link = window.location.search;
	for (var i = 0; i < names.length; i++) {
		if (link.search(names[i]) !== -1) {
			gets[names[i]] = link.substring((link.search(names[i]) + names[i].length + 1), link.indexOf("&", link.search(names[i])) === -1 ? undefined : link.indexOf("&", link.search(names[i])));
		} else {
			gets[names[i]] = undefined;
		}
	}
	return gets;
}
