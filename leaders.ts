function create_table (scores) {
    var stuff = "<table><tr>";
    for (var part in scores[0]) {
        stuff += "<th>" + part.replace(/\b\w/g, x => x.toUpperCase()) + "</th>";
    }
    stuff += "</tr>";
    scores.sort((a, b) => a.score / a.time - b.score / b.time);
    for (var i = 0; i < scores.length; i++) {
        stuff += "<tr>";
        for (var part in scores[i]) {
            if (part === "time") {
                if (scores[i][part] % 60 < 10) {
                    stuff += "<td>" + Math.floor(scores[i][part] / 60).toString() + ":0" + (scores[i][part] % 60).toString() + "</td>";
                } else {
                    stuff += "<td>" + Math.floor(scores[i][part] / 60).toString() + ":" + (scores[i][part] % 60).toString() + "</td>";
                }
            } else {
                stuff += "<td>" + scores[i][part].toString() + "</td>";
            }
        }
        stuff += "</tr>";
    }
    document.getElementById("content").innerHTML = stuff;
}

window.onload = function () {
    var scores = Array();
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            scores = JSON.parse(this.responseText);
            create_table(scores);
        }
    };
    xhttp.open("GET", "leaderboard.json", true);
    xhttp.send();
}
