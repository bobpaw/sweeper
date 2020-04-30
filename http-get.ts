export function read(names: string[], link: string = window.location.search) {
    // names should be an array of strings to search for
    // link is the search field (if you're actually reading HTTP-GET vars, you shouldn't need to change it).
    let gets = {};
    names.forEach(function (name: string): void {
        if (link.search(name) !== -1) {
            gets[name] = link.substring((link.search(name) + name.length + 1), link.indexOf("&", link.search(name)) === -1 ? undefined : link.indexOf("&", link.search(name)));
        } else {
            gets[name] = undefined;
        }
    });
    return gets;
}