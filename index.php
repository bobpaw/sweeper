<?php
$width = 10;
$height = 10;
$num_mines = 10;
$mines = array();
$true_num_mines = 0;
$boardmap = array();

// Get random mine positions
for ($i = 0; $i < $num_mines; $i++) {
    $mines[$i] = sprintf("%02d,$02d", rand(0, $width), rand(0, $height));
}

// Create board
for ($y = 0; $y < $height; $y++) {
    $boardmap[$y] = array();
    for ($x = 0; $x < $height; $x++) {
        $boardmap[$y][$x] = 0;
    }
}

// Assign mine values
for ($i = 0; $i < count($mines); $i++) {
    $boardmap[substr($mines[$i],3,2)][substr($mines[$i],0,2)] = "M";
}

// Assign numbers
for ($y = 0; $y < $height; $y++) {
    for ($x = 0; $x < $width; $x++) {
        $count = 0;
        if ($x > 0 and $boardmap[$y][$x-1] == "M") $count++;
        if ($y > 0 and $boardmap[$y-1][$x] == "M") $count++;
        if ($x < $width and $boardmap[$y][$x+1] == "M") $count++;
        if ($y < $width and $boardmap[$y+1][$x] == "M") $count++;
        if ($x > 0 and $y > 0 and $boardmap[$y-1][$x-1] == "M") $count++;
        if ($x > 0 and $y < $width and $boardmap[$y+1][$x-1] == "M") $count++;
        if ($x < $width and $y > 0 and $boardmap[$y-1][$x+1] == "M") $count++;
        if ($x < $width and $y < 0 and $boardmap[$y-1][$x-1] == "M") $count++;
        $boardmap[$y][$x] = $count;
    }
}
?>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
    <meta name="author" content="Aiden Woodruff">
    <title>Minesweeper</title>
    <link type="text/css" rel="stylesheet" href="tiles.css">
    <script type="application/javascript" src="sweeper.js">
    var unrevealeds = document.getElementsByClassName('unrevealed');

function reveal (object) {
    object.classList.remove('unrevealed');
    object.classList.add('revealed');
    object.removeEventListener('click', reveal);
    if (object.classList.contains('n0')) {
        object.innerHTML = "0";
    } else if (object.classList.contains('n1')) {
        object.innerHTML = "1";
    } else if (object.classList.contains('n2')) {
        object.innerHTML = "2";
    } else if (object.classList.contains('n3')) {
        object.innerHTML = "3";
    } else if (object.classList.contains('n4')) {
        object.innerHTML = "4";
    } else if (object.classList.contains('n5')) {
        object.innerHTML = "5";
    }
}

for (var i = 0; i < unrevealeds.length; i++) {
    unrevealeds[i].addEventListener('click', reveal);
}
</script>
</head>
<body>
<h1>Minesweeper</h1>
<table class="board">
<?php
    for ($y = 0; $y < $height; $y++) {
        echo("<tr>\n");
        for ($x = 0; $x < $width; $x++) {
            echo("<td class='unrevealed n" . $boardmap[$y][$x] . "'></td>\n");
        }
        echo("</tr>\n");
    }
?>
</table>
</body>
</html>
